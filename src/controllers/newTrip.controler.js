import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { storage } from '../cloudinary.js';
import multer from 'multer';
import { Trip } from '../models/travel.model.js';
import { Review } from '../models/review.model.js';
import { Booking } from '../models/booking.model.js';
import Admin from '../models/admin.model.js';
import { CompletedTrip } from '../models/CompletedTrip.model.js';
import moment from 'moment';
import nodemailer from "nodemailer";
import { createHmac } from "crypto";  // ✅ Correct crypto import
import Razorpay from 'razorpay';
const upload = multer({ storage });
const app = express();


dotenv.config();


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

app.use(express.json());

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
// Use body-parser middleware to parse JSON data
app.use(bodyParser.json());
// creating a new trip 

const newTripForm = async (req, res) => {
    res.render("trips/newTrip.ejs");
}

// posting new trip 
const addNewTrip = async (req, res) => {
    try {
        // Fetch the user by their ID
        const user = await User.findById(req.user._id);

        // Check if the user has at least 100 tokens
        if (user.wallet < 100) {
            return res.status(400).send("Not enough tokens in the wallet. You need at least 100 tokens to create a trip.");
        }

        let {
            departure,
            fromLocation,
            endDate,
            categories,
            location,
            minTripmates,
            maxTripmates,
            title,
            tripDescription,
            accomodations,
            aboutLeader,
            includes,
            totalDays,
            stopLocation,
            stopDescription,
            trainTicket,
            flightTicket,
            totalCost,
            buffer,
            transport,
            excludes,
            maleTravelers,
            femaleTravelers,
            groupSize,
            minAge,
            languages,
            deposit,
            spots,
        } = req.body;
        // Handle arrays properly in case only one item is selected (EJS sometimes sends as a string instead of array)
        includes = Array.isArray(includes) ? includes : includes ? [includes] : [];
        excludes = Array.isArray(excludes) ? excludes : excludes ? [excludes] : [];
        languages = Array.isArray(languages) ? languages : languages ? [languages] : [];

        // Extract the trip and stop images from req.files
        const tripImages = req.files.tripImages
            ? req.files.tripImages.map((file) => ({
                path: file.path,
            }))
            : [];

        const stopImages = req.files.stopImages
            ? req.files.stopImages.map((file) => ({
                path: file.path,
            }))
            : [];

        let userId = req.user._id;
        const operatorEmail = user.email;

        let youtubeUrl = req.body.youtubeUrl || "";

        if (youtubeUrl.includes("youtu.be")) {
            youtubeUrl = youtubeUrl.replace("youtu.be", "www.youtube.com/embed");
            youtubeUrl = youtubeUrl.split("?")[0];
        } else if (youtubeUrl.includes("watch?v=")) {
            youtubeUrl = youtubeUrl.replace("watch?v=", "embed/");
            youtubeUrl = youtubeUrl.split("&")[0];
        }

        const newTrip = new Trip({
            departure,
            fromLocation,
            endDate,
            location,
            categories,
            title,
            tripDescription,
            accomodations,
            includes,
            excludes,
            totalDays,
            totalCost,
            stopLocation,
            stopDescription,
            tripImages,
            stopImages,
            transport,
            owner: userId,
            youtubeUrl,
            maleTravelers,
            femaleTravelers,
            groupSize,
            minAge,
            languages,
            deposit,
            buffer,
            operatorEmail,
            status: "pending",
            spots,
        });

        totalDays = totalDays[0] ? parseInt(totalDays[0]) : 0;

        await User.findByIdAndUpdate(req.user._id, {
            $push: { createdTrips: newTrip._id },
        });

        await newTrip.save();

        console.log("minAge", minAge);

        // Deduct 100 tokens from the user's wallet after creating the trip
        // user.wallet -= 100;
        // await user.save();

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong while creating the trip.");
    }
};


// displaying all trips 

const showAllTrips = async (req, res) => {
    const perPage = 6; // Number of trips per page
    const page = parseInt(req.query.page) || 1; // Current page number

    const userWishlist = req.user ? req.user.wishlist : [];

   

    // Get the total number of accepted trips (instead of all trips)
    const totalTrips = await Trip.countDocuments({ status: 'accepted'}); // Count only accepted trips

    const allTrips = await Trip.find({ status: 'accepted'})
        .populate("reviews")
        .populate("owner")
        .skip((perPage * page) - perPage) // Skip trips to get the correct page
        .limit(perPage); // Limit the number of trips per page

    // Calculate average ratings for each trip
    allTrips.forEach(trip => {
        let totalRatings = 0;
        let count = 0;
        trip.reviews.forEach(review => {
            const locationRating = review.locationRating || 0;
            const amenitiesRating = review.amenitiesRating || 0;
            const foodRating = review.foodRating || 0;
            const roomRating = review.roomRating || 0;
            const priceRating = review.priceRating || 0;
            const operatorRating = review.operatorRating || 0;

            const overallRating = (locationRating + amenitiesRating + foodRating + roomRating + priceRating + operatorRating) / 6;

            totalRatings += overallRating;
            count++;
        });
        trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0; // Add average rating to trip object

        // Calculate male-to-female ratio
        const totalTravelers = trip.maleTravelers + trip.femaleTravelers;
        const maleRatio = totalTravelers > 0 ? ((trip.maleTravelers / totalTravelers) * 100).toFixed(1) : 0;
        const femaleRatio = totalTravelers > 0 ? ((trip.femaleTravelers / totalTravelers) * 100).toFixed(1) : 0;

        // Add ratios to trip object
        trip.maleRatio = maleRatio;
        trip.femaleRatio = femaleRatio;
    });


    const allData = await Admin.find();


    const adminData = allData[0];

    const { d1, d2, d3, d4, p1, p2, p3, p4 } = adminData;


    // Function to validate ObjectId
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id?.trim());

    const tripPackage1 = isValidObjectId(p1) ? await Trip.findById(p1.trim()) : null;
    const tripPackage2 = isValidObjectId(p2) ? await Trip.findById(p2.trim()) : null;
    const tripPackage3 = isValidObjectId(p3) ? await Trip.findById(p3.trim()) : null;
    const tripPackage4 = isValidObjectId(p4) ? await Trip.findById(p4.trim()) : null;

    const exploreTrips1 = isValidObjectId(d1) ? await Trip.findById(d1.trim()) : null;
    const exploreTrips2 = isValidObjectId(d2) ? await Trip.findById(d2.trim()) : null;
    const exploreTrips3 = isValidObjectId(d3) ? await Trip.findById(d3.trim()) : null;
    const exploreTrips4 = isValidObjectId(d4) ? await Trip.findById(d4.trim()) : null;

    const exploreTrips = [exploreTrips1, exploreTrips2, exploreTrips3, exploreTrips4]

    const tripPackages = [tripPackage1, tripPackage2, tripPackage3, tripPackage4]

    // Render the page with the correct pagination
    res.render("trips/showAll", {
        allTrips,
        currentPage: page,
        totalPages: Math.ceil(totalTrips / perPage),
        user: req.user,
        totalTrips,
        userWishlist,
        sort: req.query.sort || '',
        exploreTrips,
        tripPackages
    });

};

// showing particular trip 

const showTrip = async (req, res) => {
    let id = req.params.id;

    if (id === "favicon.ico" || id === "user-wishlist") {
        return res.status(400).send("Invalid Trip ID");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid Trip ID");
    }

    const trip = await Trip.findById(id).populate({
        path: 'owner',
        populate: { path: 'tripLeader' }
    }).populate('reviews');

    // ✅ Calculate overall average rating
    let totalRatings = 0, count = 0;
    trip.reviews.forEach(review => {
        const ratings = [
            review.locationRating || 0,
            review.amenitiesRating || 0,
            review.foodRating || 0,
            review.roomRating || 0,
            review.priceRating || 0,
            review.operatorRating || 0
        ];

        const overallRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        totalRatings += overallRating;
        count++;
    });

    const averageRating = count > 0 ? (totalRatings / count).toFixed(1) : "0.0";

    function getRatingDescription(rating) {
        if (rating <= 1) return 'Worse';
        if (rating <= 2) return 'Bad';
        if (rating <= 3) return 'Okay';
        if (rating <= 4) return 'Good';
        return 'Excellent';
    }

    const userWishlist = req.user ? req.user.wishlist : [];

    res.render("trips/trip.ejs", {
        trip, id: req.params.id,
        user: req.user,
        averageRating,
        hasReviews: count > 0,
        getRatingDescription,
        userWishlist
    });
};


// edit trip 

const editTripForm = async (req, res) => {
    let { id } = req.params;
    const trip = await Trip.findById(id);
    res.render("trips/editTrip.ejs", { trip })
}


const postEditTrip = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the existing trip data
        const existingTrip = await Trip.findById(id);

        // Extract trip details from the request body
        let {
            departure,
            fromLocation,
            endDate,
            categories,
            location,
            minTripmates,
            maxTripmates,
            title,
            tripDescription,
            accomodations,
            aboutLeader,
            includes,
            excludes,
            stopLocation,
            stopDescription,
            trainTicket,
            flightTicket,
            totalCost,
            buffer,
            totalDays,
            maleTravelers, // Extract male travelers
            femaleTravelers,
            groupSize,       // New input for group size
            minAge,
            languages,
            deposit,
            spots,
        } = req.body;

        // Convert totalDays to integer
        totalDays = parseInt(totalDays[0]) || 0;
        spots = parseInt(spots) || 0;

        maleTravelers = parseInt(maleTravelers) || 0;
        femaleTravelers = parseInt(femaleTravelers) || 0;
        groupSize = parseInt(groupSize) || 0; // Convert group size to integer
        minAge = parseInt(minAge) || 0;

        // Initialize tripImages based on the presence of new uploads
        let tripImages = [];

        // Check if req.files.tripImages is defined and is an array
        if (req.files && req.files.tripImages && Array.isArray(req.files.tripImages)) {
            // Loop through each uploaded trip image and add it to tripImages array
            req.files.tripImages.forEach((file) => {
                tripImages.push({ path: file.path });
            });
        } else {
            // If no new trip images are provided, keep the existing images
            tripImages = existingTrip.tripImages || [];
        }

        // Initialize stopImages based on the presence of new uploads
        let stopImages = existingTrip.stopImages || [];

        // Check if req.files.stopImages is defined and is an array
        if (req.files && req.files.stopImages && Array.isArray(req.files.stopImages)) {
            // Loop through each uploaded stop image
            req.files.stopImages.forEach((file, index) => {
                if (stopImages[index]) {
                    // Update existing stop image path
                    stopImages[index].path = file.path;
                } else {
                    // Add new stop image if it doesn't exist in the current index
                    stopImages.push({ path: file.path });
                }
            });
        }

        // Preprocess fields to replace undefined with empty string or empty array
        departure = departure || '';
        spots = spots || '';
        fromLocation = fromLocation || '';
        endDate = endDate || '';
        categories = categories || [];
        location = location || '';
        minTripmates = minTripmates || '';
        maxTripmates = maxTripmates || '';
        title = title || '';
        tripDescription = tripDescription || '';
        accomodations = accomodations || [];
        aboutLeader = aboutLeader || '';
        includes = includes || [];
        excludes = excludes || [];
        stopLocation = stopLocation || [];
        stopDescription = stopDescription || [];
        trainTicket = trainTicket || '';
        flightTicket = flightTicket || '';
        totalCost = totalCost || '';
        buffer = buffer || '';
        languages = languages || '';
        deposit = deposit || '';

        // Merge the new data with the existing data, replacing the old tripImages array if new images are provided
        const mergedData = {
            ...existingTrip._doc,
            departure,
            fromLocation,
            endDate,
            categories,
            location,
            minTripmates,
            maxTripmates,
            tripImages, // Only the new images or existing images if no new images are uploaded
            title,
            tripDescription,
            accomodations,
            aboutLeader,
            includes,
            excludes,
            totalDays,
            stopLocation,
            stopImages, // Ensure this matches the initialized variable
            stopDescription,
            trainTicket,
            flightTicket,
            totalCost,
            buffer,
            maleTravelers,
            femaleTravelers,
            groupSize,  // Add group size to the merged data
            minAge,
            languages,
            deposit,
            spots,
        };

        // Update the trip with the merged data
        const updatedTrip = await Trip.findByIdAndUpdate(id, { $set: mergedData }, { new: true });

        console.log('Uploaded trip images:', req.files.tripImages);
        console.log('Existing trip images:', tripImages);

        if (!updatedTrip) {
            return res.status(404).send('Trip not found');
        }

        res.redirect(`/${id}`);
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).send('Internal Server Error');
    }
};



const deleteTrip = async (req, res) => {
    let { id } = req.params;
    await Trip.findByIdAndDelete(id);

    // Remove the trip ID from the user's createdTrips array
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { createdTrips: id },
    });

    res.redirect("/")
}

const mytrip = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: "createdTrips",
                populate: { path: "reviews owner" }
            })
            .populate("wishlist"); // Assuming wishlist is an array of Trip ObjectIds

        const userWishlist = user.wishlist.map((trip) => trip._id.toString());

        // Calculate ratings and traveler ratios for each trip
        user.createdTrips.forEach(trip => {
            let totalRatings = 0;
            let count = 0;

            trip.reviews.forEach(review => {
                const locationRating = review.locationRating || 0;
                const amenitiesRating = review.amenitiesRating || 0;
                const foodRating = review.foodRating || 0;
                const roomRating = review.roomRating || 0;
                const priceRating = review.priceRating || 0;
                const operatorRating = review.operatorRating || 0;

                const overallRating = (locationRating + amenitiesRating + foodRating + roomRating + priceRating + operatorRating) / 6;

                totalRatings += overallRating;
                count++;
            });

            trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0;

            // Calculate male-to-female ratio
            const totalTravelers = trip.maleTravelers + trip.femaleTravelers;
            trip.maleRatio = totalTravelers > 0 ? ((trip.maleTravelers / totalTravelers) * 100).toFixed(1) : 0;
            trip.femaleRatio = totalTravelers > 0 ? ((trip.femaleTravelers / totalTravelers) * 100).toFixed(1) : 0;
        });

        const allData = await Admin.find();
        const adminData = allData[0] || {};

        const { d1, d2, d3, d4, p1, p2, p3, p4 } = adminData;

        const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id?.trim());

        const tripPackage1 = isValidObjectId(p1) ? await Trip.findById(p1.trim()) : null;
        const tripPackage2 = isValidObjectId(p2) ? await Trip.findById(p2.trim()) : null;
        const tripPackage3 = isValidObjectId(p3) ? await Trip.findById(p3.trim()) : null;
        const tripPackage4 = isValidObjectId(p4) ? await Trip.findById(p4.trim()) : null;

        const exploreTrips1 = isValidObjectId(d1) ? await Trip.findById(d1.trim()) : null;
        const exploreTrips2 = isValidObjectId(d2) ? await Trip.findById(d2.trim()) : null;
        const exploreTrips3 = isValidObjectId(d3) ? await Trip.findById(d3.trim()) : null;
        const exploreTrips4 = isValidObjectId(d4) ? await Trip.findById(d4.trim()) : null;

        const exploreTrips = [exploreTrips1, exploreTrips2, exploreTrips3, exploreTrips4];
        const tripPackages = [tripPackage1, tripPackage2, tripPackage3, tripPackage4];

        res.render("trips/mytrip.ejs", {
            trips: user.createdTrips,
            user,
            userWishlist,
            exploreTrips,
            tripPackages
        });
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).send("Internal Server Error");
    }
};

const catagariesTrips = async (req, res) => {
    const { categories } = req.body;

    const trips = await Trip.find({ categories: { $in: categories } });

    res.render("trips/catagoriesTrip.ejs", { trips })
}


const priceFilter = async (req, res) => {
    const { minTotal, maxTotal } = req.body;

    // Find trips whose total cost is within the specified range
    const allTrips = await Trip.find({
        totalCost: { $gte: minTotal, $lte: maxTotal }
    });

    // Corrected log statement to use 'allTrips'
    console.log(allTrips);

    // Render the template with 'allTrips'
    res.render("trips/priceFilterTrip.ejs", { allTrips });
};




const searchTrips = async (req, res) => {
    try {
        const { location, checkIn, checkOut, category } = req.body;

        console.log("categoris", category)

        // Convert checkIn and checkOut to Date objects
        const departure = new Date(checkIn);
        const endDate = new Date(checkOut);

        // Exact match trips with case-insensitive location
        const exactMatchTrips = await Trip.find({
            location: { $regex: new RegExp('^' + location, 'i') },
            departure,
            endDate
        });

        // Date flexible trips with the same location
        const dateFlexibleTrips = await Trip.find({
            location: { $regex: new RegExp('^' + location, 'i') }
        });

        // Location flexible trips with dates around the entered departure and end dates
        const locationFlexibleTrips = await Trip.find({
            departure: { $gte: new Date(departure.getTime() - 24 * 60 * 60 * 1000), $lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000) }
        });

        // Category match trips with the same location and matching categories
        // Category match trips with the same location and matching categories
        const categoryMatchTrips = await Trip.find({
            location: { $regex: new RegExp('^' + location, 'i') },
            categories: { $in: Array.isArray(category) ? category : [category] } // Ensure category is an array
        });


        const allTrips = await Trip.find();

        console.log(req.body);
        console.log("Location:", location);
        console.log("Date Flexible Trips Query:", { location });
        console.log("Exact Match Trips:", exactMatchTrips);
        console.log("Location Flexible Trips:", locationFlexibleTrips);
        console.log("Date Flexible Trips:", dateFlexibleTrips);
        console.log("Category Match Trips:", categoryMatchTrips);

        res.render("trips/searchTrips.ejs", { exactMatchTrips, locationFlexibleTrips, dateFlexibleTrips, categoryMatchTrips, allTrips });

    } catch (error) {
        console.error("Error searching trips:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const mainSearch = async (req, res) => {
    const { rating, startingLocation, destinationLocation, fromDate, toDate, minPrice, maxPrice, minDays, maxDays } = req.body;


    // Normalize inputs (trim, lowercase)
    const normalizeArray = (input) =>
        Array.isArray(input)
            ? input.map(item => item.trim().toLowerCase())
            : input ? [input.trim().toLowerCase()] : [];

    const categories = normalizeArray(req.body.categories);
    const languages = normalizeArray(req.body.languages);

    try {
        const allTrips = await Trip.find().populate('owner reviews');

        let userWishlist = [];
        if (req.user) {
            const user = await User.findById(req.user._id).populate('wishlist');
            userWishlist = user.wishlist.map(trip => trip._id.toString());
        }

        const calculateRatings = (trips) => {
            return trips.map(trip => {
                let totalRatings = 0, count = 0;
                trip.reviews.forEach(review => {
                    const overallRating = (
                        review.locationRating + review.amenitiesRating +
                        review.foodRating + review.roomRating +
                        review.priceRating + review.operatorRating
                    ) / 6;
                    totalRatings += overallRating;
                    count++;
                });
                trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0;
                return trip;
            });
        };

        const matchesAllFilters = [];
        const matchesSomeFilters = [];
        const uniqueCategories = new Set();
        const uniqueLanguages = new Set();

        allTrips.forEach(trip => {
            let matchesAll = true;
            let matchesPartial = false;
            let priorityScore = 0;

            // Normalize trip data
            const tripFromLocation = trip.fromLocation.trim().toLowerCase();
            const tripDestination = trip.location.trim().toLowerCase();
            const tripCategories = trip.categories.map(cat => cat.trim().toLowerCase());
            const tripLanguages = trip.languages.map(lang => lang.trim().toLowerCase());

            trip.maleRatio = 0;
            trip.femaleRatio = 0;

            if (trip.maleTravelers !== undefined && trip.femaleTravelers !== undefined) {
                const totalTravelers = trip.maleTravelers + trip.femaleTravelers;
                trip.maleRatio = totalTravelers > 0 ? ((trip.maleTravelers / totalTravelers) * 100).toFixed(1) : 0;
                trip.femaleRatio = totalTravelers > 0 ? ((trip.femaleTravelers / totalTravelers) * 100).toFixed(1) : 0;
            }


            // Check filters
            if (startingLocation?.trim()) {
                const searchStart = startingLocation.trim().toLowerCase();
                if (!tripFromLocation.includes(searchStart)) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 2;
                }
            }

            if (destinationLocation?.trim()) {
                const searchDestination = destinationLocation.trim().toLowerCase();
                if (!tripDestination.includes(searchDestination)) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 2;
                }
            }

            if (fromDate) {
                const tripDeparture = new Date(trip.departure).setHours(0, 0, 0, 0);
                const selectedDate = new Date(fromDate).setHours(0, 0, 0, 0);
                if (tripDeparture !== selectedDate) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            if (toDate) {
                const tripEndDate = new Date(trip.endDate).setHours(0, 0, 0, 0);
                const selectedEndDate = new Date(toDate).setHours(0, 0, 0, 0);
                if (tripEndDate !== selectedEndDate) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            if (minPrice || maxPrice) {
                const price = trip.totalCost;
                if ((minPrice && price < Number(minPrice)) || (maxPrice && price > Number(maxPrice))) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            if (minDays || maxDays) {
                const days = trip.totalDays;
                if ((minDays && days < minDays) || (maxDays && days > maxDays)) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            // **Rating Filter**
            let tripAverageRating = 0;
            if (trip.reviews.length > 0) {
                tripAverageRating = trip.reviews.reduce((sum, review) => {
                    return sum + (review.locationRating + review.amenitiesRating +
                        review.foodRating + review.roomRating +
                        review.priceRating + review.operatorRating) / 6;
                }, 0) / trip.reviews.length;
            }

            if (rating) {
                if (tripAverageRating < Number(rating)) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 3;
                }
            }

            // **Categories Filtering (Case Insensitive)**
            if (categories.length > 0) {
                const matchesCategory = categories.some(cat => tripCategories.includes(cat));
                if (!matchesCategory) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 3;
                }
            }

            // **Languages Filtering (Case Insensitive)**
            if (languages.length > 0) {
                const matchesLanguage = languages.some(lang => tripLanguages.includes(lang));
                if (!matchesLanguage) matchesAll = false;
                else {
                    matchesPartial = true;
                    priorityScore += 3;
                }
            }

            trip.categories.forEach(cat => uniqueCategories.add(cat));
            trip.languages.forEach(lang => uniqueLanguages.add(lang));

            if (matchesAll) matchesAllFilters.push({ trip, priorityScore });
            else if (matchesPartial) matchesSomeFilters.push({ trip, priorityScore });
        });

        const calculateFinalScore = (tripData) => {
            const ratingWeight = tripData.trip.averageRating ? parseFloat(tripData.trip.averageRating) : 0.5;
            return tripData.priorityScore + ratingWeight;
        };

        const exactMatchesWithRatings = calculateRatings(matchesAllFilters.map(m => m.trip));
        const partialMatchesWithRatings = calculateRatings(matchesSomeFilters.map(m => m.trip));

        const rankedExactMatches = matchesAllFilters
            .map((match, index) => ({
                ...match,
                trip: exactMatchesWithRatings[index],
            }))
            .sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a))
            .map(m => m.trip);

        const rankedPartialMatches = matchesSomeFilters
            .map((match, index) => ({
                ...match,
                trip: partialMatchesWithRatings[index],
            }))
            .sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a))
            .map(m => m.trip);

        const finalResults = [...rankedExactMatches, ...rankedPartialMatches];


        const breadcrumbParts = [
            { label: "Home", link: "/aboutus" },
            { label: "All Trips", link: "/" }
        ];

        if (startingLocation?.trim()) {
            breadcrumbParts.push({ label: startingLocation, link: "#" });
        }
        if (destinationLocation?.trim()) {
            breadcrumbParts.push({ label: destinationLocation, link: "#" });
        }
        if (categories.length > 0) {
            breadcrumbParts.push({ label: categories.join(", "), link: "#" });
        }


        const categoryCounts = finalResults.reduce((acc, trip) => {
            trip.categories.forEach(category => {
                acc[category] = (acc[category] || 0) + 1;
            });
            return acc;
        }, {});

        console.log(finalResults.map(trip => ({
            title: trip.title,
            maleRatio: trip.maleRatio,
            femaleRatio: trip.femaleRatio
        })));



        res.render('trips/mainSearch.ejs', {
            exactMatchTrips: finalResults,
            user: req.user,
            userWishlist,
            startingLocation,
            destinationLocation,
            fromDate,
            toDate,
            totalTrips: finalResults.length,
            uniqueCategories: Array.from(uniqueCategories),
            uniqueLanguages: Array.from(uniqueLanguages),
            breadcrumbParts, // Pass breadcrumb data to EJS
            categoryCounts
        });

    } catch (error) {
        console.error('Error during trip search:', error);
        res.status(500).send('Server error');
    }
};








const reviews = async (req, res) => {

    try {
        const { id } = req.params; // Assuming the trip ID is provided in the URL params

        const {
            locationRating,
            amenitiesRating,
            foodRating,
            roomRating,
            priceRating,
            operatorRating,
            name,
            email,
            title,
            comment
        } = req.body;

        // Ensure req.user is populated; typically this is done via authentication middleware
        if (!req.user || !req.user._id) {
            return res.status(403).json({ message: "User not authenticated." });
        }

        // Create a new review
        const newReview = new Review({
            locationRating,
            amenitiesRating,
            foodRating,
            roomRating,
            priceRating,
            operatorRating,
            name,
            email,
            title,
            comment,
            author: req.user._id
        });

        // Save the new review
        await newReview.save();

        // Fetch the trip by ID
        const trip = await Trip.findById(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found." });
        }

        // Add the review to the trip’s reviews array
        trip.reviews.push(newReview._id);

        // Save the updated trip
        await trip.save();

        console.log(trip.reviews)

        res.redirect(`/tour/${id}`);




    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while posting the review." });
    }


}

const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        if (review.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        await Review.findByIdAndDelete(reviewId);
        res.redirect('back'); // Redirect back to the previous page
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the review.' });
    }
}

const aboutus = async (req, res) => {

    const allData = await Admin.find();


    const adminData = allData[0];

    const { d1, d2, d3, d4, p1, p2, p3, p4 } = adminData;


    // Function to validate ObjectId
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id?.trim());

    const tripPackage1 = isValidObjectId(p1) ? await Trip.findById(p1.trim()) : null;
    const tripPackage2 = isValidObjectId(p2) ? await Trip.findById(p2.trim()) : null;
    const tripPackage3 = isValidObjectId(p3) ? await Trip.findById(p3.trim()) : null;
    const tripPackage4 = isValidObjectId(p4) ? await Trip.findById(p4.trim()) : null;

    const exploreTrips1 = isValidObjectId(d1) ? await Trip.findById(d1.trim()) : null;
    const exploreTrips2 = isValidObjectId(d2) ? await Trip.findById(d2.trim()) : null;
    const exploreTrips3 = isValidObjectId(d3) ? await Trip.findById(d3.trim()) : null;
    const exploreTrips4 = isValidObjectId(d4) ? await Trip.findById(d4.trim()) : null;

    const exploreTrips = [exploreTrips1, exploreTrips2, exploreTrips3, exploreTrips4]

    const tripPackages = [tripPackage1, tripPackage2, tripPackage3, tripPackage4]

    res.render("trips/aboutus.ejs", { tripPackages, exploreTrips, user: req.user || null, })
}



const getSecondarySearch = async (req, res) => {
    const perPage = 6;
    const page = parseInt(req.query.page) || 1;
    const sortOption = req.query.sort || "";
    const userWishlist = req.user ? req.user.wishlist : [];
    const filter = { status: 'accepted', totalCost: { $ne: null } };
    let sortQuery = {};
    const today = new Date();

    switch (sortOption) {
        case 'priceLowHigh':
            sortQuery = { totalCost: 1 };
            break;
        case 'priceHighLow':
            sortQuery = { totalCost: -1 };
            break;
        case 'recentlyListed': {
            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(today.getDate() - 10);
            filter.createdAt = { $gte: tenDaysAgo };
            sortQuery = { createdAt: -1 };
            break;
        }
        case 'leavingSoon': {
            const fifteenDaysLater = new Date();
            fifteenDaysLater.setDate(today.getDate() + 15);
            filter.departure = { $gte: today, $lte: fifteenDaysLater };
            sortQuery = { departure: 1 };
            break;
        }
        default:
            break;
    }

    // Get the number of filtered trips based on the filter and the date constraints
    const totalTrips = await Trip.countDocuments(filter);

    const allTrips = await Trip.find(filter)
        .populate("reviews")
        .populate("owner")
        .sort(sortQuery)
        .skip(perPage * (page - 1))
        .limit(perPage);

    allTrips.forEach(trip => {
        let totalRatings = 0;
        let count = 0;

        trip.reviews.forEach(review => {
            const { locationRating, amenitiesRating, foodRating, roomRating, priceRating, operatorRating } = review;
            const overallRating = (locationRating + amenitiesRating + foodRating + roomRating + priceRating + operatorRating) / 6;
            totalRatings += overallRating;
            count++;
        });

        trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0;
        const totalTravelers = trip.maleTravelers + trip.femaleTravelers;
        trip.maleRatio = totalTravelers > 0 ? ((trip.maleTravelers / totalTravelers) * 100).toFixed(1) : 0;
        trip.femaleRatio = totalTravelers > 0 ? ((trip.femaleTravelers / totalTravelers) * 100).toFixed(1) : 0;
    });

    res.render("trips/secondarySearch.ejs", {
        allTrips,
        currentPage: page,
        totalPages: Math.ceil(totalTrips / perPage),
        user: req.user,
        userWishlist,
        sort: sortOption
    });
};



const whislist = async (req, res) => {
    const { tripId, addToWishlist } = req.body;

    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (addToWishlist) {
            if (!user.wishlist.includes(tripId)) {
                user.wishlist.push(tripId);
            }
        } else {
            user.wishlist = user.wishlist.filter(id => id.toString() !== tripId);
        }

        await user.save();
        return res.json({ success: true });
    } catch (error) {
        console.error('Error updating wishlist:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const showWishlist = async (req, res) => {
    const id = req.user._id;  // Directly access _id

    // Find the user by their ID
    const user = await User.findById(id);
    // Access the user's wishlist
    const wishlistIds = user.wishlist;

    // Fetch details of trips that are in the user's wishlist
    const wishlistTrips = await Trip.find({ _id: { $in: wishlistIds } })
        .populate("reviews")
        .populate("owner")
        .exec();

    // Calculate average ratings for each wishlist trip
    wishlistTrips.forEach(trip => {
        let totalRatings = 0;
        let count = 0;
        trip.reviews.forEach(review => {
            const locationRating = review.locationRating || 0;
            const amenitiesRating = review.amenitiesRating || 0;
            const foodRating = review.foodRating || 0;
            const roomRating = review.roomRating || 0;
            const priceRating = review.priceRating || 0;
            const operatorRating = review.operatorRating || 0;

            const overallRating = (locationRating + amenitiesRating + foodRating + roomRating + priceRating + operatorRating) / 6;

            totalRatings += overallRating;
            count++;
        });
        trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0; // Add average rating to trip object
    });

    const allData = await Admin.find();
    const adminData = allData[0];

    const { d1, d2, d3, d4, p1, p2, p3, p4 } = adminData;

    // Function to validate ObjectId
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id?.trim());

    const tripPackage1 = isValidObjectId(p1) ? await Trip.findById(p1.trim()) : null;
    const tripPackage2 = isValidObjectId(p2) ? await Trip.findById(p2.trim()) : null;
    const tripPackage3 = isValidObjectId(p3) ? await Trip.findById(p3.trim()) : null;
    const tripPackage4 = isValidObjectId(p4) ? await Trip.findById(p4.trim()) : null;

    const exploreTrips1 = isValidObjectId(d1) ? await Trip.findById(d1.trim()) : null;
    const exploreTrips2 = isValidObjectId(d2) ? await Trip.findById(d2.trim()) : null;
    const exploreTrips3 = isValidObjectId(d3) ? await Trip.findById(d3.trim()) : null;
    const exploreTrips4 = isValidObjectId(d4) ? await Trip.findById(d4.trim()) : null;

    const exploreTrips = [exploreTrips1, exploreTrips2, exploreTrips3, exploreTrips4];
    const tripPackages = [tripPackage1, tripPackage2, tripPackage3, tripPackage4];

    res.render("trips/wishlist.ejs", {
        wishlistTrips,  // Pass the wishlistTrips to the view
        user,           // Pass user for rendering user-specific information
        userWishlist: wishlistIds, // Pass user for rendering user-specific information
        exploreTrips,
        tripPackages
    });
};


const fetchWhislist = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).select('wishlist');
        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        console.error(error);
        res.json({ success: false, wishlist: [] });
    }
}

const discoverPage = async (req, res) => {

    const tripId = req.body.tripId;
    const trip = await Trip.findById(tripId);

    if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
    }


    // Step 2: Extract the location and find all trips with the same location
    const location = trip.location;
    const tripsByLocation = await Trip.find({ location: new RegExp(`^${location}$`, 'i') });


    res.render("trips/discover.ejs", { tripsByLocation })


}



const reportTrip = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).send('Reason for reporting is required.');
    }

    try {
        const trip = await Trip.findById(id);
        if (!trip) {
            return res.status(404).send('Trip not found.');
        }

        trip.report.push({ reason });
        await trip.save();

        res.redirect(`/${id}`); // Redirect back to the trip page
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
}

const getpayment = async (req, res) => {

    try {
        const tripId = req.params.id; // Get trip ID from URL



        if (!tripId) {
            return res.status(400).send("Trip ID is required");
        }

        const trip = await Trip.findById(tripId); // Find trip in the database
        if (!trip) {
            return res.status(404).send("Trip not found");
        }

        if (!req.user) {
            return res.redirect("/user/signin"); // Ensure user is logged in
        }

        const user = req.user; // Get logged-in user

        // Parse totalAmount safely from query params
        const totalAmount = req.query.totalAmount ? parseFloat(req.query.totalAmount) : trip.totalCost;

        const numTickets = req.query.numTickets ? parseInt(req.query.numTickets, 10) : 1; // Default to 1

        res.render("trips/payment.ejs", { trip, totalAmount, user ,numTickets}); // Pass data to EJS template
    } catch (error) {
        console.error("Error in getPayment:", error);
        res.status(500).send("Server Error");
    }


}


const createOrder = async(req,res) => {
    try {
        const { amount, tripId, userId } = req.body;

        if (!amount || !tripId || !userId) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const options = {
            amount: amount * 100, // Razorpay accepts amount in paise
            currency: "INR",
            receipt: `trip_${tripId.slice(-6)}_${Date.now().toString().slice(-6)}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ success: false, message: "Failed to create order" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("❌ Order Creation Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Order creation failed!", 
            error: error.message, 
            details: error 
        });
    }
    
}


const verifyPayment = async (req, res) => {
    try {
        console.log("🔹 Payment Verification Request Received:", req.body);

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tripId, userId, amount ,ticket} = req.body;

        // ✅ Validate Required Fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tripId || !userId || !amount) {
            console.error("❌ Missing required fields:", req.body);
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Ensure Razorpay Secret Key Exists
        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error("❌ RAZORPAY_KEY_SECRET is missing in .env");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        // ✅ Generate Expected Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const generated_signature = createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        console.log("🔑 Expected Signature:", generated_signature);
        console.log("🔑 Received Signature:", razorpay_signature);

        // ✅ Verify Signature
        if (generated_signature !== razorpay_signature) {
            console.error("❌ Payment verification failed");
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        console.log("✅ Payment Verified! Checking user and trip...");

        // ✅ Verify Payment from Razorpay API
        const razorpayResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`
            }
        });

        const paymentData = await razorpayResponse.json();

        if (paymentData.status !== "captured") {
            console.error("❌ Payment not captured yet:", paymentData);
            return res.status(400).json({ success: false, message: "Payment not captured yet" });
        }

        // ✅ Check if User Exists
        const user = await User.findById(userId);
        if (!user) {
            console.error("❌ User not found:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Fetch Trip Data
        const trip = await Trip.findById(tripId);
        if (!trip) {
            console.error("❌ Trip not found:", tripId);
            return res.status(404).json({ success: false, message: "Trip not found" });
        }

        console.log("✅ User and Trip Found. Checking available spots...");

        // ✅ Check Available Spots
        if (trip.spots < ticket) {
            console.error("❌ Not enough spots available. Requested:", ticket, "Available:", trip.spots);
            return res.status(400).json({ success: false, message: "Not enough spots available" });
        }

        // ✅ Reduce Spots by Ticket Count
        trip.spots -= ticket;
        await trip.save(); // Save updated trip data

        console.log(`✅ Spots updated successfully. Remaining Spots: ${trip.spots}`);

         // ✅ Create Booking in Database with Payment Details
         const newBooking = await Booking.create({
            user: userId,
            trip: tripId,
            totalAmount: amount,
            status: "booked",
            payment: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: "captured",
            }
        });

        console.log("✅ Booking Created Successfully:", newBooking);

        return res.json({ success: true, message: "Payment successful!", booking: newBooking });

    } catch (error) {
        console.error("❌ Error in Payment Verification:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

const getUserBookings = async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.find(userId);
      const bookings = await Booking.find({ user: userId }).populate("trip");
  
      console.log("User Bookings:", bookings); // Debugging

      res.render("trips/bookings", { bookings ,user});
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).send("Internal Server Error");
    }
};


const cancelBooking = async (req, res) => {
    try {
      const bookingId = req.params.id; // ✅ Get booking ID from URL params
  
      console.log("Cancel Request for Booking ID:", bookingId); // Debugging
  
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.error("❌ Booking not found:", bookingId);
        return res.status(404).send("Booking not found");
      }

      console.log("🔹 Current Booking Status:", booking.status); // Debugging status
  
      if (booking.status !== "booked") {
        console.error("❌ Cannot cancel unpaid booking:", bookingId);
        return res.status(400).send("Cannot cancel an unpaid booking");
      }
  
      // ✅ Mark as "Refund Requested" (Admin will process refunds)
      booking.status = "Refund Requested";
      await booking.save();
  
      console.log("✅ Booking marked for refund:", booking);
  
      res.redirect("/bookings");
    } catch (error) {
      console.error("❌ Error canceling booking:", error);
      res.status(500).send("Internal Server Error");
    }
};


const contactPage = async (req, res) => {
    const user = req.user;
    res.render("trips/contactUs.ejs",{user});
}

const contactUsPost = async (req, res) => {
    const { firstName, lastName, email, company, phone, issue } = req.body;

    // Create transporter using environment variables
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Load from .env
            pass: process.env.EMAIL_PASS  // Load from .env
        }
    });

    // Email content
    let mailOptions = {
        from: `"Contact Form" <${email}>`,
        to: process.env.EMAIL_USER, // Send to your email
        subject: "New Contact Form Submission",
        text: `
            Name: ${firstName} ${lastName}
            Email: ${email}
            Company: ${company}
            Phone: ${phone}
            Issue Details: ${issue}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.redirect("/contactUs")
    } catch (error) {
        console.error(error);
        res.send("<script>alert('Error sending message. Try again later.'); window.location='/contact';</script>");
    }
}


const tourbydestination = async (req, res) => {
    try {
        const allTripsData = await Trip.find({ status: "accepted" });
        const user = req.user;
        const groupedTrips = {};
        allTripsData.forEach(trip => {
            const key = `${trip.fromLocation} → ${trip.location}`;
            if (!groupedTrips[key]) {
                groupedTrips[key] = true; // Only store unique keys
            }
        });

        res.render("trips/tourbydestination.ejs", { groupedTrips ,user});
    } catch (err) {
        console.error(err);
        req.flash("error", "Error fetching trip data");
        res.redirect("/");
    }
}


const showgroupdestination = async (req, res) => {
    const { fromLocation, location } = req.params;
    const perPage = 6;
    const page = parseInt(req.query.page) || 1;

    try {
        const userWishlist = req.user ? req.user.wishlist : [];

        const totalTrips = await Trip.countDocuments({ fromLocation, location, status: "accepted" });

        const allTrips = await Trip.find({ fromLocation, location, status: "accepted" })
            .populate("reviews")
            .populate("owner")
            .skip((perPage * page) - perPage)
            .limit(perPage);

        allTrips.forEach(trip => {
            // Calculate average rating
            let totalRatings = 0, count = 0;
            trip.reviews.forEach(review => {
                const overallRating = (
                    (review.locationRating || 0) +
                    (review.amenitiesRating || 0) +
                    (review.foodRating || 0) +
                    (review.roomRating || 0) +
                    (review.priceRating || 0) +
                    (review.operatorRating || 0)
                ) / 6;
                totalRatings += overallRating;
                count++;
            });
            trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0;

            // Calculate male-to-female ratio
            const totalTravelers = trip.maleTravelers + trip.femaleTravelers;
            trip.maleRatio = totalTravelers > 0 ? ((trip.maleTravelers / totalTravelers) * 100).toFixed(1) : 0;
            trip.femaleRatio = totalTravelers > 0 ? ((trip.femaleTravelers / totalTravelers) * 100).toFixed(1) : 0;
        });

        res.render("trips/showgroupdestination.ejs", {
            allTrips,
            currentPage: page,
            totalPages: Math.ceil(totalTrips / perPage),
            user: req.user,
            totalTrips,
            userWishlist,
            sort: req.query.sort || '',
        });

    } catch (err) {
        console.error(err);
        req.flash("error", "Error fetching filtered trips");
        res.redirect("/");
    }
};

const tourbymonths = async (req, res) => {
    const user = req.user;
    res.render("trips/tourbymonths.ejs",{user});
}

const showtoursbymonth = async (req, res) => {
    try {
        let { month } = req.params;
        let today = new Date();
        let currentYear = today.getFullYear();


        // Ensure month is a valid number between 01 and 12
        if (!/^(0?[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).send("Invalid month parameter.");
        }

        // Ensure month is zero-padded (e.g., "3" -> "03")
        month = String(month).padStart(2, "0");

        // Create start and end dates
        let startDate = new Date(`${currentYear}-${month}-01`);
        let endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of the month

        // Validate the date
        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).send("Error processing the date.");
        }

        const perPage = 6;
        const page = parseInt(req.query.page) || 1;
        const userWishlist = req.user ? req.user.wishlist : [];

        // Fetch total trips count for pagination
        const totalTrips = await Trip.countDocuments({
            departure: {
                $gte: startDate,
                $lte: endDate
            },
            status: "accepted"
        });

        // Fetch trips with pagination
        const allTrips = await Trip.find({
            departure: {
                $gte: startDate,
                $lte: endDate
            },
            status: "accepted"
        })
            .populate("reviews")
            .populate("owner")
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .lean(); // Use lean() for better performance if only reading data

        // Calculate ratings & ratios
        allTrips.forEach(trip => {
            let totalRatings = 0, count = 0;
            if (trip.reviews) {
                trip.reviews.forEach(review => {
                    const overallRating = (
                        (review.locationRating || 0) +
                        (review.amenitiesRating || 0) +
                        (review.foodRating || 0) +
                        (review.roomRating || 0) +
                        (review.priceRating || 0) +
                        (review.operatorRating || 0)
                    ) / 6;
                    totalRatings += overallRating;
                    count++;
                });
            }
            trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0;

            const totalTravelers = (trip.maleTravelers || 0) + (trip.femaleTravelers || 0);
            trip.maleRatio = totalTravelers > 0 ? ((trip.maleTravelers / totalTravelers) * 100).toFixed(1) : 0;
            trip.femaleRatio = totalTravelers > 0 ? ((trip.femaleTravelers / totalTravelers) * 100).toFixed(1) : 0;
        });

        res.render("trips/showtoursbymonth.ejs", {
            allTrips,
            currentPage: page,
            totalPages: Math.ceil(totalTrips / perPage),
            user: req.user,
            totalTrips,
            userWishlist,
            month,
            sort: req.query.sort || '',
        });

    } catch (error) {
        console.error("Error in showtoursbymonth:", error);
        res.status(500).send("Server error.");
    }
};


const showFeaturedTrips = async (req, res) => {
    try {
        const perPage = 6;
        const page = parseInt(req.query.page) || 1;
        const userWishlist = req.user ? req.user.wishlist : [];

        // Fetch total featured trips count for pagination
        const totalTrips = await Trip.countDocuments({
            featured: true,
            status: "accepted"
        });

        // Fetch featured trips with pagination
        const allTrips = await Trip.find({
            featured: true,
            status: "accepted"
        })
            .populate("reviews")
            .populate("owner")
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .lean();

        // Calculate ratings & ratios
        allTrips.forEach(trip => {
            let totalRatings = 0, count = 0;
            if (trip.reviews) {
                trip.reviews.forEach(review => {
                    const overallRating = (
                        (review.locationRating || 0) +
                        (review.amenitiesRating || 0) +
                        (review.foodRating || 0) +
                        (review.roomRating || 0) +
                        (review.priceRating || 0) +
                        (review.operatorRating || 0)
                    ) / 6;
                    totalRatings += overallRating;
                    count++;
                });
            }
            trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0;

            const totalTravelers = (trip.maleTravelers || 0) + (trip.femaleTravelers || 0);
            trip.maleRatio = totalTravelers > 0 ? ((trip.maleTravelers / totalTravelers) * 100).toFixed(1) : 0;
            trip.femaleRatio = totalTravelers > 0 ? ((trip.femaleTravelers / totalTravelers) * 100).toFixed(1) : 0;
        });

        res.render("trips/featuredtrips.ejs", {
            allTrips,
            currentPage: page,
            totalPages: Math.ceil(totalTrips / perPage),
            user: req.user,
            totalTrips,
            userWishlist,
            sort: req.query.sort || '',
        });

    } catch (error) {
        console.error("Error in showFeaturedTrips:", error);
        res.status(500).send("Server error.");
    }
};








export { contactUsPost,getUserBookings,cancelBooking,createOrder,verifyPayment, showFeaturedTrips, showtoursbymonth, tourbymonths, showgroupdestination, tourbydestination, contactPage, getpayment, reportTrip, showWishlist, fetchWhislist, deleteReview, discoverPage, mainSearch, getSecondarySearch, aboutus, reviews, whislist, searchTrips, newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip, deleteTrip, mytrip, postEditTrip, catagariesTrips, priceFilter };

