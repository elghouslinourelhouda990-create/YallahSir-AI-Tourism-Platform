const express = require('express');
const router = express.Router();
const { getMyFavoris, getRecommendedFavoris, addFavoris, deleteFavoris } = require('../controllers/favorisController');
const { protectRoute } = require('../middlewares/authMiddleware');

router.post('/', protectRoute, addFavoris);
router.get('/user', protectRoute, getMyFavoris);
router.get('/recommendations', protectRoute, getRecommendedFavoris);
router.delete('/:type/:id', protectRoute, deleteFavoris);

module.exports = router;
