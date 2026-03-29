const mongoose = require('mongoose');

const SnapshotSchema = new mongoose.Schema({
    marketDate: { type: String, required: true }, // Format: YYYY-MM-DD
    timestamp: { type: String, required: true },  // Format: "23-Mar-2026 15:30:00"
    expiryDate: { type: String, required: false }, // Backwards compatibility for single string
    expiryDates: [{ type: String }], // To store all available expiries
    underlyingValue: Number,
    data: [{
        strikePrice: Number,
        expiryDate: String, // Ensure each row stores its expiry date
        // Calls (CE)
        ceOI: Number,
        ceChngOI: Number,
        ceVolume: Number,
        ceIV: Number,
        ceLTP: Number,
        ceChng: Number,
        ceBidQty: Number,
        ceBid: Number,
        ceAsk: Number,
        ceAskQty: Number,
        // Puts (PE)
        peBidQty: Number,
        peBid: Number,
        peAsk: Number,
        peAskQty: Number,
        peChng: Number,
        peLTP: Number,
        peIV: Number,
        peVolume: Number,
        peChngOI: Number,
        peOI: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Snapshot', SnapshotSchema);
