const model = require("../model");
const authUtils = require("../utils/authUtils");
const expressUtils = require("../utils/expressUtils");


function getAll(req, res, next) {
    model.user.find({}).then((users) => {
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }).catch((e) => {
        console.error(e);
        expressUtils.sendError(res, 500);
    });
}

function get(req, res, next) {
    if (req.params.id == null) {
        expressUtils.sendError(res, 400);
        return;
    }

    if (req.user.role !== authUtils.getRoles().ADMIN._id && parseInt(req.params.id) !== req.user._id) {
        expressUtils.sendError(res, 401, "User id not authorized");
        return;
    }

    model.user.findById(req.params.id).then((user) => {
        if (!user) {
            expressUtils.sendError(res, 404);
            return;
        }

        res.status(200).json({
            success: true,
            data: user
        });
    }).catch((e) => {
        console.error(e);
        expressUtils.sendError(res, 500);
    });
}

module.exports = {
    getAll,
    get
};