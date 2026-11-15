require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Lieu = require('../models/lieuModel');
const Match = require('../models/matchModel');
const Activite = require('../models/activiteModel');
const Culture = require('../models/cultureModel');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pfa');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to DB:', error.message);
        process.exit(1);
    }
};

const populateData = async () => {
    await connectDB();

    console.log('Inserting dummy Lieux...');
    const lieux = [
        { id_lieu: 101, nom_lieu: { fr: 'Tour Hassan', en: 'Hassan Tower' }, type_lieu: { fr: 'Monument' }, ville_lieu: { fr: 'Rabat' }, image_lieu: 'https://images.unsplash.com/photo-1596720426673-e4e14290f0cc?auto=format&fit=crop&w=400' },
        { id_lieu: 102, nom_lieu: { fr: 'Place Jemaa el-Fna', en: 'Jemaa el-Fna Square' }, type_lieu: { fr: 'Place publique' }, ville_lieu: { fr: 'Marrakech' }, image_lieu: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=400' },
        { id_lieu: 103, nom_lieu: { fr: "Grotte d'Hercule", en: "Caves of Hercules" }, type_lieu: { fr: "Nature" }, ville_lieu: { fr: "Tanger" }, image_lieu: "https://images.unsplash.com/photo-1558296229-45f8f533ee18?auto=format&fit=crop&w=400" }
    ];
    for (let l of lieux) await Lieu.updateOne({ id_lieu: l.id_lieu }, { $set: l }, { upsert: true });

    console.log('Inserting dummy Matches...');
    const matches = [
        { id_match: 201, equipe_A: { fr: 'Brésil' }, equipe_B: { fr: 'Espagne' }, date_match: '15/07/2030', id_lieu: 102 },
        { id_match: 202, equipe_A: { fr: 'Maroc' }, equipe_B: { fr: 'Portugal' }, date_match: '20/07/2030', id_lieu: 101 },
        { id_match: 203, equipe_A: { fr: 'Argentine' }, equipe_B: { fr: 'France' }, date_match: '25/07/2030', id_lieu: 103 }
    ];
    for (let m of matches) await Match.updateOne({ id_match: m.id_match }, { $set: m }, { upsert: true });

    console.log('Inserting dummy Activites...');
    const activites = [
        { id_activite: 301, intitule_activite: { fr: 'Dîner traditionnel' }, description_activite: { fr: 'Dégustez les saveurs du Maroc' }, photo_url_activite: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400' },
        { id_activite: 302, intitule_activite: { fr: 'Vol en montgolfière' }, description_activite: { fr: 'Admirez la ville depuis le ciel' }, photo_url_activite: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?auto=format&fit=crop&w=400' },
        { id_activite: 303, intitule_activite: { fr: 'Shopping au souk' }, description_activite: { fr: 'Achetez des souvenirs authentiques' }, photo_url_activite: 'https://images.unsplash.com/photo-1553607558-454c8e76da7e?auto=format&fit=crop&w=400' }
    ];
    for (let a of activites) await Activite.updateOne({ id_activite: a.id_activite }, { $set: a }, { upsert: true });

    console.log('Inserting dummy Cultures...');
    const cultures = [
        { id_culture: 401, titre: { fr: 'Festival de musique' }, description: { fr: 'Concert de musique traditionnelle' }, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400' },
        { id_culture: 402, titre: { fr: 'Visite de la médina' }, description: { fr: 'Découverte de la vieille ville' }, image: 'https://images.unsplash.com/photo-1553607558-454c8e76da7e?auto=format&fit=crop&w=400' }
    ];
    for (let c of cultures) await Culture.updateOne({ id_culture: c.id_culture }, { $set: c }, { upsert: true });

    console.log('Done populating dummy data!');
    process.exit(0);
};

populateData();
