const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Snapshot = require('./models/Snapshot');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const dates = await Snapshot.distinct('marketDate');
    console.log('Distinct Market Dates (Raw):', dates);
    const sortedDates = dates.sort().reverse();
    console.log('Sorted Dates (Latest First):', sortedDates);
    
    for (const date of sortedDates) {
        const count = await Snapshot.countDocuments({ marketDate: date });
        const distinctExpiries = await Snapshot.distinct('expiryDate', { marketDate: date });
        console.log(`Date: ${date}, Count: ${count}, Expiries: ${distinctExpiries.join(', ')}`);
        
        const latestSnap = await Snapshot.findOne({ marketDate: date }).sort({ timestamp: -1 });
        if (latestSnap) {
          console.log(`  Latest TS for ${date}: ${latestSnap.timestamp}`);
        }
    }
    
    process.exit(0);
}

check();
