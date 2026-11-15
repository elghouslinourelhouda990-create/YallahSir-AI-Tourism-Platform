const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parsers middleware (to parse JSON and URL-encoded data)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS middleware
app.use(cors());

// Static folder for images
app.use('/images', express.static('public/images'));

// Health check / base route
app.get('/', (req, res) => {
    res.send('API Morocco 2030 is running...');
});

// Routes middlewares
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/lieux', require('./routes/lieuRoutes'));
app.use('/api/activites', require('./routes/activiteRoutes'));
app.use('/api/services', require('./routes/servicePratiqueRoutes'));
app.use('/api/matchs', require('./routes/matchRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/itineraires', require('./routes/itineraireRoutes'));
app.use('/api/avis', require('./routes/avisRoutes'));
app.use('/api/favoris', require('./routes/favorisRoutes'));
app.use('/api/notifier', require('./routes/notifierRoutes'));
app.use('/api/culture', require('./routes/cultureRoutes'));
app.use('/api/chat', require('./routes/chatbotRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// Error handler middleware (Optional catching 404/500 can be added here)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    
    // Background notification task
    const runNotificationTask = require('./scripts/notificationTask');
    // Run once at start and then every minute
    runNotificationTask();
    setInterval(runNotificationTask, 60000); 
});
