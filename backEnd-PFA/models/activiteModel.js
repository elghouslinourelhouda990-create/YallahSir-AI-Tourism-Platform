const mongoose = require('mongoose');
const translatableSchema = require('./translatableSchema');

const activiteSchema = mongoose.Schema(
    {
        id_activite: { type: Number },
        intitule_activite: translatableSchema,
        description_activite: translatableSchema,
        date_activite: { type: String }, // NEW: Format "DD/MM/YYYY"
        prix_activite: { type: Number },
        duree_activite: { type: String },
        photo_url_activite: { type: String },
        image: { type: String },
        id_lieu: { type: Number }
    },
    {
        versionKey: false
    }
);

const Activite = mongoose.model('Activite', activiteSchema, 'activite');

module.exports = Activite;
