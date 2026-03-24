require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Snapshot = require('./models/Snapshot');
const { scrapeNSE } = require('./scraper');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jeevan:Jeevan2006@cluster0.c9pcrro.mongodb.net/nse-analytics?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        console.log('Server will continue running. Please update MONGO_URI in .env');
    });

// Mock data for development
const mockSnapshot = {
    _id: "mock_id_123",
    marketDate: "2026-03-23",
    timestamp: "23-Mar-2026 15:30:00",
    expiryDate: "26-Mar-2026",
    data: Array.from({ length: 40 }, (_, i) => ({
        strikePrice: 20000 + (i * 100),
        ceOI: Math.floor(Math.random() * 500000),
        ceLTP: Math.floor(Math.random() * 1000),
        peOI: Math.floor(Math.random() * 500000),
        peLTP: Math.floor(Math.random() * 1000)
    }))
};

// API Routes
app.get('/api/dates', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB NOT CONNECTED');
        const dates = await Snapshot.distinct('marketDate');
        res.json(dates.length > 0 ? dates : [mockSnapshot.marketDate]);
    } catch (e) {
        res.json([mockSnapshot.marketDate]); // Fallback
    }
});

app.get('/api/timestamps', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB NOT CONNECTED');
        const { date } = req.query;
        const timestamps = await Snapshot.find({ marketDate: date })
            .sort({ createdAt: -1 })
            .select('_id timestamp');
        res.json(timestamps.length > 0 ? timestamps : [{ _id: mockSnapshot._id, timestamp: mockSnapshot.timestamp }]);
    } catch (e) {
        res.json([{ _id: mockSnapshot._id, timestamp: mockSnapshot.timestamp }]); // Fallback
    }
});

app.get('/api/snapshot/:id', async (req, res) => {
    try {
        if (req.params.id === 'mock_id_123' || mongoose.connection.readyState !== 1) {
            return res.json(mockSnapshot);
        }
        const snapshot = await Snapshot.findById(req.params.id);
        res.json(snapshot || mockSnapshot);
    } catch (e) {
        res.json(mockSnapshot);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Auto-run scraper every 3 minutes
    setInterval(scrapeNSE, 180000);
    scrapeNSE(); // Run initially
});
