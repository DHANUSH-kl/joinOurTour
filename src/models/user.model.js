import mongoose, { Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new mongoose.Schema( {
    username : {
        type : String,
        required : true,
    },
    isAgent : {
        type : Boolean,
        default : false,
    },
    isOwner : {
        type : Boolean,
        default : false,
    },
    tripLeader: {
        companyName: {
            type: String,
        },
        companyEstablishedYear: {
            type: String,
        },
        companyContactNumber: {
            type: String,
        },
        companyEmail: {
            type: String,
        },
        emergencyContactNumber: {
            type: String,
        },
        aboutCompany: {
            type: String,
        },
        companyLogo: {
            type: String,
        },
        languages: {
            type: [String],
        },
    },
} , {timestamps : true} )

userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User",userSchema);