const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pfa')
  .then(async () => {
    const db = mongoose.connection.db;

    // Update Activite collection
    const result = await db.collection('activite').updateMany(
      { 'intitule_activite.fr': { $regex: /zagora/i } },
      { $set: { photo_url_activite: '/images/activites/act-randonnee-desert-zagora-new.png' } }
    );
    console.log('Updated activites:', result.modifiedCount);

    // Update UserResponse caches
    const users = await db.collection('userResponse').find({}).toArray();
    for (let u of users) {
      if (u.generated_recommendations) {
        let changed = false;
        for (let r of u.generated_recommendations) {
          if (JSON.stringify(r).toLowerCase().includes('zagora')) {
            r.image = '/images/activites/act-randonnee-desert-zagora-new.png';
            changed = true;
          }
        }
        if (changed) {
          await db.collection('userResponse').updateOne(
            { _id: u._id },
            { $set: { generated_recommendations: u.generated_recommendations } }
          );
        }
      }
    }

    console.log('Done! Zagora image fixed.');
    process.exit(0);
  })
  .catch(e => { console.error(e); process.exit(1); });
