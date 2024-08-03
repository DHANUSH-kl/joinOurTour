import mongoose, { Schema } from "mongoose";


const adminSchema = new Schema({
    d1 : String,
    d2 : String,
    d3 : String,
    d4 : String,
    p1 : String,
    p2 : String,
    p3 : String,
    p4 : String,

    createdAt: {
        type: Date,
        default: Date.now()
    }

})


export const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
