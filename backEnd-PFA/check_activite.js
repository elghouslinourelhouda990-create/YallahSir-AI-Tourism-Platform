const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkActivities() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const activites = await db.collection('activite').find({}).limit(5).toArray();
        console.log('Activites (first 5):', JSON.stringify(activites.map(a => ({
            id_activite: a.id_activite,
            intitule: a.intitule_activite,
            id_lieu: a.id_lieu
        })), null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkActivities();
