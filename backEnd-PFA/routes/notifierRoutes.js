const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middlewares/authMiddleware');
const { getMySubscriptions, toggleNotifier } = require('../controllers/notifierController');

router.use(protectRoute);

router.route('/').get(getMySubscriptions);
router.route('/toggle').post(toggleNotifier);

module.exports = router;
