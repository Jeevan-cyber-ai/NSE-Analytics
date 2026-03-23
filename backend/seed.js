require('dotenv').config();
const mongoose = require('mongoose');
const Snapshot = require('./models/Snapshot');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:pass@cluster0.mongodb.net/nse_history?retryWrites=true&w=majority';

const mockData = {
    marketDate: "2026-03-23",
    timestamp: "23-Mar-2026 15:30:00",
    expiryDate: "26-Mar-2026",
    data: Array.from({ length: 150 }, (_, i) => ({
        strikePrice: 20000 + (i * 50),
        ceOI: Math.floor(Math.random() * 100000),
        ceLTP: Math.floor(Math.random() * 500),
        peOI: Math.floor(Math.random() * 100000),
        peLTP: Math.floor(Math.random() * 500)
    }))
};

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding...");
        
        await Snapshot.deleteMany({}); // Clear existing
        await new Snapshot(mockData).save();
        
        console.log("Seed data created successfully!");
        process.exit();
    } catch (err) {
        console.error("Seeding error:", err.message);
        process.exit(1);
    }
}

seed();
