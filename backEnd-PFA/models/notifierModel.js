const mongoose = require('mongoose');

const notifierSchema = mongoose.Schema(
    {
        ID_USER: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        id_match: {
            type: Number
        },
        id_activite: {
            type: Number
        },
        id_transport: {
            type: Number
        },
        id_Notification: {
            type: Number
        },
        date_creation: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

// Mongoose model with explicitly defined collection name to match Compass
const Notifier = mongoose.model('Notifier', notifierSchema, 'notifier');

module.exports = Notifier;
