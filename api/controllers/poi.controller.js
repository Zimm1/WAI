const {check} = require('express-validator/check');

const model = require("../model");
const expressUtils = require("../utils/expressUtils");
const authUtils = require("../utils/authUtils");


const getAll = (req, res, next) => {
    model.poi.find({}).then((pois) => {
        res.status(200).json({
            success: true,
            count: pois.length,
            data: pois
        });
    }).catch((e) => {
        console.error(e);
        expressUtils.sendError(res, 500, e.message);
    });
};

const get = (req, res, next) => {
    if (req.params.id == null) {
        expressUtils.sendError(res, 400);
        return;
    }

    model.poi.findById(req.params.id).then((poi) => {
        if (!poi) {
            expressUtils.sendError(res, 404);
            return;
        }

        res.status(200).json({
            success: true,
            data: poi
        });
    }).catch((e) => {
        console.error(e);
        expressUtils.sendError(res, 500, e.message);
    });
};

const post = [
    authUtils.auth().role(authUtils.getRoles().ADMIN).check(),
    check('name', 'Name must be at least 3 characters long').not().isEmpty().isLength({min: 3}),
    check('lat', 'Latitude must be valid').not().isEmpty().isDecimal({decimal_digits: ',6'}).custom(value => value >= -90 && value <= 90),
    check('lng', 'Longitude must be valide').not().isEmpty().isDecimal({decimal_digits: ',6'}).custom(value => value >= -180 && value <= 180),
    check('type', 'Type is required').not().isEmpty().isInt(),
    expressUtils.validationErrors,
    (req, res, next) => {
        const poi = new model.poi({
            name: req.body.name,
            lat: req.body.lat,
            lng: req.body.lng,
            type: req.body.type
        });
        poi.save().then((poi) => {
            res.status(201).send({
                success: true,
                data: poi
            });
        }).catch((e) => {
            if (e.code === 11000 || e.code === 11001) {
                const duplicateField = mongoUtils.getFieldFromDuplicateError(e);
                expressUtils.sendError(res, 422, duplicateField + " already taken");
            } else {
                expressUtils.sendError(res, 422, e.message);
            }
        })
    }
];

module.exports = {
    getAll,
    get,
    post
};