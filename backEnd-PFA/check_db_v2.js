const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/pfa';

async function checkDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('--- Collections ---');
        console.log(collections.map(c => c.name));

        for (const coll of collections) {
            const sample = await db.collection(coll.name).findOne({});
            console.log(`--- Sample from ${coll.name} ---`);
            console.log(JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDB();
