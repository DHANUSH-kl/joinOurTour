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
const upload = multer({ storage });
const app = express();


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
        });

        totalDays = totalDays[0] ? parseInt(totalDays[0]) : 0;

        await User.findByIdAndUpdate(req.user._id, {
            $push: { createdTrips: newTrip._id },
        });

        await newTrip.save();

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
    const totalTrips = await Trip.countDocuments({ status: 'accepted' }); // Count only accepted trips

    const allTrips = await Trip.find({ status: 'accepted' })
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

    // Render the page with the correct pagination
    res.render("trips/showAll", {
        allTrips,
        currentPage: page,
        totalPages: Math.ceil(totalTrips / perPage),
        user: req.user,
        userWishlist
    });
};

// showing particular trip 

const showTrip = async (req, res) => {
    let  id  = req.params.id;



    // ✅ Ignore "favicon.ico" and other invalid strings
    if (id === "favicon.ico" || id === "user-wishlist") {
        return res.status(400).send("Invalid Trip ID");
    }

    // ✅ Check if ID is a valid MongoDB ObjectId **before querying**
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid Trip ID");
    }





    const trip = await Trip.findById(id).populate({
        path: 'owner',
        populate: {
            path: 'tripLeader'
        }
    })
        .populate('reviews');


    // Calculate average rating
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



    const averageRating = count > 0 ? totalRatings / count : 0;


    function getRatingDescription(rating) {
        if (rating <= 1) return 'Worse';
        if (rating <= 2) return 'Bad';
        if (rating <= 3) return 'Okay';
        if (rating <= 4) return 'Good';
        return 'Excellent';
    }

    res.render("trips/trip.ejs", {
        trip, id: req.params.id,
        user: req.user,
        averageRating: averageRating.toFixed(1),
        hasReviews: count > 0,
        getRatingDescription
    })


}

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
            deposit
        } = req.body;

        // Convert totalDays to integer
        totalDays = parseInt(totalDays[0]) || 0;

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
            deposit
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
            .populate("createdTrips")
            .populate("wishlist"); // Assuming wishlist is an array of Trip ObjectIds
        const userWishlist = user.wishlist.map((trip) => trip._id.toString());
        res.render("trips/mytrip.ejs", { trips: user.createdTrips, user, userWishlist });
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).send("Internal Server Error");
    }

}

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
    const { startingLocation, destinationLocation, fromDate, toDate, minPrice, maxPrice, minDays, maxDays } = req.body;

    const destination = req.body.destination?.trim();
    const fromdte = req.body.fromdte;
    const todte = req.body.todte;

    const categories = Array.isArray(req.body.categories) ? req.body.categories.map(cat => cat.trim()) : (req.body.categories ? [req.body.categories.trim()] : []);
    const languages = Array.isArray(req.body.languages) ? req.body.languages.map(lang => lang.trim()) : (req.body.languages ? [req.body.languages.trim()] : []);

    const minDaysInt = minDays ? parseInt(minDays) : null;
    const maxDaysInt = maxDays ? parseInt(maxDays) : null;

    try {
        const allTrips = await Trip.find().populate('owner').populate('reviews');

        let userWishlist = [];
        if (req.user) {
            const user = await User.findById(req.user._id).populate('wishlist');
            userWishlist = user.wishlist.map((trip) => trip._id.toString());
        }

        const calculateRatings = (trips) => {
            return trips.map((trip) => {
                let totalRatings = 0, count = 0;
                trip.reviews.forEach((review) => {
                    const overallRating = (review.locationRating + review.amenitiesRating + review.foodRating + review.roomRating + review.priceRating + review.operatorRating) / 6;
                    totalRatings += overallRating;
                    count++;
                });
                trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0;
                return trip;
            });
        };

        const matchesAllFilters = [];
        const matchesSomeFilters = [];

        allTrips.forEach((trip) => {
            let matchesAll = true;
            let matchesPartial = false;
            let priorityScore = 0;

            // Starting Location
            if (startingLocation?.trim()) {
                if (!trip.fromLocation.toLowerCase().includes(startingLocation.trim().toLowerCase())) {
                    matchesAll = false;
                } else {
                    matchesPartial = true;
                    priorityScore += 2;
                }
            }

            // Destination Location
            if (destinationLocation?.trim()) {
                if (!trip.location.toLowerCase().includes(destinationLocation.trim().toLowerCase())) {
                    matchesAll = false;
                } else {
                    matchesPartial = true;
                    priorityScore += 2;
                }
            }

            // Departure Date (±1 day buffer)
            if (fromDate) {
                const tripDeparture = new Date(trip.departure).setHours(0, 0, 0, 0);
                const selectedDate = new Date(fromDate).setHours(0, 0, 0, 0);
                const bufferStart = selectedDate - 24 * 60 * 60 * 1000;
                const bufferEnd = selectedDate + 24 * 60 * 60 * 1000;

                if (tripDeparture < bufferStart || tripDeparture > bufferEnd) {
                    matchesAll = false;
                } else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            // End Date (±6 days buffer)
            if (toDate) {
                const tripEndDate = new Date(trip.endDate).setHours(0, 0, 0, 0);
                const selectedEndDate = new Date(toDate).setHours(0, 0, 0, 0);
                const bufferStart = selectedEndDate;
                const bufferEnd = selectedEndDate + 6 * 24 * 60 * 60 * 1000;

                if (tripEndDate < bufferStart || tripEndDate > bufferEnd) {
                    matchesAll = false;
                } else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            // Price Range
            if (minPrice || maxPrice) {
                const price = trip.totalCost;
                if ((minPrice && price < Number(minPrice)) || (maxPrice && price > Number(maxPrice))) {
                    matchesAll = false;
                } else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            // Duration Range
            if (minDaysInt || maxDaysInt) {
                const days = trip.totalDays;
                if ((minDaysInt && days < minDaysInt) || (maxDaysInt && days > maxDaysInt)) {
                    matchesAll = false;
                } else {
                    matchesPartial = true;
                    priorityScore += 1;
                }
            }

            // Categories
            if (categories.length > 0) {
                const matchesCategory = categories.some(cat => trip.categories.includes(cat));
                if (!matchesCategory) {
                    matchesAll = false;
                } else {
                    matchesPartial = true;
                    priorityScore += 3;
                }
            }

            if (matchesAll) {
                matchesAllFilters.push({ trip, priorityScore });
            } else if (matchesPartial) {
                matchesSomeFilters.push({ trip, priorityScore });
            }
        });

        const calculateFinalScore = (tripData) => {
            return tripData.priorityScore + parseFloat(tripData.trip.averageRating || 0);
        };

        const exactMatchesWithRatings = calculateRatings(matchesAllFilters.map(m => m.trip));
        const partialMatchesWithRatings = calculateRatings(matchesSomeFilters.map(m => m.trip));

        const rankedExactMatches = matchesAllFilters
            .map((match, index) => ({
                ...match,
                trip: exactMatchesWithRatings[index],
            }))
            .sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a))
            .map((m) => m.trip);

        const rankedPartialMatches = matchesSomeFilters
            .map((match, index) => ({
                ...match,
                trip: partialMatchesWithRatings[index],
            }))
            .sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a))
            .map((m) => m.trip);

        const finalResults = [...rankedExactMatches, ...rankedPartialMatches];

        res.render('trips/mainSearch.ejs', {
            exactMatchTrips: finalResults,
            user: req.user,
            userWishlist,
            startingLocation,
            destinationLocation,
            fromDate,
            toDate,
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

        res.redirect(`/${id}`);




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


    const tripPackage1 = await Trip.findById(p1);
    const tripPackage2 = await Trip.findById(p2);
    const tripPackage3 = await Trip.findById(p3);
    const tripPackage4 = await Trip.findById(p4);

    const exploreTrips1 = await Trip.findById(d1);
    const exploreTrips2 = await Trip.findById(d2);
    const exploreTrips3 = await Trip.findById(d3);
    const exploreTrips4 = await Trip.findById(d4);

    const exploreTrips = [exploreTrips1, exploreTrips2, exploreTrips3, exploreTrips4]

    const tripPackages = [tripPackage1, tripPackage2, tripPackage3, tripPackage4]

    res.render("trips/aboutus.ejs", { tripPackages, exploreTrips, user: req.user || null, })
}

const getSecondarySearch = async (req, res) => {

    // Extract values from req.body
    const destination = req.body.destination.trim(); // Use trim() to remove any leading/trailing spaces
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const fromdte = req.body.fromdte;
    const todte = req.body.todte;

    // Handle categories correctly whether it's an array or a single value
    const categories = Array.isArray(req.body.categories) ? req.body.categories.map(cat => cat.trim()) : (req.body.categories ? [req.body.categories.trim()] : []);


    const languages = Array.isArray(req.body.languages)
    ? req.body.languages.map(lang => lang.trim())
    : req.body.languages
    ? [req.body.languages.trim()]
    : [];


      // Handle days filter
      const minDays = req.body.minDays ? parseInt(req.body.minDays) : null;
      const maxDays = req.body.maxDays ? parseInt(req.body.maxDays) : null;
     



    let query = {};

    // Add location to query if destination is provided and not empty
    if (destination) {
        query.location = { $regex: new RegExp(destination, 'i') }; // Case-insensitive match
    }

    // Add categories to query if any are provided
    if (categories.length > 0) {
        query.categories = { $in: categories }; // Match any of the provided categories
    }


    if (languages.length > 0) {
        query.languages = { $in: languages.map(lang => new RegExp(`^${lang}$`, 'i')) };
    }
    

    // Add totalDays filter if minDays or maxDays are provided
    if (minDays || maxDays) {
        query.totalDays = {};
        if (minDays) {
            query.totalDays.$gte = minDays;
        }
        if (maxDays) {
            query.totalDays.$lte = maxDays;
        }
    }


    // Only add totalCost to the query if minPrice and maxPrice are not both '0'
    if (minPrice !== '0' || maxPrice !== '0') {
        if (minPrice && maxPrice) {
            query.totalCost = { $gte: Number(minPrice), $lte: Number(maxPrice) };
        } else if (minPrice) {
            query.totalCost = { $gte: Number(minPrice) };
        } else if (maxPrice) {
            query.totalCost = { $lte: Number(maxPrice) };
        }
    }

    // Parse 'fromdte' and 'todte' into Date objects
    if (fromdte) {
        const fromDate = new Date(fromdte); // Ensure fromdte is in YYYY-MM-DD format
        if (!isNaN(fromDate.getTime())) { // Check if the date is valid
            query.departure = { $gte: fromDate };
        }
    }

    if (todte) {
        const toDate = new Date(todte); // Ensure todte is in YYYY-MM-DD format
        if (!isNaN(toDate.getTime())) { // Check if the date is valid
            query.endDate = { $lte: toDate };
        }
    }

    console.log("Query Object:", query);
    console.log("req.body:", req.body);

    try {
        // Find trips that match the query
        const trips = await Trip.find(query)
            .populate('owner')  // Populate owner information
            .populate('reviews')  // Populate reviews to calculate the average rating
            .exec();



        // If the user is logged in, retrieve their wishlist
        let userWishlist = [];
        if (req.user) {
            const user = await User.findById(req.user._id).populate('wishlist');
            userWishlist = user.wishlist.map(trip => trip._id.toString()); // Convert ObjectIds to strings
        }


        // Add rating calculation for each trip
        trips.forEach(trip => {
            let totalRatings = 0;
            let count = 0;

            // Calculate average rating based on the reviews
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

            trip.averageRating = count > 0 ? (totalRatings / count).toFixed(1) : 0; // Add averageRating to each trip
            trip.hasReviews = count > 0; // Add hasReviews flag to each trip
        });

        // Function to get rating description
        function getRatingDescription(rating) {
            if (rating <= 1) return 'Worse';
            if (rating <= 2) return 'Bad';
            if (rating <= 3) return 'Okay';
            if (rating <= 4) return 'Good';
            return 'Excellent';
        }

        res.render("trips/secondarySearch", {
            trips,
            user: req.user, // Pass user info
            userWishlist,
            getRatingDescription, // Pass the rating description function
        });

    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Error fetching trips');
    }

}

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
    const wishlistTrips = await Trip.find({ _id: { $in: wishlistIds } }).exec();

    res.render("trips/wishlist.ejs", {
        wishlistTrips,  // Pass the wishlistTrips to the view
        user,           // Pass user for rendering user-specific information
        userWishlist: wishlistIds // Pass user for rendering user-specific information
    });
}

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



const reportTrip = async(req,res) => {
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

const getpayment = async(req,res) => {

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

        res.render("trips/payment.ejs", { trip, totalAmount, user }); // Pass data to EJS template
    } catch (error) {
        console.error("Error in getPayment:", error);
        res.status(500).send("Server Error");
    }
    
}

const createOrder = async(req,res) => {
    try {
        const {tripId } = req.body;
        const userId = req.user._id;

        // Fetch Trip Details
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

        const { totalCost, deposit } = trip;

        // Create Razorpay Order
        const options = {
            amount: totalCost * 100, // Amount in paise
            currency: "INR",
            receipt: `trip_${tripId}_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);

        // Save Booking to Database
        const booking = new Booking({ userId, tripId, totalCost, deposit, orderId: order.id });
        await booking.save();

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export { createOrder , getpayment , reportTrip ,  showWishlist, fetchWhislist, deleteReview, discoverPage, mainSearch, getSecondarySearch, aboutus, reviews, whislist, searchTrips, newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip, deleteTrip, mytrip, postEditTrip, catagariesTrips, priceFilter };

