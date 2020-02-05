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
    },
    indexes: [
        {
            location: '2dsphere'
        }
    ],
    virtuals: {
        clips: {
            ref: 'clip',
            localField: '_id',
            foreignField: 'poi',
            justOne: false
        }
    }
};