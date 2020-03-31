const express = require('express');
const router = express.Router();

const clipController = require('../controllers/clip.controller');

/*
router.get('/:id(\\d+)/',
    clipController.get
);

router.put('/:id(\\d+)/',
    clipController.put
);

router.get('/',
    clipController.getAll
);
*/
router.post('/',
    clipController.post
);


module.exports = router;