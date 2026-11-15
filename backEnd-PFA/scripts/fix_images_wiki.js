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
            newUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Tajine.jpg/800px-Tajine.jpg';
        } else if(name.includes('rabat')) {
            newUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Tour_Hassan.jpg/800px-Tour_Hassan.jpg';
        } else if(name.includes('montgolf')) {
            newUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Hot_air_balloon_over_Cappadocia.jpg/800px-Hot_air_balloon_over_Cappadocia.jpg';
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
              r.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Tajine.jpg/800px-Tajine.jpg';
              changed = true;
          } else if(name.includes('rabat')) {
              r.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Tour_Hassan.jpg/800px-Tour_Hassan.jpg';
              changed = true;
          } else if(name.includes('montgolf')) {
              r.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Hot_air_balloon_over_Cappadocia.jpg/800px-Hot_air_balloon_over_Cappadocia.jpg';
              changed = true;
          }
        }
        if(changed) {
          await db.collection('userResponse').updateOne({ _id: u._id }, { $set: { generated_recommendations: recs } });
        }
      }
    }

    console.log('Fixed all images to Wikimedia!');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
