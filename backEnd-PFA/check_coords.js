const mongoose = require('mongoose');
const Lieu = require('./models/lieuModel');

async function checkCoords() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pfa');
        console.log('Connected to DB');

        const lieux = await Lieu.find({}).lean();
        console.log('--- LIEUX COORDINATES ---');
        lieux.forEach(l => {
            console.log(`ID: ${l.id_lieu}, Name: ${JSON.stringify(l.nom_lieu)}, Coords: ${JSON.stringify(l.location)}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkCoords();
