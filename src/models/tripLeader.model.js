import mongoose from "mongoose";

const leaderSchema = new mongoose.Schema({
    leaderName : String,
    leaderDescription : String,
    leaderProfile : String,
})

export const Leader = mongoose.model("Leader" , leaderSchema);