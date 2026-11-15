const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Configuration du mapping des IDs (Ancien ID -> Nouveau ID)
const mapping = {
    // Stades
    16: 31, 17: 32, 18: 33, 19: 34, 20: 35, 21: 36, 23: 37, 24: 38, 25: 39, 26: 40, 27: 41, 28: 42, 29: 43, 30: 44,
    // Hôtels
    31: 61, 32: 62, 33: 63, 34: 64, 35: 65, 36: 66, 37: 67, 38: 68, 39: 69, 40: 70, 41: 71, 42: 72, 43: 73, 44: 74, 45: 75,
    // Restaurants
    46: 91, 47: 92, 48: 93, 49: 94, 50: 95, 51: 96, 52: 97, 53: 98, 54: 99, 55: 100, 56: 101, 57: 102, 58: 103, 59: 104, 60: 105,
    // Services
    22: 121, 61: 122, 62: 123, 63: 124, 64: 125, 65: 126, 66: 127, 67: 128, 68: 129, 69: 130, 71: 131, 72: 132, 73: 133, 74: 134, 75: 135
};

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pfa');
        const db = mongoose.connection.db;
        
        const collections = ['activite', 'match', 'servicePratique'];
        
        for (const colName of collections) {
            console.log(`Migration de la collection : ${colName}...`);
            const col = db.collection(colName);
            const documents = await col.find({}).toArray();
            
            for (const doc of documents) {
                if (doc.id_lieu && mapping[doc.id_lieu]) {
                    const newId = mapping[doc.id_lieu];
                    await col.updateOne({ _id: doc._id }, { $set: { id_lieu: newId } });
                }
            }
            console.log(`✓ Collection ${colName} mise à jour.`);
        }

        console.log('\n✅ Migration terminée avec succès !');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la migration:', err);
        process.exit(1);
    }
}

migrate();
