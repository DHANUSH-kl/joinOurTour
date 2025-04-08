import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";
import { Review } from "./review.model.js";

const imageSchema = new mongoose.Schema({
    path: String,
    public_id: String,
    // Add other properties if needed
   });


const tripSchema = new Schema({
    departure : {
        type : Date,
    },
    mealsPerDay: {
        type: [[String]], // Array of arrays of meals (e.g. [["breakfast"], ["breakfast", "lunch"]])
        default: [],
    },
    fromLocation : {
        type : String,
    },
    spots : {
        type : Number,
    },
    endDate : {
        type : Date
    },
    location : {
        type : String,
    },
    categories : {
        type : [String],
    },
    title : {
        type : String,
    },
    youtubeUrl: {
        type: String, 
    },
    tripDescription : {
        type : String,
        // minlength: [200, "Trip description must be at least 200 characters."]
    },
    accomodations : {
        type : [String]
    },
    includes : {
        type : [String]
    },
    excludes : {
        type : [String]
    },
    totalDays : {
        type : Number,
    },
    totalCost : {
        type : Number
    },
    tripImages: [imageSchema],
    stopImages: [imageSchema],
    stopLocation : {
        type : [String],
    },
    stopDescription : {
        type : [String],
    },
    tripLeaderMessage : {
        type : String
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    reviews : [{
        type : Schema.Types.ObjectId,
        ref : "Review"
    }],
    maleTravelers: {
        type: Number,
        default: 0
    },
    femaleTravelers: {
        type: Number,
        default: 0
    },
    groupSize: {             // New field for group size
        type: Number,
        default: 1           // You can set a default value if required
    },
    minAge: {                // New field for minimum age
        type: String,
        default: 18          // Set a default value for minimum age
    },
    featured: {
        type: Boolean,
        default: false
    },
    minTripmats: {
        type: Number
    },
    maxTripmats: {
        type: Number
    },
    transport : {
        type: [String]
    },
    languages : {
        type : [String]
    },
    buffer : {
        type: Number,
    },
    deposit : {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending', // All newly created trips are pending by default
      },
      tripState: {
        type: String,
        enum: ["upcoming", "ongoing", "completed"],
        default: "upcoming",
    },
    
    rejectionReason: String, // Store rejection reason if rejected
    operatorEmail: String, // Store the trip operator's email
      
    report: [{
        reason: String,
        reportedAt: { type: Date, default: Date.now }
    }],
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
    
} , {timestamps:true});




// ✅ Auto-update tripState based on departure and endDate
tripSchema.pre("save", function (next) {
    const today = new Date();

    if (this.endDate < today) {
        this.tripState = "completed";
    } else if (this.departure <= today && this.endDate >= today) {
        this.tripState = "ongoing";
    } else {
        this.tripState = "upcoming";
    }

    next();
});




// Mongoose middleware to remove trip ID from users' createdTrips when a trip is deleted
tripSchema.pre('remove', async function (next) {
    try {
        const tripId = this._id;

        // Update all users that have this trip in their createdTrips array
        await mongoose.model('User').updateMany(
            { createdTrips: tripId },
            { $pull: { createdTrips: tripId } }
        );

        next();
    } catch (error) {
        next(error);
    }
});


export const Trip = mongoose.model("Trip", tripSchema);