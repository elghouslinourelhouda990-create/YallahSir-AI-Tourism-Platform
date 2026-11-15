const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const applyTranslations = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pfa';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB to apply translations...');

        const block1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations_block1.json'), 'utf8'));
        const block2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../translations_block2.json'), 'utf8'));
        const translations = { ...block1, ...block2 };

        const db = mongoose.connection.db;
        const collections = ['lieu', 'activite', 'match', 'notifications', 'servicePratique'];
        const fieldsMapping = {
            'lieu': ['nom_lieu', 'description_lieu', 'ville_lieu', 'type_lieu'],
            'activite': ['intitule_activite', 'description_activite'],
            'match': ['equipe_A', 'equipe_B'],
            'notifications': ['type_Notification', 'contenu_Notification'],
            'servicePratique': ['type_service_pratique', 'description_service_pratique', 'ville_service_pratique']
        };

        for (const colName of collections) {
            console.log(`Updating collection: ${colName}...`);
            const collection = db.collection(colName);
            const docs = await collection.find({}).toArray();
            
            for (const doc of docs) {
                let update = {};
                let hasChanges = false;

                for (const field of fieldsMapping[colName]) {
                    if (doc[field] && doc[field].fr) {
                        const frValue = doc[field].fr;
                        const trans = translations[frValue];
                        
                        if (trans) {
                            update[field] = {
                                fr: frValue,
                                en: trans.en || doc[field].en || "",
                                ar: trans.ar || doc[field].ar || "",
                                es: trans.es || doc[field].es || ""
                            };
                            hasChanges = true;
                        }
                    }
                }

                if (hasChanges) {
                    await collection.updateOne({ _id: doc._id }, { $set: update });
                }
            }
        }

        console.log('Translations applied successfully!');
        process.exit(0);
    } catch (e) {
        console.error('Failed to apply translations:', e);
        process.exit(1);
    }
};

applyTranslations();
