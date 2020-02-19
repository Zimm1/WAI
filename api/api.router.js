const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const authRouter = require('./routes/auth.route');
const poiRouter = require('./routes/poi.route');
const clipRouter = require('./routes/clip.route');
const userRouter = require('./routes/user.route');

const authUtils = require('./utils/authUtils');
const expressUtils = require("./utils/expressUtils");
const logUtils = require("./utils/logUtils");
const passportUtils = require("./utils/passportUtils");


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(logUtils.httpLogger);
router.use(passportUtils.initPassport());
router.use(authUtils.authInit);


router.use('/auth', authRouter);
router.use('/poi',  poiRouter );
router.use('/clip', clipRouter);
router.use('/user', userRouter);

router.get('/', ((req, res, next) => {
    res.status(200).json({
        success: true
    });
}));

router.get('/*', ((req, res, next) => {
    expressUtils.sendError(res,404);
}));

module.exports = router;