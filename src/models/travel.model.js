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
    fromLocation : {
        type : String,
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
    
    rejectionReason: String, // Store rejection reason if rejected
    operatorEmail: String, // Store the trip operator's email
      
    report: [{
        reason: String,
        reportedAt: { type: Date, default: Date.now }
    }]
    
} , {timestamps:true});





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