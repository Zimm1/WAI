const passport = require('passport');
const {body} = require('express-validator');

const model = require("../model");
const expressUtils = require("../utils/expressUtils");
const authUtils = require("../utils/authUtils");
const mongoUtils = require("../utils/mongoUtils");


const signup = [
    body('username', 'Username must be between 3 and 20 characters long').not().isEmpty().isLength({min: 3, max: 20}),
    body('email', 'Email is not valid').not().isEmpty().isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').not().isEmpty().isLength({min: 6}),
    body('role', 'Role must be valid').optional().isInt().isIn(authUtils.getRoleIds()),
    expressUtils.checkValidation,
    (req, res, next) => {
        if (req.body.role === authUtils.getRoles().ADMIN._id) {
            expressUtils.sendError(res, 422, "Can't sign up as admin");
            return;
        }

        let user = new model.user({
            username: req.body.username,
            email: req.body.email,
            role: req.body.role
        });
        user.setPassword(req.body.password);

        user.save().then((user) => {
            res.status(200).json({
                success: true,
                token : user.generateJwt(),
                user
            });
        }).catch((e) => {
            if (e.code === 11000 || e.code === 11001) {
                const duplicateField = mongoUtils.getFieldFromDuplicateError(e);
                expressUtils.sendError(res, 422, duplicateField + " already taken");
            } else {
                expressUtils.sendError(res, 422, e.message);
            }
        });
    }
];

const login = [
    body('username', 'Username must be between 3 and 20 characters long').not().isEmpty().isLength({min: 3, max: 20}),
    body('password', 'Password must be at least 6 characters long').not().isEmpty().isLength({min: 6}),
    expressUtils.checkValidation,
    (req, res, next) => {
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
];

module.exports = {
    signup,
    login
};