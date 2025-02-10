import mongoose, { Schema } from "mongoose";
import { User } from '../models/user.model.js';
import { Trip } from '../models/travel.model.js';



// Booking Schema
const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    totalCost: Number,
    deposit: Number,
    paymentId: String,
    orderId: String,
    refundStatus: { type: String, default: "Not Requested" },
    createdAt: { type: Date, default: Date.now }
});


export const Booking = mongoose.model("Booking", BookingSchema);