const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Snapshot = require('./models/Snapshot');

async function cleanup() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected for cleanup...');
    
    // Aggregate to find duplicates
    const duplicates = await Snapshot.aggregate([
        {
            $group: {
                _id: { marketDate: "$marketDate", timestamp: "$timestamp", expiryDate: "$expiryDate" },
                ids: { $push: "$_id" },
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]);
    
    console.log(`Found ${duplicates.length} sets of duplicates.`);
    
    let totalRemoved = 0;
    for (const dup of duplicates) {
        // Keep the FIRST one, remove the rest
        const idsToRemove = dup.ids.slice(1);
        const res = await Snapshot.deleteMany({ _id: { $in: idsToRemove } });
        totalRemoved += res.deletedCount;
        console.log(`  Removed ${res.deletedCount} duplicates for ${JSON.stringify(dup._id)}`);
    }

    console.log(`Total cleanup finished. Removed ${totalRemoved} duplicate records.`);
    process.exit(0);
}

cleanup();
