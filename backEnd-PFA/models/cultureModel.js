const mongoose = require('mongoose');

const cultureSchema = mongoose.Schema(
    {
        id_culture: { type: Number },
        titre: { type: mongoose.Schema.Types.Mixed }, // Use Mixed to handle both String and Object
        categorie: { type: mongoose.Schema.Types.Mixed },
        description: { type: mongoose.Schema.Types.Mixed },
        image: { type: String },
        ville: { type: mongoose.Schema.Types.Mixed }
    },
    {
        versionKey: false,
        timestamps: false
    }
);

// Explicitly use the 'Culture' collection name (capital C as seen in Compass)
const Culture = mongoose.model('Culture', cultureSchema, 'Culture');

module.exports = Culture;
