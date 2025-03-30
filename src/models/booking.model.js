import mongoose, { Schema } from "mongoose";
import { User } from '../models/user.model.js';
import { Trip } from '../models/travel.model.js';



// Booking Schema
const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    tickets: Number,
    totalAmount: Number,
    status: { type: String, enum: ['booked', 'cancelled', 'refunded' , 'Refund Requested'], default: 'booked' },
    refundableAmount: { type: Number, default: 0 },
    payment: {
        orderId: { type: String, required: true },
        paymentId: { type: String, required: true },
        signature: { type: String, required: true },
        status: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now }
});



export const Booking = mongoose.model("Booking", BookingSchema);