const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
}; 

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { nom_user, email_user, Mot_de_passe, pays_user, langue_maternelle } = req.body;

        if (!nom_user || !email_user || !Mot_de_passe || !pays_user || !langue_maternelle) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email_user });

        if (userExists) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
        }

        // Create user
        const user = await User.create({
            nom_user,
            email_user,
            Mot_de_passe,
            pays_user,
            langue_maternelle,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                nom_user: user.nom_user,
                email_user: user.email_user,
                role: user.role,
                token: generateToken(user._id),
            });

            // Welcome Notification
            try {
                await Notification.create({
                    id_Notification: Date.now(),
                    user_id: user.id || user._id,
                    type_Notification: {
                        fr: "Bienvenue",
                        en: "Welcome",
                        ar: "مرحباً",
                        es: "Bienvenido"
                    },
                    contenu_Notification: {
                        fr: `Bienvenue ${user.nom_user} ! Profitez de votre visite.`,
                        en: `Welcome ${user.nom_user}! Enjoy your visit.`,
                        ar: `مرحباً ${user.nom_user}! استمتع بزيارتك.`,
                        es: `¡Bienvenido ${user.nom_user}! Disfrute su visita.`
                    }
                });
            } catch (err) {
                console.error("Error creating welcome notification:", err);
            }
        } else {
            res.status(400).json({ message: 'Données utilisateur invalides' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email_user, Mot_de_passe } = req.body;

        // Check for user email
        const user = await User.findOne({ email_user });

        if (user && (await user.matchPassword(Mot_de_passe))) {
            res.json({
                _id: user.id,
                nom_user: user.nom_user,
                email_user: user.email_user,
                role: user.role,
                token: generateToken(user._id),
            });

            // Welcome Back Notification
            try {
                await Notification.create({
                    id_Notification: Date.now(),
                    user_id: user.id || user._id,
                    type_Notification: {
                        fr: "Ravi de vous revoir",
                        en: "Welcome Back",
                        ar: "مرحباً بعودتك",
                        es: "Bienvenido de nuevo"
                    },
                    contenu_Notification: {
                        fr: `Ravi de vous revoir ${user.nom_user} !`,
                        en: `Welcome back ${user.nom_user}!`,
                        ar: `مرحباً بعودتك ${user.nom_user}!`,
                        es: `¡Qué bueno verte de nuevo ${user.nom_user}!`
                    }
                });
            } catch (err) {
                console.error("Error creating login notification:", err);
            }
        } else {
            res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        // req.user is set in protectRoute middleware
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.nom_user = req.body.nom_user || user.nom_user;
            user.email_user = req.body.email_user || user.email_user;
            user.pays_user = req.body.pays_user || user.pays_user;
            user.langue_maternelle = req.body.langue_maternelle || user.langue_maternelle;

            if (req.body.Mot_de_passe) {
                user.Mot_de_passe = req.body.Mot_de_passe; // pre('save') middleware will hash it
            }

            const updatedUser = await user.save();

            res.status(200).json({
                _id: updatedUser.id,
                nom_user: updatedUser.nom_user,
                email_user: updatedUser.email_user,
                pays_user: updatedUser.pays_user,
                langue_maternelle: updatedUser.langue_maternelle,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            await User.deleteOne({ _id: user._id });
            res.status(200).json({ message: 'Compte supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    deleteAccount,
};
