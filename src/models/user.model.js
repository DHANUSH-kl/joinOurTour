import mongoose, { Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({
    isAgent: {
        type: Boolean,
        default: false,
    },
    isOwner: {
        type: Boolean,
        default: false,
    },
    tripLeader: {
        companyName: String,
        companyEstablishedYear: String,
        companyContactNumber: String,
        companyEmail: String,
        emergencyContactNumber: String,
        aboutCompany: String,
        companyLogo: String,
        languages: [String],
    },
    createdTrips: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
        },
    ],
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User", userSchema);
