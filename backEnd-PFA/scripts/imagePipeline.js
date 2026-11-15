const mongoose = require('mongoose');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');
const dotenv = require('dotenv');

// Load models
const Lieu = require('../models/lieuModel');
const Activite = require('../models/activiteModel');
const Culture = require('../models/cultureModel');

dotenv.config();

// Configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const TARGET_DIR = path.join(__dirname, '../public/images');
const IMAGE_WIDTH = 1200;
const IMAGE_QUALITY = 80;

// Connect to MongoDB
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/morocco2030';
        console.log(`Connecting to: ${uri}`);
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected for Image Pipeline');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

/**
 * Get a clean search string from a translatable field
 */
const getSearchQuery = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field.fr || field.en || Object.values(field)[0] || '';
};

/**
 * Download and process an image
 */
const downloadAndProcess = async (query, finalPath) => {
    try {
        console.log(`🔍 Searching image for: "${query}"...`);
        
        // Search on Unsplash if key is present
        let imageUrl = '';
        if (UNSPLASH_ACCESS_KEY) {
            try {
                const response = await axios.get('https://api.unsplash.com/search/photos', {
                    params: { query: `${query} Morocco`, per_page: 1, orientation: 'landscape' },
                    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
                });
                imageUrl = response.data.results[0]?.urls.regular;
            } catch (unsplashErr) {
                console.warn('⚠️ Unsplash API failed, falling back to Picsum.');
            }
        }

        // Fallback: Picsum Photos
        if (!imageUrl) {
            imageUrl = `https://picsum.photos/seed/${encodeURIComponent(query)}/1200/800`;
        }

        console.log(`📥 Downloading: ${imageUrl}`);
        const response = await axios.get(imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 30000 
        });
        const buffer = Buffer.from(response.data);

        console.log(`⚙️ Processing with Sharp...`);
        await sharp(buffer)
            .resize(IMAGE_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: IMAGE_QUALITY })
            .toFile(finalPath);

        return true;
    } catch (err) {
        console.error(`❌ Error processing "${query}":`, err.message);
        return false;
    }
};

/**
 * Main Pipeline function
 */
const runPipeline = async () => {
    await connectDB();

    const collections = [
        { model: Lieu, category: 'lieux', titleField: 'nom_lieu', imageField: 'image_lieu', prefix: 'lieu' },
        { model: Activite, category: 'activites', titleField: 'intitule_activite', imageField: 'photo_url_activite', prefix: 'act' },
        { model: Culture, category: 'culture', titleField: 'titre', imageField: 'image', prefix: 'culture' }
    ];

    for (const config of collections) {
        const items = await config.model.find({});
        console.log(`\n--- Processing ${config.category} (${items.length} items) ---`);

        const categoryDir = path.join(TARGET_DIR, config.category);
        await fs.ensureDir(categoryDir);

        for (const item of items) {
            const title = getSearchQuery(item[config.titleField]);
            if (!title) {
                console.log(`⚠️ Skipping item with no title (${item._id})`);
                continue;
            }

            const slug = slugify(title, { lower: true, strict: true });
            const fileName = `${config.prefix}-${slug}.webp`;
            const publicPath = `/images/${config.category}/${fileName}`;
            const finalPath = path.join(categoryDir, fileName);

            let changed = false;

            if (await fs.pathExists(finalPath)) {
                console.log(`⏩ File exists: ${fileName}`);
            } else {
                const success = await downloadAndProcess(title, finalPath);
                if (!success) {
                    console.log(`❌ Failed: ${title}`);
                    continue;
                }
                console.log(`✅ Saved: ${fileName}`);
            }

            // Sync DB path
            if (item[config.imageField] !== publicPath) {
                item[config.imageField] = publicPath;
                await item.save();
                console.log(`📝 DB Updated for: ${title} -> ${publicPath}`);
            } else {
                console.log(`ℹ️ DB ok for: ${title}`);
            }
        }
    }

    console.log('\n✨ Image Pipeline Completed successfully!');
    process.exit(0);
};

runPipeline();
