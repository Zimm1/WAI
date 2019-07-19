const express = require('express');
const router = express.Router();

const poiController = require('../controllers/poi.controller');


router.get('/:id(\\d+)/',
    poiController.get
);

router.get('/',
    poiController.getAll
);

router.post('/',
    poiController.post
);


module.exports = router;