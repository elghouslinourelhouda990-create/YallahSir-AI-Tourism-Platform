const express = require('express');
const router = express.Router();
const {
    getServicePratiques,
    getServicePratiqueById,
    createServicePratique,
    updateServicePratique,
    deleteServicePratique
} = require('../controllers/servicePratiqueController');

const { protectRoute } = require('../middlewares/authMiddleware');

router.route('/').get(getServicePratiques).post(protectRoute, createServicePratique);
router.route('/:id').get(getServicePratiqueById).put(protectRoute, updateServicePratique).delete(protectRoute, deleteServicePratique);

module.exports = router;
