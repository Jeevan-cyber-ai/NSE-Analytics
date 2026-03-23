const mongoose = require('mongoose');

const SnapshotSchema = new mongoose.Schema({
    marketDate: { type: String, required: true }, // Format: YYYY-MM-DD
    timestamp: { type: String, required: true },  // Format: "23-Mar-2026 15:30:00"
    expiryDate: { type: String, required: true },
    data: [{
        strikePrice: Number,
        ceOI: Number,
        ceLTP: Number,
        peOI: Number,
        peLTP: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Snapshot', SnapshotSchema);
