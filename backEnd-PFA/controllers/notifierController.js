const Notifier = require('../models/notifierModel');
const Notification = require('../models/notificationModel');

// @desc    Get all notification subscriptions for the current user
// @route   GET /api/notifier
// @access  Private
const getMySubscriptions = async (req, res) => {
    try {
        console.log('GET /api/notifier for user:', req.user.id);
        const subscriptions = await Notifier.find({ ID_USER: req.user.id });
        console.log(`Found ${subscriptions.length} subscriptions`);
        res.status(200).json(subscriptions);
    } catch (error) {
        console.error('Error in getMySubscriptions:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle notification subscription for an item
// @route   POST /api/notifier/toggle
// @access  Private
const toggleNotifier = async (req, res) => {
    try {
        const { type, id, title } = req.body;
        console.log(`POST /api/notifier/toggle - Type: ${type}, ID: ${id}, Title: ${title}, User: ${req.user.id}`);

        if (!type || !id) {
            return res.status(400).json({ message: "Veuillez fournir un type et l'identifiant de l'élément." });
        }

        const query = { ID_USER: req.user.id };
        const data = { ID_USER: req.user.id };

        if (type.toLowerCase() === 'match') {
            query.id_match = Number(id);
            data.id_match = Number(id);
        } else if (type.toLowerCase() === 'activite') {
            query.id_activite = Number(id);
            data.id_activite = Number(id);
        } else if (type.toLowerCase() === 'transport') {
            query.id_transport = Number(id);
            data.id_transport = Number(id);
        } else {
            return res.status(400).json({ message: "Type de notification invalide" });
        }
        
        console.log('Searching with query:', query);
        const existing = await Notifier.findOne(query);

        if (existing) {
            console.log('Existing subscription found, deleting...');
            await Notifier.deleteOne({ _id: existing._id });
            res.status(200).json({ message: "Notification désactivée", active: false });
        } else {
            console.log('No existing subscription, creating new one...');
            data.id_Notification = Date.now(); 
            const newSubscription = await Notifier.create(data);
            console.log('Created:', newSubscription);
            
            // Create a confirmation notification
            try {
                await Notification.create({
                    id_Notification: Date.now() + 1,
                    user_id: req.user.id,
                    type_Notification: {
                        fr: "Alerte Activée",
                        en: "Alert Activated",
                        ar: "تم تفعيل التنبيه",
                        es: "Alerta Activada"
                    },
                    contenu_Notification: {
                        fr: `Vous recevrez une alerte pour : ${title || 'cet élément'}.`,
                        en: `You will receive an alert for: ${title || 'this item'}.`,
                        ar: `سوف تتلقى تنبيهاً لـ: ${title || 'هذا العنصر'}.`,
                        es: `Recibirás una alerta por: ${title || 'este elemento'}.`
                    }
                });
            } catch (err) {
                console.error("Error creating confirmation notification", err);
            }

            res.status(201).json({ message: "Notification activée", active: true, data: newSubscription });
        }

    } catch (error) {
        console.error('Error in toggleNotifier:', error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getMySubscriptions,
    toggleNotifier
};
