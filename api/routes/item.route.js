const express = require('express');
const router = express.Router();

const model = require('../model');


router.get('/', ((req, res, next) => {
    model.item.find({}).then((items) => {
        res.json({
            success: true,
            quantity: items.length,
            items
        });
    });
}));

module.exports = router;