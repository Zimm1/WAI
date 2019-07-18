module.exports = {
    schema: {
        name: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        type: {
            type: Number,
            ref: 'type',
            required: true
        },
    }
};