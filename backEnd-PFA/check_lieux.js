const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkLieux() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const lieux = await db.collection('lieu').find({ id_lieu: { $in: [24, 25, 16, 13] } }).toArray();
        console.log('Lieux:', JSON.stringify(lieux, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLieux();
