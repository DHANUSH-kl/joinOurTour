import mongoose from "mongoose";
import { dbName } from "../constants.js";

const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`).then(console.log("connection seccessfull"));
    } catch (error) {
        console.log("Mongodb connection error",error);
    }
};

export default connectDb;