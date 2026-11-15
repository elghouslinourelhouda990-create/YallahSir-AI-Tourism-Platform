const mongoose = require('mongoose');
const translatableSchema = require('./translatableSchema');

const matchSchema = mongoose.Schema(
    {
        id_match: {
            type: Number,
            required: true,
            unique: true
        },
        equipe_A: translatableSchema,
        equipe_B: translatableSchema,
        date_match: {
            type: String, // Keeping it string as per screenshot "30/06/2030", though Date is often better
            required: true
        },
        resultat_match: {
            type: String,
            default: "" // Default to empty if match hasn't happened yet
        },
        id_lieu: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: false,
        versionKey: false
    }
);

// Mongoose model with explicitly defined collection name to match Compass
const Match = mongoose.model('Match', matchSchema, 'match');

module.exports = Match;
