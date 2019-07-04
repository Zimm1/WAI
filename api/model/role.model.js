const config = require('config');

module.exports = {
    schema: {
        _id: {
            type: Number
        },
        name: {
            type: String,
            unique: true,
            required: true
        }
    },
    init: Object.values(config.get("AUTH.ROLES"))
};