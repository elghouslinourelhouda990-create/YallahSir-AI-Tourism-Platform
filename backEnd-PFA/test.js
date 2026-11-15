const mongoose = require('mongoose');
const Itineraire = require('./models/itineraireModel');
mongoose.connect('mongodb://127.0.0.1:27017/pfa').then(async () => {
    try {
        const itins = await Itineraire.find().lean();
        const allIds = new Set();
        itins.forEach(itin => {
            if(itin.lieux_choisis) {
                itin.lieux_choisis.forEach(id => allIds.add(id));
            }
        });
        console.log('All id_lieux in itineraries:', Array.from(allIds));
    } catch(e) {
        console.error('Error:', e);
    }
    mongoose.disconnect();
});
