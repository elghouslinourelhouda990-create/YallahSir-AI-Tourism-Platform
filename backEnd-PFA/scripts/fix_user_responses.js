const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pfa')
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('userResponse').find({}).toArray();
    for(let u of users) {
      let changed = false;
      let recs = u.generated_recommendations;
      if(recs) {
        for(let r of recs) {
          if(r.id === 7 && r.type === 'activite') {
            r.image = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400';
            changed = true;
          }
          if(r.id === 34 && r.type === 'activite') {
            r.image = 'https://images.unsplash.com/photo-1596720426673-e4e14290f0cc?auto=format&fit=crop&w=400';
            changed = true;
          }
        }
        if(changed) {
          await db.collection('userResponse').updateOne({ _id: u._id }, { $set: { generated_recommendations: recs } });
        }
      }
    }
    console.log('Fixed UserResponses');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
