const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markNotificationRead,
    createNotification
} = require('../controllers/notificationController');

router.route('/').get(getNotifications).post(createNotification);
router.route('/:id/read').put(markNotificationRead);

module.exports = router;
