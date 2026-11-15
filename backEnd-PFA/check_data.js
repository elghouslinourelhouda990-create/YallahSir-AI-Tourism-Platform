const mongoose = require('mongoose');
const Lieu = require('./models/lieuModel');
const Match = require('./models/matchModel');

async function checkData() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pfa');
        console.log('Connected to DB');

        const lieux = await Lieu.find({}).lean();
        console.log('--- LIEUX ---');
        lieux.forEach(l => {
            console.log(`ID: ${l.id_lieu}, Name: ${JSON.stringify(l.nom_lieu)}`);
        });

        const matchs = await Match.find({}).lean();
        console.log('\n--- MATCHS ---');
        matchs.forEach(m => {
            console.log(`Match: ${JSON.stringify(m.equipe_A)} vs ${JSON.stringify(m.equipe_B)}, id_lieu: ${m.id_lieu}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkData();
