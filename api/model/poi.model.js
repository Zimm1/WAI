const mongoUtils = require('../utils/mongoUtils');

module.exports = {
    schema: {
        name: {
            type: String,
            required: true
        },
        location: {
            type: mongoUtils.locationSchema,
            required: true
        },
        categories: [{
            type: Number,
            ref: 'poi_category'
        }],
        clips: [{
            type: Number,
            ref: 'clip'
        }]
    },
    indexes: [
        {
            location: '2dsphere'
        }
    ]
};