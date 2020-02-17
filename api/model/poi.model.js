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
    },
    init: [
        {
            _id: 0,
            name: 'Duomo di Reggio Emilia',
            location: {
                type: 'Point',
                coordinates: [
                    10.63103,
                    44.69763
                ]
            },
            categories: [0]
        },
        {
            _id: 1,
            name: 'Palazzo del Comune (Reggio nell\'Emilia)',
            location: {
                type: 'Point',
                coordinates: [
                    10.630108,
                    44.697333
                ]
            },
            categories: [0]
        },
        {
            _id: 2,
            name: 'Basilica di San Prospero',
            location: {
                type: 'Point',
                coordinates: [
                    10.63285,
                    44.69705
                ]
            },
            categories: [2]
        },
        {
            _id: 3,
            name: 'Mapei Stadium - Città del Tricolore',
            location: {
                type: 'Point',
                coordinates: [
                    10.649722,
                    44.714722
                ]
            },
            categories: [1]
        },
        {
            _id: 4,
            name: 'Teatro Ariosto',
            location: {
                type: 'Point',
                coordinates: [
                    10.62868,
                    44.70085
                ]
            },
            categories: [0]
        },
        {
            _id: 5,
            name: 'Palazzo del Capitano del Popolo (Reggio Emilia)',
            location: {
                type: 'Point',
                coordinates: [
                    10.6312,
                    44.69847
                ]
            },
            categories: [0]
        },
        {
            _id: 6,
            name: 'Teatro municipale Romolo Valli',
            location: {
                type: 'Point',
                coordinates: [
                    10.631182,
                    44.70001
                ]
            },
            categories: [0]
        },
        {
            _id: 7,
            name: 'Battistero di San Giovanni Battista (Reggio Emilia)',
            location: {
                type: 'Point',
                coordinates: [
                    10.631044,
                    44.697989
                ]
            },
            categories: [2]
        },
        {
            _id: 8,
            name: 'Sinagoga di Reggio Emilia',
            location: {
                type: 'Point',
                coordinates: [
                    10.62854,
                    44.69986
                ]
            },
            categories: [2]
        },
        {
            _id: 9,
            name: 'Oratorio del Cristo',
            location: {
                type: 'Point',
                coordinates: [
                    10.62995,
                    44.69569
                ]
            },
            categories: [2]
        },
        {
            _id: 10,
            name: 'Ponti di Calatrava a Reggio Emilia',
            location: {
                type: 'Point',
                coordinates: [
                    10.63726,
                    44.72758
                ]
            },
            categories: [0]
        },
        {
            _id: 11,
            name: 'Teatro Cavallerizza',
            location: {
                type: 'Point',
                coordinates: [
                    10.62864,
                    44.70163
                ]
            },
            categories: [0]
        },
        {
            _id: 12,
            name: 'Tempio della Beata Vergine della Ghiara',
            location: {
                type: 'Point',
                coordinates: [
                    10.626111,
                    44.698889
                ]
            },
            categories: [2]
        },
        {
            _id: 13,
            name: 'Palazzo Cassoli',
            location: {
                type: 'Point',
                coordinates: [
                    10.634311,
                    44.699305
                ]
            },
            categories: [0]
        },
        {
            _id: 14,
            name: 'Chiesa di San Giorgio (Reggio Emilia)',
            location: {
                type: 'Point',
                coordinates: [
                    10.62977,
                    44.69646
                ]
            },
            categories: [2]
        },
        {
            _id: 15,
            name: 'Chiesa di Santo Stefano (Reggio Emilia)',
            location: {
                type: 'Point',
                coordinates: [
                    10.62542,
                    44.70017
                ]
            },
            categories: [2]
        },
        {
            _id: 16,
            name: 'Palazzo Tirelli (Reggio Emilia)',
            location: {
                type: 'Point',
                coordinates: [
                    10.6361,
                    44.6978
                ]
            },
            categories: [0]
        },
        {
            _id: 17,
            name: 'Piazza Fontanesi',
            location: {
                type: 'Point',
                coordinates: [
                    10.631111,
                    44.694722
                ]
            },
            categories: [0]
        },
        {
            _id: 18,
            name: 'Chiesa dei Santi Girolamo e Vitale',
            location: {
                type: 'Point',
                coordinates: [
                    10.63646,
                    44.69453
                ]
            },
            categories: [2]
        },
        {
            _id: 19,
            name: 'Chiesa dei Santi Carlo e Agata',
            location: {
                type: 'Point',
                coordinates: [
                    10.63208,
                    44.69634
                ]
            },
            categories: [2]
        }
    ]
};