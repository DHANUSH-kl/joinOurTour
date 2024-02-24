import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
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
} , {timestamps:true});


export const Trip = mongoose.model("Trip", tripSchema);