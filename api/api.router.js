const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const itemRouter = require('./routes/item.route');
const expressUtils = require("./utils/expressUtils");


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

router.use('/item', itemRouter);

router.get('/', ((req, res, next) => {
    res.status(200).json({
        success: true
    });
}));

router.get('/*', ((req, res, next) => {
    expressUtils.sendError(res,404);
}));

module.exports = router;