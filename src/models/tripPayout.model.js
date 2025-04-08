// models/tripPayout.model.js
import mongoose from "mongoose";

const tripPayoutSchema = new mongoose.Schema({
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }, // Can be CompletedTrip too
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    advancePaid: { type: Number, default: 0 },
    finalPaid: { type: Number, default: 0 },

    commissionRate: { type: Number, default: 10 }, // %
    fixedCharges: { type: Number, default: 0 },

    finalSettlementAmount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },

    transactions: [
        {
            amount: Number,
            type: { type: String, enum: ['advance', 'final'] },
            date: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export const TripPayout = mongoose.model('TripPayout', tripPayoutSchema);
