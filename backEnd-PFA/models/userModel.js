const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        nom_user: {
            type: String,
            required: [true, 'Veuillez ajouter un nom'],
        },
        email_user: {
            type: String,
            required: [true, 'Veuillez ajouter un email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Veuillez ajouter un email valide',
            ],
        },
        Mot_de_passe: {
            type: String,
            required: [true, 'Veuillez ajouter un mot de passe'],
        },
        pays_user: {
            type: String,
            required: [true, 'Veuillez ajouter un pays'],
        },
        langue_maternelle: {
            type: String,
            required: [true, 'Veuillez spécifier la langue maternelle'],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false
    }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('Mot_de_passe')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.Mot_de_passe = await bcrypt.hash(this.Mot_de_passe, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.Mot_de_passe);
};

// Explicitly use the collection name 'user' to match the database in compass
const User = mongoose.model('User', userSchema, 'user');

module.exports = User;
