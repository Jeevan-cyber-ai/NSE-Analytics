const mongoose = require('mongoose');

const SnapshotSchema = new mongoose.Schema({
    marketDate:     { type: String, required: true }, // Format: YYYY-MM-DD
    timestamp:      { type: String, required: true }, // Format: "30-Mar-2026 13:42:33"
    expiryDate:     { type: String, required: true }, // ONE expiry per document e.g. "30-Mar-2026"
    underlyingValue: Number,
    data: [{
        strikePrice: Number,
        // CE (Calls)
        ceOI:      Number,
        ceChngOI:  Number,
        ceVolume:  Number,
        ceIV:      Number,
        ceLTP:     Number,
        ceChng:    Number,
        ceBidQty:  Number,
        ceBid:     Number,
        ceAsk:     Number,
        ceAskQty:  Number,
        // PE (Puts)
        peBidQty:  Number,
        peBid:     Number,
        peAsk:     Number,
        peAskQty:  Number,
        peChng:    Number,
        peLTP:     Number,
        peIV:      Number,
        peVolume:  Number,
        peChngOI:  Number,
        peOI:      Number
    }],
    createdAt: { type: Date, default: Date.now }
});

// Compound index for fast querying by date + expiry + time
SnapshotSchema.index({ marketDate: 1, expiryDate: 1, timestamp: 1 });

module.exports = mongoose.model('Snapshot', SnapshotSchema);
