import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
    departureDate : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },

    //images 

    totalDays : {
        type : Number,
        required : true
    },
    location : {
        type : String,
        required : true
    },
    tripDescription : {
        type : String,
        required : true,
        minlength: [200, "Trip description must be at least 200 characters."]
    },
    includes : {
        type : [String]
    },
    excludes : {
        type : [String],
    },
    tripLeaderMessage : {
        type : String
    },
    stops : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "TripStops"
    }
} , {timestamps:true});


export const Trip = mongoose.model("Trip", tripSchema);