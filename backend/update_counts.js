const mongoose = require('mongoose');
require('dotenv').config();
const Snapshot = require('./models/Snapshot');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const total = await Snapshot.countDocuments();
    const dates = await Snapshot.aggregate([{ $group: { _id: '$marketDate', count: { $sum: 1 } } }]);
    console.log('Total:', total);
    console.log('Groups:', JSON.stringify(dates, null, 2));
    process.exit(0);
}

run();
