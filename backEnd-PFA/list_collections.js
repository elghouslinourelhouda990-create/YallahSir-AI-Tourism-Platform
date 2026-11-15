const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function listCollections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listCollections();
