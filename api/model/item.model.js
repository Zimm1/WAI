const mongoose = require('mongoose');

module.exports = {
    schema: {
        name: {
            type: String,
            index: true
        },
        equipped: Boolean,
        owner_id: {
            type: mongoose.Schema.Types.ObjectId,
            index: true
        },
        room_id: {
            type: mongoose.Schema.Types.ObjectId,
            index: true
        }
    }
};