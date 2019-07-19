module.exports = {
    schema: {
        name: {
            type: String,
            required: true
        },
        pois: [{
            type: Number,
            ref: 'poi'
        }],
    },
    init: [
        {
            _id: 0,
            name: 'A'
        },
        {
            _id: 1,
            name: 'B'
        }
    ]

};