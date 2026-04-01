const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Snapshot = require('./models/Snapshot');
const { scrapeNSE } = require('./scraper');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ CRITICAL: MONGO_URI is missing in environment variables!');
    process.exit(1);
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));

mongoose.connection.on("connected", () => console.log("🚀 MongoDB connection established"));

// ─── API Routes ────────────────────────────────────────────────────────────────

let isScraping = false;

// Trigger manual scrape
app.get('/api/scrape', async (req, res) => {
    if (isScraping) {
        return res.status(429).send("⚠️ Scraper is already running. Please wait.");
    }
    try {
        isScraping = true;
        await scrapeNSE();
        res.status(200).send("✅ Scraping completed successfully");
    } catch (err) {
        console.error("Manual Scraper Error:", err.message);
        res.status(500).send("❌ Scraping failed: " + err.message);
    } finally {
        isScraping = false;
    }
});

// Get all distinct market dates
app.get('/api/dates', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB NOT CONNECTED');
        const dates = await Snapshot.distinct('marketDate');
        res.json(dates.sort().reverse());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get all available expiry dates for a given market date
app.get('/api/expiries', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB NOT CONNECTED');
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'date query param required' });
        const expiries = await Snapshot.distinct('expiryDate', { marketDate: date });
        res.json(expiries);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get list of timestamps for a specific date + expiry
app.get('/api/timestamps', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB NOT CONNECTED');
        const { date, expiry } = req.query;
        if (!date) return res.status(400).json({ error: 'date query param required' });

        const query = { marketDate: date };
        if (expiry) query.expiryDate = expiry;

        let snapshots = await Snapshot.find(query)
            .select('_id timestamp expiryDate');
        
        // Final manual sort to ensure latest is ALWAYS at the top
        snapshots.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            
        res.json(snapshots);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get a specific snapshot by ID
app.get('/api/snapshot/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB NOT CONNECTED');
        const snapshot = await Snapshot.findById(req.params.id);
        if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });
        res.json(snapshot);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── Server Start ───────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Server running on port ${PORT}`);

    const isMarketOpen = () => {
        const istTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const istDate = new Date(istTimeString);
        const day = istDate.getDay();
        const currentTimeMinutes = istDate.getHours() * 60 + istDate.getMinutes();
        const isWeekday = day >= 1 && day <= 5;
        const isSessionTime = currentTimeMinutes >= 540 && currentTimeMinutes <= 930;
        return isWeekday && isSessionTime;
    };

    console.log("⏱️  Automatic scraper scheduler starting (Checking every 5 mins)...");

    setInterval(async () => {
        if (!isMarketOpen()) {
            console.log(`[IDLE] ${new Date().toLocaleTimeString()} - Market is closed. Skipping scrape.`);
            return;
        }
        if (isScraping) {
            console.log("[SCRAPER] ⚠️ Scrape already in progress. Skipping this interval.");
            return;
        }

        try {
            console.log("[CRON] Market is open. Auto-triggering Scraper...");
            isScraping = true;
            await scrapeNSE();
        } catch (err) {
            console.error("❌ Auto-Scraper error:", err.message);
        } finally {
            isScraping = false;
        }
    }, 300000); // 5 minutes

    (async () => {
        if (isMarketOpen()) {
            try { 
                isScraping = true;
                await scrapeNSE(); 
            } catch (e) { 
                console.error(e.message); 
            } finally {
                isScraping = false;
            }
        } else {
            console.log("⏭️  Initial check: Market is closed, skipping first scrape.");
        }
    })();
});
