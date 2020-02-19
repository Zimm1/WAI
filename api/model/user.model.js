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
    },
    init: [
        {
            "_id": 0,
            "role": 1,
            "username": "WheRE Admin",
            "email": "admin@whereggio.com",
            "salt": "d984c972e56d3b986ebc9270ab970ab8",
            "hash": "46333b9c079b84a1ac66a5a0adbc3965dacc3a224f130dd8e32997600523469ee3bc063fa14a0d98f533bc267fb51f3e6523b969a337e0f24f4593497aa065dd"
        }
    ]
};