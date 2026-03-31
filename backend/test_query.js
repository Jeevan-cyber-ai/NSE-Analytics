const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Snapshot = require('./models/Snapshot');

async function testQuery() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');
    
    const count = await Snapshot.countDocuments();
    console.log(`Total snapshots in DB: ${count}`);
    
    if (count > 0) {
        const latestInfo = await Snapshot.findOne().sort({ timestamp: -1 });
        console.log(`Latest snapshot timestamp: ${latestInfo.timestamp}`);
        console.log(`Latest snapshot expiry: ${latestInfo.expiryDate}`);
        console.log(`Number of strikes: ${latestInfo.data.length}`);
        if(latestInfo.data.length > 0) {
            console.log(`First strike sample:`, JSON.stringify(latestInfo.data[0], null, 2));
        }
    }
    process.exit(0);
}

testQuery().catch(err => {
    console.error(err);
    process.exit(1);
});
