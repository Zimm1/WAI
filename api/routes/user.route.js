const express = require('express');
const router = express.Router();
const config = require('config');

const userController = require('../controllers/user.controller');
const authUtils = require("../utils/authUtils");
const ROLES = config.get("AUTH.ROLES");


router.get('/:id(\\d+)/',
    userController.get
);

router.get('/',
    authUtils.auth().role(ROLES.ADMIN).check(),
    userController.getAll
);

module.exports = router;