import mongoose, { Schema } from "mongoose";


const reviewSchema = new Schema({
    locationRating: {
        type: Number,

    },
    amenitiesRating: {
        type: Number,
    },
    foodRating: {
        type: Number,
    },
    roomRating: {
        type: Number,
    },
    priceRating: {
        type: Number,
    },
    operatorRating: {
        type: Number,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/
    },
    title: {
        type: String,
    },
    comment: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
         type: Schema.Types.ObjectId, ref: 'User'
         } 
});


export const Review = mongoose.model("Review", reviewSchema);
