const path = require('path');
// Load environment variables from backend/.env if it exists (for local dev)
require('dotenv').config({ path: path.join(__dirname, '.env') });
// Also allow default behavior (for Render production)
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
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ CRITICAL: MONGO_URI is missing in environment variables!');
    process.exit(1);
}

// Improved connection stability
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
});

// Optional logging
mongoose.connection.on("connected", () => {
    console.log("🚀 MongoDB connection established");
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
app.get('/api/scrape', async (req, res) => {
    try {
        await scrapeNSE();
        res.status(200).send("✅ Scraping completed successfully");
    } catch (err) {
        console.error("Manual Scraper Error:", err.message);
        res.status(500).send("❌ Scraping failed: " + err.message);
    }
});

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
        res.json(timestamps.length > 0 ? timestamps : [{ _id: mockSnapshot._id, timestamp: "23-Mar-2026 15:30:00" }]);
    } catch (e) {
        res.json([{ _id: mockSnapshot._id, timestamp: "23-Mar-2026 15:30:00" }]); // Fallback
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
    console.log(`📡 Server running on port ${PORT}`);

    // --- NSE Market Hours Logic ---
    const isMarketOpen = () => {
        // Calculate current time natively in IST
        const istTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const istDate = new Date(istTimeString);

        const day = istDate.getDay(); // 0 = Sun, 6 = Sat
        const hours = istDate.getHours();
        const minutes = istDate.getMinutes();
        const currentTimeMinutes = hours * 60 + minutes;

        // Market is Open: Monday (1) to Friday (5)
        const isWeekday = day >= 1 && day <= 5;
        // Session: 9:00 AM (540 mins) to 3:30 PM (930 mins)
        const isSessionTime = currentTimeMinutes >= 540 && currentTimeMinutes <= 930;

        return isWeekday && isSessionTime;
    };

    console.log("⏱️  Automatic scraper scheduler starting (Checking every 1 min)...");
    
    setInterval(async () => {
        if (!isMarketOpen()) {
            console.log(`[IDLE] ${new Date().toLocaleTimeString()} - Market is closed. Skipping scrape.`);
            return;
        }

        try {
            console.log("[CRON] Market is open. Auto-triggering Scraper...");
            await scrapeNSE();
        } catch (err) {
            console.error("❌ Auto-Scraper error:", err.message);
        }
    }, 60000);
    
    // Initial run check
    (async () => {
        if (isMarketOpen()) {
            try { await scrapeNSE(); } catch (e) {}
        } else {
            console.log("⏭️  Initial check: Market is closed, skipping first scrape.");
        }
    })();
});

