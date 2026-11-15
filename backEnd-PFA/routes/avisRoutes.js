const express = require('express');
const router = express.Router();
const { getAvisByItem, getMyAvis, createAvis, deleteAvis, updateAvis } = require('../controllers/avisController');
const { protectRoute } = require('../middlewares/authMiddleware');

router.post('/', protectRoute, createAvis);
router.get('/user', protectRoute, getMyAvis);
router.get('/:type/:id', getAvisByItem);
router.put('/:id', protectRoute, updateAvis);
router.delete('/:id', protectRoute, deleteAvis);

module.exports = router;
