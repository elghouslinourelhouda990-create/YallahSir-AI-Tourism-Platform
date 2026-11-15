const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/pfa';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const docs = await mongoose.connection.db.collection('notification').find().sort({date_envoi: -1}).limit(5).toArray();
        console.log(`\nNotifications from DB:`);
        console.log(JSON.stringify(docs, null, 2));
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
