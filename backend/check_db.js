require('dotenv').config();
const mongoose = require('mongoose');
const Snapshot = require('./models/Snapshot');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB Atlas');
        const count = await Snapshot.countDocuments({ marketDate: '2026-03-24' });
        console.log(`Count for 2026-03-24: ${count}`);
        
        const latest = await Snapshot.findOne().sort({ createdAt: -1 });
        console.log('Latest document:', latest ? { id: latest._id, marketDate: latest.marketDate, timestamp: latest.timestamp } : 'None');
        
        const allDates = await Snapshot.distinct('marketDate');
        console.log('All unique market dates:', allDates);
        
        process.exit();
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
