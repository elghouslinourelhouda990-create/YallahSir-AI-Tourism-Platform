const mongoose = require('mongoose');
const translatableSchema = require('./translatableSchema');

const notificationSchema = mongoose.Schema(
    {
        id_Notification: {
            type: Number,
            required: true,
            unique: true
        },
        user_id: {
            type: mongoose.Schema.Types.Mixed, // Can be ObjectId or Number
            default: null // null means global
        },
        isRead: {
            type: Boolean,
            default: false
        },
        type_Notification: translatableSchema,
        contenu_Notification: translatableSchema,
        date_envoi: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

// Mongoose model with explicitly defined collection name to match Compass
const Notification = mongoose.model('Notification', notificationSchema, 'notification');

module.exports = Notification;
