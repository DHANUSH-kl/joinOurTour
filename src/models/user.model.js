import mongoose, { Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({

    username: { type: String, },
    firstName: { type: String,},
    lastName: { type: String, },
    state: { type: String, },
    city: { type: String, },
    phoneNumber: { type: Number, },
    email: { type: String, unique: true },
    isAgent: {
        type: Boolean,
        default: false,
    },
    revoked: { type: Boolean, default: false }, 
    suspendedUntil: { type: Date, default: null },
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
    wishlist: [
        {
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Trip' 
            }
        ],
        wallet: {
            type: Number,
            default: 0,
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
}, { timestamps: true });



userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User", userSchema);
