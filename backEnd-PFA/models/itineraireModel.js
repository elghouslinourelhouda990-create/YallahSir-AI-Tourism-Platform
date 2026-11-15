const mongoose = require('mongoose');

const itineraireSchema = mongoose.Schema(
    {
        nom_itineraire: {
            type: String,
            required: true
        },
        nom_user: {
            type: String,
            required: true
        },
        date_creation: {
            type: Date,
            default: Date.now
        },
        lieux_choisis: [
            {
                type: Number,
            }
        ],
        ville: {
            type: String
        },
        description: {
            type: String
        },
        dateVisite: {
            type: String
        },
        duree: {
            type: Number,
            default: 0
        },
        budget: {
            type: Number,
            default: 0
        },
        type: {
            type: String
        },
        nombre_lieux: {
            type: Number,
            default: 0
        },
        cluster_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            default: null
        },
        // Adding user reference to ensure we can easily query "my itineraries"
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

// Mongoose model with explicitly defined collection name to match Compass
const Itineraire = mongoose.model('Itineraire', itineraireSchema, 'itineraire');

module.exports = Itineraire;
