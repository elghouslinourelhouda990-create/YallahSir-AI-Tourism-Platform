const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function updateServices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('servicePratique');

        // Update Hôpital (id 1)
        await collection.updateOne(
            { id_service_pratique: 1 },
            { 
                $set: { 
                    infos_complementaires: {
                        horaires: "24h/24",
                        tel_urgence: "15",
                        urgences_disponibles: true
                    }
                } 
            }
        );

        // Update Clinique (id 2)
        await collection.updateOne(
            { id_service_pratique: 2 },
            { 
                $set: { 
                    infos_complementaires: {
                        horaires: "24h/24",
                        tel_urgence: "0537000000",
                        visites: "10:00 - 20:00"
                    }
                } 
            }
        );

        // Update Pharmacie (id 3)
        await collection.updateOne(
            { id_service_pratique: 3 },
            { 
                $set: { 
                    infos_complementaires: {
                        horaires: "24h/24",
                        garde_nuit: true
                    }
                } 
            }
        );

        console.log('Services updated successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateServices();
