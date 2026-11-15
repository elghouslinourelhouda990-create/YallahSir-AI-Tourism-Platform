const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    deleteAccount,
} = require('../controllers/userController');
const { protectRoute } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protectRoute, getUserProfile);
router.put('/update-profile', protectRoute, updateUserProfile);
router.delete('/delete-account', protectRoute, deleteAccount);

module.exports = router;
