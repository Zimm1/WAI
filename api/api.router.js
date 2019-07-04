const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const itemRouter = require('./routes/item.route');

const expressUtils = require("./utils/expressUtils");
const passportUtils = require("./utils/passportUtils");
const authUtils = require('./utils/authUtils');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(passportUtils.initPassport());
router.use(authUtils.authInit);


router.use('/auth', authRouter);
router.use('/user', userRouter);
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