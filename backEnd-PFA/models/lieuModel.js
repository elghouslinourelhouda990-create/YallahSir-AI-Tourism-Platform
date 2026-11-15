const mongoose = require('mongoose');
const translatableSchema = require('./translatableSchema');

const lieuSchema = mongoose.Schema(
    {
        id_lieu: { type: Number },
        nom_lieu: translatableSchema,
        type_lieu: translatableSchema,
        description_lieu: translatableSchema,
        ville_lieu: translatableSchema,
        id_categorie: { type: Number },
        location: { type: Object },
        image_lieu: { type: String }
    },
    {
        versionKey: false
    }
);

const Lieu = mongoose.model('Lieu', lieuSchema, 'lieu');

module.exports = Lieu;
