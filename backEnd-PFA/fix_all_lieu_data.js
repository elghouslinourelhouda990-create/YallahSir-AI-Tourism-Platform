const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixLieuCoordinates() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('lieu');

        const updates = [
            { id: 1, name: "Mosquée Hassan II", coords: [-7.6326, 33.6083] },
            { id: 2, name: "Jemaa el-Fna", coords: [-7.9811, 31.6258] },
            { id: 3, name: "Kasbah des Oudayas", coords: [-6.8364, 34.0315] },
            { id: 4, name: "Volubilis", coords: [-5.5542, 34.0722] },
            { id: 5, name: "Médina de Fès", coords: [-4.9774, 34.0655] },
            { id: 6, name: "Palais Bahia", coords: [-7.9817, 31.6217] },
            { id: 7, name: "Musée Mohammed VI", coords: [-6.8361, 34.0151] },
            { id: 8, name: "Aït Ben Haddou", coords: [-7.1301, 31.0469] },
            { id: 9, name: "Plage d’Ain Diab", coords: [-7.6658, 33.5936] },
            { id: 10, name: "Chefchaouen", coords: [-5.2697, 35.1714] },
            { id: 11, name: "Ouzoud", coords: [-6.7189, 32.0152] },
            { id: 12, name: "Dunes de Merzouga", coords: [-4.0116, 31.1006] },
            { id: 13, name: "Vallée du Dadès", coords: [-5.9811, 31.5511] }, // Was Aït Ben Haddou
            { id: 14, name: "Parc National Toubkal", coords: [-7.9150, 31.1011] }, // Was Aït Ben Haddou
            { id: 15, name: "Lac Bin el Ouidane", coords: [-6.1311, 32.1311] }, // Was Aït Ben Haddou
            { id: 16, name: "Jardin Majorelle", coords: [-8.0033, 31.6317] },
            { id: 17, name: "Parc Hassan II", coords: [-6.8300, 34.0200] },
            { id: 18, name: "Riad Yasmine", coords: [-7.9890, 31.6350] },
            { id: 19, name: "La Mamounia", coords: [-7.9980, 31.6210] },
            { id: 20, name: "Hilton Tanger", coords: [-5.7900, 35.7700] },
            { id: 21, name: "Sofitel Rabat", coords: [-6.8400, 34.0100] },
            { id: 22, name: "Ibis Casablanca", coords: [-7.6200, 33.5800] },
            { id: 23, name: "Riad Fès", coords: [-4.9750, 34.0620] },
            { id: 24, name: "Rick’s Café", coords: [-7.6208, 33.6053] },
            { id: 25, name: "Nomad", coords: [-7.9810, 31.6280] },
            { id: 33, name: "Stade Mohammed V", coords: [-7.6475, 33.5822] },
            { id: 39, name: "Stade de Tanger", coords: [-5.8561, 35.7289] },
            { id: 40, name: "Stade Moulay Abdellah", coords: [-6.8456, 33.9514] },
            { id: 41, name: "Stade d'Honneur Oujda", coords: [-1.9214, 34.6611] },
            { id: 42, name: "Place El Hedim", coords: [-5.5653, 33.8931] },
            { id: 43, name: "Grand Stade d'Agadir", coords: [-9.5397, 30.4194] },
            { id: 999, name: "Nouveau Spot Secret", coords: [-6.84165, 34.020882] }
        ];

        for (const item of updates) {
            console.log(`Updating ${item.name} (ID: ${item.id})...`);
            await collection.updateMany(
                { id_lieu: item.id },
                { 
                    $set: { 
                        location: {
                            type: "Point",
                            coordinates: item.coords
                        }
                    } 
                }
            );
        }

        console.log('All coordinates updated successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixLieuCoordinates();
