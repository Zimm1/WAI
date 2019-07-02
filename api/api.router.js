const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const itemRouter = require('./routes/item.route');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

router.use('/item', itemRouter);

router.get('/', ((req, res, next) => {
    res.json({
        success: true
    });
}));

router.get('/*', ((req, res, next) => {
    res.status(404).send();
}));

module.exports = router;