const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const mongoose = require('mongoose');
const { scrapeNSE } = require('./backend/scraper');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            await scrapeNSE();
            console.log('Scrape completed');
        } catch (err) {
            console.error('Scrape failed:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('DB Connection error:', err);
    });
