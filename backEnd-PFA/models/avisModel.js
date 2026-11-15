const mongoose = require('mongoose');

const avisSchema = mongoose.Schema(
    {
        id_avis: { type: Number },
        note_avis: { type: Number, required: true },
        commentaire_avis: { type: String, required: true },
        date_avis: { type: Date, default: Date.now },
        photos_url_avis: { type: String, default: "" },
        langue_commentaire: { type: String, default: "Français" },
        ID_USER: { type: mongoose.Schema.Types.Mixed, required: true },
        id_lieu: { type: mongoose.Schema.Types.Mixed },
        id_match: { type: mongoose.Schema.Types.Mixed },
        id_activite: { type: mongoose.Schema.Types.Mixed },
        id_itineraire: { type: mongoose.Schema.Types.Mixed },
        id_service: { type: mongoose.Schema.Types.Mixed },
        type_avis: { type: String, required: true },
        item_title: { type: String, default: "" },
        user_name: { type: String, default: "Utilisateur" }
    },
    { versionKey: false }
);

const Avis = mongoose.model('Avis', avisSchema, 'avis');

module.exports = Avis;
