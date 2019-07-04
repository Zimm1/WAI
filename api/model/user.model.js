const authUtils = require('../utils/authUtils');
const config = require('config');

module.exports = {
    schema: {
        email: {
            type: String,
            unique: true,
            required: true
        },
        username: {
            type: String,
            unique: true,
            required: true
        },
        hash: {
            type: String,
            required: true,
            private: true
        },
        salt: {
            type: String,
            required: true,
            private: true
        },
        role: {
            type: Number,
            ref: 'role',
            required: true,
            default: config.get("AUTH.ROLES.CONSUMER._id")
        }
    },
    methods: {
        setPassword: function (password) {
            this.salt = authUtils.generateSalt();
            this.hash = authUtils.generateHash(password, this.salt);
        },
        checkPassword: function (password) {
            return this.hash === authUtils.generateHash(password, this.salt);
        },
        generateJwt: function () {
            return authUtils.generateJwt(this);
        }
    }
};