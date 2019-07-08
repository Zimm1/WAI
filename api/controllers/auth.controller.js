const passport = require('passport');
const config = require('config');

const model = require("../model");
const expressUtils = require("../utils/expressUtils");
const ROLES = config.get("AUTH.ROLES");


function signup(req, res, next) {
    let user = new model.user({
        username: req.body.username,
        email: req.body.email,
        role: req.body.role != ROLES.ADMIN._id ? req.body.role : ROLES.CONSUMER._id     //TODO Check if role exists
    });
    user.setPassword(req.body.password);

    user.save().then((user) => {
        console.log(user);
        res.status(200).json({
            success: true,
            token : user.generateJwt(),
            user
        });
    }).catch((e) => {
        expressUtils.sendError(res, 400, e.message);
    });
}

function login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            expressUtils.sendError(res, 404, err.message);
            return;
        }

        if (!user) {
            expressUtils.sendError(res, 401, info);
            return;
        }

        res.status(200).json({
            success: true,
            token: user.generateJwt(),
            user
        });
    })(req, res);
}

module.exports = {
    signup,
    login
};