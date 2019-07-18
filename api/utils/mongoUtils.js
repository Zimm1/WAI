const mongoose = require('mongoose');


const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
}, {
    toJSON: {
        transform: (doc, obj) => {
            return {
                lat: obj.coordinates[1],
                lng: obj.coordinates[0]
            }
        }
    }
});

const getLocationFromLatLng = (lat, lng) => ({
    type: 'Point',
    coordinates: [parseFloat(lng), parseFloat(lat)]
});

const getFieldFromDuplicateError = (error) => {
    const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i
    const match =  error.message.match(regex);
    const field = match[1] || match[2];

    return field&&field[0].toUpperCase()+field.slice(1);
};

module.exports = {
    locationSchema,
    getLocationFromLatLng,
    getFieldFromDuplicateError
};