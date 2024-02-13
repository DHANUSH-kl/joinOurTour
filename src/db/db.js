import mongoose from "mongoose";
import express  from "express";

const app = express();
const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("connection seccessfull");
    } catch (error) {
        console.log("Mongodb connection error",error);
    }
};

export default connectDb;