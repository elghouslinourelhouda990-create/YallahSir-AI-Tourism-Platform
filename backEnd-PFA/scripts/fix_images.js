const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pfa')
  .then(async () => {
    const db = mongoose.connection.db;
    
    await db.collection('activite').updateOne(
      { id_activite: 7 }, 
      { $set: { photo_url_activite: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400' } }
    );
    
    await db.collection('activite').updateOne(
      { id_activite: 34 }, 
      { $set: { photo_url_activite: 'https://images.unsplash.com/photo-1596720426673-e4e14290f0cc?auto=format&fit=crop&w=400' } }
    );
    
    console.log('Images updated successfully');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
