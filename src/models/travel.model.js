import mongoose, { Schema } from "mongoose";

const tripSchema = new Schema({
    departure : {
        type : String,
    },
    endDate : {
        type : String
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
    tripImages : {
        type: [String],
    },
    totalDays : {
        type : Number,
    },
    stopImages : {
        type : [String],
    },
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
} , {timestamps:true});


export const Trip = mongoose.model("Trip", tripSchema);