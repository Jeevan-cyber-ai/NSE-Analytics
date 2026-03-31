const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Snapshot = require('./models/Snapshot');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // Delete all documents where data array is empty
    const result = await Snapshot.deleteMany({ data: { $size: 0 } });
    console.log('Deleted empty snapshots:', result.deletedCount);
    const remaining = await Snapshot.countDocuments();
    console.log('Remaining valid snapshots:', remaining);
    process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
