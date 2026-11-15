const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Lieu = require('../models/lieuModel');
const Activite = require('../models/activiteModel');
const Match = require('../models/matchModel');
const Notification = require('../models/notificationModel');
const ServicePratique = require('../models/servicePratiqueModel');

const migrate = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pfa';
        console.log(`Connecting to MongoDB: ${uri}`);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for migration...');

        // 1. Migrate Lieux
        console.log('Migrating Lieux...');
        const lieuCollection = mongoose.connection.db.collection('lieu');
        const lieux = await lieuCollection.find({}).toArray();
        for (let doc of lieux) {
            let update = {};
            ['nom_lieu', 'description_lieu', 'ville_lieu', 'type_lieu'].forEach(field => {
                // Check if the current value is a string (old format)
                if (doc[field] && typeof doc[field] === 'string') {
                    update[field] = { fr: doc[field], en: "", ar: "", es: "" };
                }
            });
            if (Object.keys(update).length > 0) {
                await lieuCollection.updateOne({ _id: doc._id }, { $set: update });
                console.log(`Updated Lieu: ${doc._id}`);
            }
        }

        // 2. Migrate Activites
        console.log('Migrating Activites...');
        const activiteCollection = mongoose.connection.db.collection('activite');
        const activites = await activiteCollection.find({}).toArray();
        for (let doc of activites) {
            let update = {};
            ['intitule_activite', 'description_activite'].forEach(field => {
                if (doc[field] && typeof doc[field] === 'string') {
                    update[field] = { fr: doc[field], en: "", ar: "", es: "" };
                }
            });
            if (Object.keys(update).length > 0) {
                await activiteCollection.updateOne({ _id: doc._id }, { $set: update });
                console.log(`Updated Activite: ${doc._id}`);
            }
        }

        // 3. Migrate Matchs
        console.log('Migrating Matchs...');
        const matchCollection = mongoose.connection.db.collection('match');
        const matchs = await matchCollection.find({}).toArray();
        for (let doc of matchs) {
            let update = {};
            ['equipe_A', 'equipe_B'].forEach(field => {
                if (doc[field] && typeof doc[field] === 'string') {
                    update[field] = { fr: doc[field], en: "", ar: "", es: "" };
                }
            });
            if (Object.keys(update).length > 0) {
                await matchCollection.updateOne({ _id: doc._id }, { $set: update });
                console.log(`Updated Match: ${doc._id}`);
            }
        }

        // 4. Migrate Notifications
        console.log('Migrating Notifications...');
        const notificationCollection = mongoose.connection.db.collection('notifications');
        const notifications = await notificationCollection.find({}).toArray();
        for (let doc of notifications) {
            let update = {};
            ['type_Notification', 'contenu_Notification'].forEach(field => {
                if (doc[field] && typeof doc[field] === 'string') {
                    update[field] = { fr: doc[field], en: "", ar: "", es: "" };
                }
            });
            if (Object.keys(update).length > 0) {
                await notificationCollection.updateOne({ _id: doc._id }, { $set: update });
                console.log(`Updated Notification: ${doc._id}`);
            }
        }

        // 5. Migrate Service Pratique
        console.log('Migrating ServicePratique...');
        const serviceCollection = mongoose.connection.db.collection('servicePratique');
        const services = await serviceCollection.find({}).toArray();
        for (let doc of services) {
            let update = {};
            ['type_service_pratique', 'description_service_pratique', 'ville_service_pratique'].forEach(field => {
                if (doc[field] && typeof doc[field] === 'string') {
                    update[field] = { fr: doc[field], en: "", ar: "", es: "" };
                }
            });
            if (Object.keys(update).length > 0) {
                await serviceCollection.updateOne({ _id: doc._id }, { $set: update });
                console.log(`Updated ServicePratique: ${doc._id}`);
            }
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
