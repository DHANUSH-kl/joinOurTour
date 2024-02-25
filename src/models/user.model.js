import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new mongoose.Schema( {
    username : {
        type : String,
        required : true,
    },
    isAgent : {
        type : Boolean,
        default : false,
    }
} , {timestamps : true} )

userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User",userSchema);