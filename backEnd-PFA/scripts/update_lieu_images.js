const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const unicodedata = require('unorm'); // Using unorm for normalization if available, or a simple regex

function cleanName(name) {
    if (!name) return "default";
    // Normalize unicode characters
    let n = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    // Replace non-alphanumeric with underscore and lowercase
    n = n.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    // Remove multiple underscores
    n = n.replace(/_+/g, '_').replace(/^_|_$/g, '');
    return n;
}

mongoose.connect('mongodb://127.0.0.1:27017/pfa')
  .then(async () => {
    const db = mongoose.connection.db;
    console.log('Connected to MongoDB');

    // 1. Update Lieu collection
    const lieux = await db.collection('lieu').find({}).toArray();
    console.log(`Found ${lieux.length} lieux to update.`);
    
    for(let l of lieux) {
        const nameFr = l.nom_lieu ? (typeof l.nom_lieu === 'string' ? l.nom_lieu : l.nom_lieu.fr || l.nom_lieu.en) : null;
        if (nameFr) {
            const folderName = nameFr;
            const cName = cleanName(nameFr);
            const imagePath = `/images/lieu/${folderName}/${cName}_1.jpg`;
            
            await db.collection('lieu').updateOne(
                { _id: l._id },
                { $set: { image_lieu: imagePath } }
            );
        }
    }
    console.log('Lieu collection updated.');

    // 2. Update UserResponse recommendations cache
    const userResponses = await db.collection('userResponse').find({}).toArray();
    for(let ur of userResponses) {
        if (ur.generated_recommendations && Array.isArray(ur.generated_recommendations)) {
            let changed = false;
            for(let reco of ur.generated_recommendations) {
                if (reco.type === 'lieu') {
                    // Try to find the lieu in our updated list
                    const matchingLieu = lieux.find(l => l.id_lieu == reco.id);
                    if (matchingLieu) {
                        const nameFr = matchingLieu.nom_lieu ? (typeof matchingLieu.nom_lieu === 'string' ? matchingLieu.nom_lieu : matchingLieu.nom_lieu.fr || matchingLieu.nom_lieu.en) : null;
                        if (nameFr) {
                            const folderName = nameFr;
                            const cName = cleanName(nameFr);
                            reco.image = `http://localhost:5000/images/lieu/${folderName}/${cName}_1.jpg`;
                            changed = true;
                        }
                    }
                }
            }
            if (changed) {
                await db.collection('userResponse').updateOne(
                    { _id: ur._id },
                    { $set: { generated_recommendations: ur.generated_recommendations } }
                );
            }
        }
    }
    console.log('UserResponse cache updated.');

    console.log('DONE: All lieu images integrated into database!');
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  });
