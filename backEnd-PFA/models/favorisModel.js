const mongoose = require('mongoose');

const favorisSchema = mongoose.Schema(
    {
        id_favori: { type: Number },
        date_ajout: { type: Date, default: Date.now },
        ID_USER: { type: mongoose.Schema.Types.Mixed, required: true },
        id_lieu: { type: mongoose.Schema.Types.Mixed },
        id_match: { type: mongoose.Schema.Types.Mixed },
        id_activite: { type: mongoose.Schema.Types.Mixed },
        id_itineraire: { type: mongoose.Schema.Types.Mixed },
        id_service: { type: mongoose.Schema.Types.Mixed },
        type_favori: { type: String, required: true },
        item_title: { type: String, default: "" }
    },
    { versionKey: false }
);

const Favoris = mongoose.model('Favoris', favorisSchema, 'favoris');

module.exports = Favoris;
