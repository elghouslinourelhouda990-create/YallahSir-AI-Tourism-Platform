const express = require('express');
const router = express.Router();
const {
    getActivites,
    getActiviteById,
    createActivite,
    updateActivite,
    deleteActivite
} = require('../controllers/activiteController');

const { protectRoute } = require('../middlewares/authMiddleware');

router.route('/').get(getActivites).post(protectRoute, createActivite);
router.route('/:id').get(getActiviteById).put(protectRoute, updateActivite).delete(protectRoute, deleteActivite);

module.exports = router;
