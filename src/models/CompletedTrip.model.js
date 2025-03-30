import mongoose from "mongoose";

const completedTripSchema = new mongoose.Schema({
    originalTripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    departure: Date,
    endDate: Date,
    fromLocation: String,
    location: String,
    categories: [String],
    title: String,
    totalCost: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    archivedAt: { type: Date, default: Date.now }, // Store when it was archived
});

// Check if the model already exists before defining it
export const CompletedTrip =
    mongoose.models.CompletedTrip || mongoose.model("CompletedTrip", completedTripSchema);
