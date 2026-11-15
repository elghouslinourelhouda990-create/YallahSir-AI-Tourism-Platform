const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const extract = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pfa';
        await mongoose.connect(uri);
        
        const db = mongoose.connection.db;
        const collections = ['lieu', 'activite', 'match', 'notifications', 'servicePratique'];
        const fields = {
            'lieu': ['nom_lieu', 'description_lieu', 'ville_lieu', 'type_lieu'],
            'activite': ['intitule_activite', 'description_activite'],
            'match': ['equipe_A', 'equipe_B'],
            'notifications': ['type_Notification', 'contenu_Notification'],
            'servicePratique': ['type_service_pratique', 'description_service_pratique', 'ville_service_pratique']
        };

        let stringsToTranslate = new Set();

        for (const colName of collections) {
            const docs = await db.collection(colName).find({}).toArray();
            for (const doc of docs) {
                for (const field of fields[colName]) {
                    const value = doc[field];
                    if (value && value.fr) {
                        stringsToTranslate.add(value.fr);
                    }
                }
            }
        }

        const sortedStrings = Array.from(stringsToTranslate).sort();
        fs.writeFileSync('extracted_strings_utf8.json', JSON.stringify(sortedStrings, null, 2), 'utf8');
        console.log('Extraction complete! Check extracted_strings_utf8.json');
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

extract();
