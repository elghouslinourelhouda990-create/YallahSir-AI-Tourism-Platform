const Notification = require('../models/notificationModel');

// Helper to get translation
const getTranslatedNotification = (notification, lang) => {
    const n = notification.toObject ? notification.toObject() : notification;
    
    // Helper to extract translation or return string if it's not an object
    const getVal = (field, l) => {
        if (!field) return "";
        if (typeof field === 'string') return field;
        return field[l] || field['fr'] || "";
    };

    return {
        ...n,
        type_Notification: getVal(n.type_Notification, lang),
        contenu_Notification: getVal(n.contenu_Notification, lang)
    };
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Public (or Private depending on your logic)
const getNotifications = async (req, res) => {
    try {
        let lang = req.query.lang || 'fr';
        // Normalize lang if it's passed as full name or uppercase
        lang = lang.toLowerCase();
        if (lang.includes('en')) lang = 'en';
        else if (lang.includes('ar')) lang = 'ar';
        else if (lang.includes('es')) lang = 'es';
        else if (lang.includes('fr')) lang = 'fr';
        else lang = 'fr';

        const userId = req.query.user_id;

        // Build query: global notifications (user_id: null) OR user-specific ones
        let query = { user_id: null };
        if (userId) {
            query = { 
                $or: [
                    { user_id: null },
                    { user_id: userId }
                ]
            };
        }

        const notifications = await Notification.find(query).sort({ date_envoi: -1 });
        const translatedNotifications = notifications.map(n => getTranslatedNotification(n, lang));
        res.status(200).json(translatedNotifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a notification as read (can be generic update or explicit logic)
// @route   PUT /api/notifications/:id/read
// @access  Public (or Private)
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        // Technically the schema from image doesn't have an `isRead` field. 
        // We can just return success or update a newly added property if you decide to add it later.
        // For now, let's just send a success message to respect the requirement structure.
        
        res.status(200).json({ message: `Notification ${req.params.id} marquée comme lue (virtuellement).` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Public (or Private)
const createNotification = async (req, res) => {
    try {
        const { id_Notification, type_Notification, contenu_Notification } = req.body;
        
        if (!id_Notification || !type_Notification || !contenu_Notification) {
            return res.status(400).json({ message: 'Veuillez fournir tous les champs requis' });
        }

        const notification = await Notification.create({
            id_Notification,
            type_Notification,
            contenu_Notification
        });

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead,
    createNotification
};
