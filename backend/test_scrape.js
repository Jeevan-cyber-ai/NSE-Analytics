const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { scrapeNSE } = require('./scraper');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');
    await scrapeNSE();
    console.log('Scrape complete. Exiting...');
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
