const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protectRoute = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (exclude password)
            req.user = await User.findById(decoded.id).select('-Mot_de_passe');

            if (!req.user) {
                return res.status(401).json({ message: "Non autorisé, l'utilisateur n'existe plus" });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Non autorisé, token échoué' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

module.exports = { protectRoute };
