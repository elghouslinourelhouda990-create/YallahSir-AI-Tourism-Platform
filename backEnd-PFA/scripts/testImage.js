const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

async function testSingleImage() {
    const query = "Tour Hassan Rabat Morocco";
    const category = 'lieux';
    const fileName = 'test-tour-hassan';
    const TARGET_DIR = path.join(__dirname, '../public/images');
    const categoryDir = path.join(TARGET_DIR, category);
    const finalPath = path.join(categoryDir, `${fileName}.webp`);

    console.log(`🚀 Starting test for: ${query}`);
    await fs.ensureDir(categoryDir);

    try {
        const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(query)}/1200/800`;
        console.log(`📥 Downloading from: ${imageUrl}`);
        
        const response = await axios.get(imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 30000 // 30 seconds timeout
        });
        const buffer = Buffer.from(response.data);
        console.log(`✅ Downloaded ${buffer.length} bytes`);

        console.log(`⚙️ Processing with Sharp...`);
        await sharp(buffer)
            .resize(1200)
            .webp({ quality: 80 })
            .toFile(finalPath);

        console.log(`✅ Saved successfully at: ${path.resolve(finalPath)}`);
        
        const stats = await fs.stat(finalPath);
        console.log(`📊 File size: ${stats.size} bytes`);

    } catch (err) {
        console.error(`❌ Error:`, err.message);
    }
}

testSingleImage();
