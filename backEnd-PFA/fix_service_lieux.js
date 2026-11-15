const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fixServiceLieux() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const lieuCol = db.collection('lieu');
        const svcCol  = db.collection('servicePratique');

        // ── 1. Ajouter les vrais lieux de services dans la collection lieu ──
        const newLieux = [
            { id_lieu: 101, nom_lieu: "Hôpital Ibn Rochd",      type_lieu: "Hôpital",   description_lieu: "CHU de Casablanca",           ville_lieu: "Casablanca", id_categorie: 99, location: { type: "Point", coordinates: [-7.6286, 33.5956] } },
            { id_lieu: 102, nom_lieu: "Clinique Al Andalous",    type_lieu: "Clinique",   description_lieu: "Clinique privée Rabat",        ville_lieu: "Rabat",       id_categorie: 99, location: { type: "Point", coordinates: [-6.8418, 34.0133] } },
            { id_lieu: 103, nom_lieu: "Pharmacie Centrale Casa", type_lieu: "Pharmacie",  description_lieu: "Pharmacie de garde",           ville_lieu: "Casablanca", id_categorie: 99, location: { type: "Point", coordinates: [-7.6200, 33.5890] } },
            { id_lieu: 104, nom_lieu: "Clinique Spécialisée Oujda", type_lieu: "Clinique", description_lieu: "Clinique spécialisée",       ville_lieu: "Oujda",      id_categorie: 99, location: { type: "Point", coordinates: [-1.9100, 34.6800] } },
            { id_lieu: 105, nom_lieu: "Hôpital Régional de Fès", type_lieu: "Hôpital",   description_lieu: "Hôpital régional principal",   ville_lieu: "Fès",        id_categorie: 99, location: { type: "Point", coordinates: [-4.9918, 34.0390] } },
            { id_lieu: 106, nom_lieu: "Pharmacie du Centre Rabat", type_lieu: "Pharmacie", description_lieu: "Pharmacie centrale",         ville_lieu: "Rabat",      id_categorie: 99, location: { type: "Point", coordinates: [-6.8326, 34.0250] } },
            { id_lieu: 107, nom_lieu: "Clinique Shifa Oujda",    type_lieu: "Clinique",   description_lieu: "Clinique spécialisée",         ville_lieu: "Oujda",     id_categorie: 99, location: { type: "Point", coordinates: [-1.9050, 34.6750] } },
            { id_lieu: 108, nom_lieu: "Centre Médical Agadir",   type_lieu: "Centre médical", description_lieu: "Consultations générales",  ville_lieu: "Agadir",    id_categorie: 99, location: { type: "Point", coordinates: [-9.5400, 30.4100] } },
            { id_lieu: 109, nom_lieu: "Commissariat Central Casa", type_lieu: "Police",   description_lieu: "Police secours",              ville_lieu: "Casablanca", id_categorie: 99, location: { type: "Point", coordinates: [-7.6100, 33.5900] } },
            { id_lieu: 110, nom_lieu: "Gendarmerie Royale Meknès", type_lieu: "Gendarmerie", description_lieu: "Sécurité routière",        ville_lieu: "Meknès",    id_categorie: 99, location: { type: "Point", coordinates: [-5.5580, 33.8960] } },
        ];

        for (const lieu of newLieux) {
            await lieuCol.updateOne(
                { id_lieu: lieu.id_lieu },
                { $set: lieu },
                { upsert: true }
            );
            console.log(`✓ Lieu ${lieu.id_lieu} (${lieu.nom_lieu}) ajouté/mis à jour`);
        }

        // ── 2. Mettre à jour les services pour pointer vers les bons lieux ──
        const serviceUpdates = [
            { id_service_pratique: 1, id_lieu: 101 },   // Hôpital Casablanca → Ibn Rochd
            { id_service_pratique: 2, id_lieu: 102 },   // Clinique Rabat → Al Andalous
            { id_service_pratique: 3, id_lieu: 103 },   // Pharmacie Marrakech → Pharmacie Centrale
            { id_service_pratique: 4, id_lieu: 102 },   // Centre médical Tanger → Al Andalous (proche)
            { id_service_pratique: 5, id_lieu: 105 },   // Hôpital Fès → Régional
            { id_service_pratique: 6, id_lieu: 106 },   // Pharmacie Rabat → Pharmacie Centre
            { id_service_pratique: 7, id_lieu: 107 },   // Clinique Oujda → Shifa
            { id_service_pratique: 8, id_lieu: 108 },   // Centre médical Agadir
            { id_service_pratique: 9, id_lieu: 109 },   // Commissariat Casablanca
            { id_service_pratique: 10, id_lieu: 110 },  // Gendarmerie Meknès
        ];

        for (const upd of serviceUpdates) {
            const result = await svcCol.updateOne(
                { id_service_pratique: upd.id_service_pratique },
                { $set: { id_lieu: upd.id_lieu } }
            );
            console.log(`✓ Service ${upd.id_service_pratique} → Lieu ${upd.id_lieu} (${result.modifiedCount} modifié)`);
        }

        console.log('\n✅ Terminé ! Les services sont maintenant liés aux bons lieux.');
        process.exit();
    } catch (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
}

fixServiceLieux();
