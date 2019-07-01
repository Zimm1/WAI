const express = require('express');
const router = express.Router();
const path = require('path');


router.use('/editor', express.static('editor'));
router.get('/editor*', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'editor/index.html'));
});

router.use(express.static('consumer'));
router.get('*', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'consumer/index.html'));
});

module.exports = router;