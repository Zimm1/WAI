const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

router.get('/', ((req, res, next) => {
    res.json({
        success: true
    });
}));

module.exports = router;