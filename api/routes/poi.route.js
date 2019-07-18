const express = require('express');
const router = express.Router();

const model = require('../model');
const poiController = require('../controllers/poi.controller');
const expressUtils = require("../utils/expressUtils");


router.get('/:id(\\d+)/',
    poiController.get
);

router.put('/:id(\\d+)/', (req, res, next) => {
    if (req.params.id == null) {
        expressUtils.sendError(res, 400);
        return;
    }

    if (!req.body.name) {
        expressUtils.sendError(res, 400);
        return;
    }

    // noinspection JSCheckFunctionSignatures
    model.item.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    }, {new: true}).then((item) => {
        if (!item) {
            expressUtils.sendError(res, 404);
            return;
        }

        res.status(200).json({
            success: true,
            data: item
        });
    }).catch((e) => {
        console.error(e);
        expressUtils.sendError(res, 500);
    });
});

router.delete('/:id(\\d+)/', (req, res, next) => {
    if (req.params.id == null) {
        expressUtils.sendError(res, 400);
        return;
    }

    model.item.findByIdAndDelete(req.params.id).then((item) => {
        if (!item) {
            expressUtils.sendError(res, 404);
            return;
        }

        res.status(200).json({
            success: true,
            data: item
        });
    }).catch((e) => {
        console.error(e);
        expressUtils.sendError(res, 500);
    });
});

router.get('/',
    poiController.getAll
);

router.post('/',
    poiController.post
);


module.exports = router;