module.exports = {
    schema: {
        name: {
            type: String,
            required: true
        },
        icon: {
            icon: {
                type: String,
                required: true,
                lowercase: true
            },
            markerColor: {
                type: String,
                required: true,
                lowercase: true
            }
        },
        pois: [{
            type: Number,
            ref: 'poi'
        }],
    },
    init: [
        {
            _id: 0,
            name: 'storia',
            icon: {
                icon: 'monument',
                markerColor: 'orange'
            }
        },
        {
            _id: 1,
            name: 'sport',
            icon: {
                icon: 'futbol',
                markerColor: 'green'
            }
        },
        {
            _id: 2,
            name: 'religione',
            icon: {
                icon: 'place-of-worship',
                markerColor: 'purple'
            }
        }
    ]

};
