const express = require('express');
const router = express.Router();
const {
    getLieux,
    getLieuById,
    createLieu,
    updateLieu,
    deleteLieu
} = require('../controllers/lieuController');

const { protectRoute } = require('../middlewares/authMiddleware'); // assuming you have auth middleware

router.route('/').get(getLieux).post(protectRoute, createLieu);
router.route('/:id').get(getLieuById).put(protectRoute, updateLieu).delete(protectRoute, deleteLieu);

module.exports = router;
