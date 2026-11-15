const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pfa')
  .then(async () => {
    const db = mongoose.connection.db;

    // Update Activite collection
    const acts = await db.collection('activite').find({}).toArray();
    for(let a of acts) {
        let name = JSON.stringify(a).toLowerCase();
        let newUrl = null;
        if(name.includes('cuisine') || name.includes('dîner') || name.includes('diner')) {
            newUrl = '/images/activites/act-atelier-cuisine-marocaine.webp';
        } else if(name.includes('rabat')) {
            newUrl = '/images/activites/act-visite-rabat.webp';
        }

        if (newUrl) {
            await db.collection('activite').updateOne({ _id: a._id }, { $set: { photo_url_activite: newUrl } });
        }
    }

    // Update UserResponse collection caches
    const users = await db.collection('userResponse').find({}).toArray();
    for(let u of users) {
      let changed = false;
      let recs = u.generated_recommendations;
      if(recs) {
        for(let r of recs) {
          let name = JSON.stringify(r).toLowerCase();
          if(name.includes('cuisine') || name.includes('dîner') || name.includes('diner')) {
              r.image = '/images/activites/act-atelier-cuisine-marocaine.webp';
              changed = true;
          } else if(name.includes('rabat')) {
              r.image = '/images/activites/act-visite-rabat.webp';
              changed = true;
          }
        }
        if(changed) {
          await db.collection('userResponse').updateOne({ _id: u._id }, { $set: { generated_recommendations: recs } });
        }
      }
    }

    console.log('Fixed all images to LOCAL SERVER IMAGES!');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
