const mongoose = require('mongoose');
const mongoUtils = require('../utils/mongoUtils');

module.exports = {
    schema: {
        editor: {
            type: Number,
            ref: "user",
            required: true
        },
        poi: {
            type: Number,
            ref: "poi"
        },
        audio: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        audience: {
            type: String,
            required: true,
        },
        detail: {
            type: String,
            required: true,
        }
    }
};