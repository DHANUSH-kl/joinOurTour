import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_order_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Paid", "Refunded", "Failed"],
        default: "Paid",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ✅ Use ES Module Export
export const Payment = mongoose.model("Payment", paymentSchema);
