const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Snapshot = require('./models/Snapshot');

async function checkDuplicates() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check for March 31st specifically
    const date = '2026-03-31';
    const expiry = '07-Apr-2026';
    
    const snaps = await Snapshot.find({ marketDate: date, expiryDate: expiry })
        .sort({ createdAt: 1 })
        .select('timestamp createdAt');
    
    console.log(`Found ${snaps.length} snapshots for date ${date} and expiry ${expiry}`);
    snaps.forEach((s, idx) => {
        console.log(`${idx + 1}. TS: ${s.timestamp}, CreatedAt: ${s.createdAt}`);
    });

    process.exit(0);
}

checkDuplicates();
