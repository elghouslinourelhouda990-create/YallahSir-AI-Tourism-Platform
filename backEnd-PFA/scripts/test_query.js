const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/pfa').then(async () => {
    const db = mongoose.connection.db;
    const acts = await db.collection('activite').find({ 'intitule_activite.fr': { $regex: 'cuisine|diner|dîner|resto', $options: 'i' } }).toArray();
    console.log(JSON.stringify(acts, null, 2));
    process.exit(0);
});
