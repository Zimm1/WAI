module.exports = {
    schema: {
        url: {
            type: String,
            required: true
        },
        purpose: {          // what how why
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        audience: {
            type: String,
            required: true
        },
        detail: {
            type: Number,
            required: true
        },
        poi: {
            type: Number,
            ref: 'poi'
        },
    },
    init: [
        {
            _id: 1,
            url: "https://xd.com",
            purpose: "why",
            language: "ita",
            content: "his",
            audience: "all",
            detail: 1,
            poi: 24
        }
    ]
};