import mongoose, { Schema } from "mongoose";


const adminSchema = new Schema({
    destination : String,
    tripPackage1 : String,
    tripPackage2 : String,
    tripPackage3 : String,
    tripPackage4 : String,

    createdAt: {
        type: Date,
        default: Date.now()
    }

})


export const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
