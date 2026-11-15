const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Morocco2030').then(async () => {
    const UserResponse = require('./models/userResponseModel');
    await UserResponse.updateMany({}, { $set: { generated_recommendations: [] } });
    console.log('Cleared old recommendations');
    process.exit(0);
}).catch(e=>console.log(e));
