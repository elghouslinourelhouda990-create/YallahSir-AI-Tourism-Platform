const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkServices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const services = await db.collection('servicePratique').find({}).limit(10).toArray();
        console.log('Services:', JSON.stringify(services, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkServices();
