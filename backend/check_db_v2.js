require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB Atlas');
        console.log('DB Name:', mongoose.connection.name);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));
        
        if (collections.some(c => c.name === 'snapshots')) {
            const count = await mongoose.connection.db.collection('snapshots').countDocuments();
            console.log('Count in raw snapshots collection:', count);
            
            const latest = await mongoose.connection.db.collection('snapshots').findOne({}, { sort: { createdAt: -1 } });
            console.log('Latest doc in raw collection:', latest ? { id: latest._id, marketDate: latest.marketDate, timestamp: latest.timestamp } : 'None');
        }
        
        process.exit();
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
