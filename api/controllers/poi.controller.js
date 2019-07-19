const {body, query} = require('express-validator');

const model = require("../model");
const expressUtils = require("../utils/expressUtils");
const authUtils = require("../utils/authUtils");
const mongoUtils = require("../utils/mongoUtils");
const PAGINATION_LIMIT = require('config').get("API.PAGINATION.LIMIT");


const getAll = [
    query('page', 'Page must be a positive number').optional().isInt({min: 0}),
    query('limit', 'Page must be a number between 1 and ' + PAGINATION_LIMIT).optional().isInt({min: 1, max: PAGINATION_LIMIT}),
    query('lat', 'Latitude must be valid').optional().isDecimal({decimal_digits: '0,6'}).custom(
        (value) =>
            value >= -90 && value <= 90
    ),
    query('lng', 'Longitude must be valid').optional().isDecimal({decimal_digits: '0,6'}).custom(
        (value) =>
            value >= -180 && value <= 180
    ),
    query('lat', 'lng').optional(),
    expressUtils.checkValidation,
    (req, res, next) => {
        const locationMode = !isNaN(req.query.lat) + !isNaN(req.query.lng);
        if (locationMode === 1) {
            expressUtils.sendError(res, 422, "Latitude and longitude both must be set");
            return;
        }

        const pagination = {
            page: parseInt(req.query.page) || 0,
            limit: parseInt(req.query.limit) || PAGINATION_LIMIT
        };

        const query = model.poi.find();

        if (locationMode === 2) {
            query.where('location').near({
                center: mongoUtils.getLocationFromLatLng(req.query.lat, req.query.lng)
            });
        }

        query.skip(pagination.page * pagination.limit)
            .limit(pagination.limit)
            .populate({path:'categories', select: 'name'})
            .then((pois) => {
                res.status(200).json({
                    success: true,
                    paginator: {
                        page: pagination.page,
                        limit: pagination.limit
                    },
                    location: locationMode === 2 ? {
                        lat: parseInt(req.query.lat),
                        lng: parseInt(req.query.lng)
                    } : undefined,
                    count: pois.length,
                    data: pois
                });
        }).catch((e) => {
            console.error(e);
            expressUtils.sendError(res, 500, e.message);
        });
    }
];

const get = (req, res, next) => {
    if (req.params.id == null) {
        expressUtils.sendError(res, 400);
        return;
    }

    model.poi.findById(req.params.id).populate({path:'categories', select: 'name'}).then((poi) => {
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
    body('name', 'Name must be at least 3 characters long').not().isEmpty().isLength({min: 3}),
    body('lat', 'Latitude must be valid').not().isEmpty().isDecimal({decimal_digits: '0,6'}).custom(
        (value) =>
            value >= -90 && value <= 90
    ),
    body('lng', 'Longitude must be valid').not().isEmpty().isDecimal({decimal_digits: '0,6'}).custom(
        (value) =>
            value >= -180 && value <= 180
    ),
    body('categories', 'Categories must be valid').isArray().custom(
        (a) =>
            a.every((e) =>
                !isNaN(e) && e >= 0
            )
    ),
    expressUtils.checkValidation,
    (req, res, next) => {
        model.poi_category.find({'_id': {$in: req.body.categories}}).then((categories) => {
            if (categories.length < req.body.categories.length) {
                expressUtils.sendError(res, 422, "One or more categories don't exist");
                return;
            }

            const poi = new model.poi({
                name: req.body.name,
                location: mongoUtils.getLocationFromLatLng(req.body.lat, req.body.lng),
                categories: req.body.categories
            });

            poi.save().then((poi) => {
                Promise.all(categories.map((c) => {
                    c.pois.push(poi._id);
                    return c.save();
                })).then(() => {
                    poi.populate({path:'categories', select: 'name'}).execPopulate().then((poi) => {
                        res.status(201).send({
                            success: true,
                            data: poi
                        });
                    }).catch((e) => {
                        console.error(e);
                        expressUtils.sendError(res, 500, e.message);
                    });
                }).catch((e) => {
                    console.error(e);
                    expressUtils.sendError(res, 500, e.message);
                });
            }).catch((e) => {
                if (e.code === 11000 || e.code === 11001) {
                    const duplicateField = mongoUtils.getFieldFromDuplicateError(e);
                    expressUtils.sendError(res, 422, duplicateField + " already taken");
                } else {
                    expressUtils.sendError(res, 500, e.message);
                }
            });
        }).catch((e) => {
            console.error(e);
            expressUtils.sendError(res, 500, e.message);
        });
    }
];

module.exports = {
    getAll,
    get,
    post
};