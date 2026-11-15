const mongoose = require('mongoose');
const Lieu = require('./models/lieuModel');

const updates = [
    { id: 10, name: "Chefchaouen", coords: [-5.2697, 35.1714] },
    { id: 11, name: "Ouzoud", coords: [-6.7189, 32.0152] },
    { id: 12, name: "Dunes de Merzouga", coords: [-4.01, 31.08] },
    { id: 27, name: "Plage Legzira", coords: [-10.11, 29.44] },
    { id: 28, name: "Kasbah Taourirt", coords: [-6.9118, 30.9202] },
    { id: 34, name: "Santiago Bernabéu", coords: [-3.6883, 40.4531] },
    { id: 35, name: "Camp Nou", coords: [2.1228, 41.3809] },
    { id: 36, name: "Estádio da Luz", coords: [-9.1847, 38.7527] },
    { id: 37, name: "Estadio Centenario", coords: [-56.1528, -34.8944] },
    { id: 38, name: "Estadio Monumental", coords: [-58.4497, -34.5453] }
];

async function fixData() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pfa');
        console.log('Connected to DB');

        for (const update of updates) {
            const res = await Lieu.updateMany(
                { id_lieu: update.id },
                { $set: { "location.coordinates": update.coords } }
            );
            console.log(`Updated ${update.name} (ID: ${update.id}): ${res.modifiedCount} documents`);
        }

        await mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error(err);
    }
}

fixData();
