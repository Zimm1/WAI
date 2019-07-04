const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('config');

const expressUtils = require('./expressUtils');

const HASH_ENCODING = 'hex';
const SALT_RANDOM_BYTES = 16;
const HASH_ITERATIONS = 1000;
const HASH_LENGTH = 64;
const HASH_DIGEST = 'sha512';


const authInit = [
    expressJwt({
        secret: config.get("AUTH.JWT_SECRET"),
        credentialsRequired: false
    }),
    (err, req, res, next) => {
        if (err.code === 'invalid_token') {
            req.user = {expired: true};
            return next();
        }
        return next(err);
    }
];

function auth() {
    this.roles = [];

    this.role = (role) => {
        if (!role in config.get("AUTH.ROLES")) {
            throw new Error("Role must be valid");
        }
        this.roles.push(role._id);
        return this;
    };

    this.check = () => {
        return (req, res, next) => {
            if (!req.user) {
                expressUtils.sendError(res, 401, "Authorization token not found");
                return;
            }

            if (req.user.expired) {
                expressUtils.sendError(res, 401, "Authorization token expired");
                return;
            }

            if (this.roles.length !== 0  && this.roles.indexOf(parseInt(req.user.role)) === -1) {
                expressUtils.sendError(res, 401, "User role not authorized");
                return;
            }

            next();
        }
    };

    return this;
}

function getExpiryDate() {
    let date = new Date();
    date.setSeconds(date.getSeconds() + config.get("AUTH.TOKEN_EXPIRE_SECONDS"));
    return date;
}

function generateSalt() {
    return crypto
        .randomBytes(SALT_RANDOM_BYTES)
        .toString(HASH_ENCODING);
}

function generateHash(string, salt) {
    return crypto
        .pbkdf2Sync(string, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST)
        .toString(HASH_ENCODING);
}

function generateJwt(user) {
    return jwt.sign({
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        exp: parseInt(getExpiryDate().getTime() / 1000),
    }, config.get("AUTH.JWT_SECRET"));
}

module.exports = {
    authInit,
    auth,
    generateSalt,
    generateHash,
    generateJwt
};