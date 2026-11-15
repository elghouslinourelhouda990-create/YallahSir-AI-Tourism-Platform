const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // false temporarily to not break existing data
    choices: Object, // Contiendra l'objet complet { teams: [], activities: [], etc. }
    generated_recommendations: { type: Array, default: [] }, // Sauvegarde des recommandations générées
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserResponse', responseSchema);
