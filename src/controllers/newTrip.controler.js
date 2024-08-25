import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../models/user.model.js';
import { storage } from '../cloudinary.js';
import multer from 'multer';
import { Trip } from '../models/travel.model.js';
import { Review } from '../models/review.model.js';
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

    let { departure
        , fromLocation
        , endDate
        , categories
        , location
        , minTripmates
        , maxTripmates
        , tripimages
        , title
        , tripDescription
        , accomodations
        , aboutLeader
        , includes
        , totalDays
        , stopLocation
        , stopDescription
        , trainTicket
        , flightTicket
        , totalCost
        , buffer
        , transport
        , excludes
        , youtubeUrl

    } = req.body;

    // Extract the trip and stop images from req.files
    const tripImages = req.files.tripImages ? req.files.tripImages.map(file => ({
        path: file.path,
    })) : [];

    const stopImages = req.files.stopImages ? req.files.stopImages.map(file => ({
        path: file.path,
    })) : [];

    console.log(stopImages);

    let userId = req.user._id;

    // Transform the YouTube URL for embedding
    if (youtubeUrl.includes("youtu.be")) {
        youtubeUrl = youtubeUrl.replace("youtu.be", "www.youtube.com/embed");
        youtubeUrl = youtubeUrl.split('?')[0]; // Remove query parameters
    } else if (youtubeUrl.includes("watch?v=")) {
        youtubeUrl = youtubeUrl.replace("watch?v=", "embed/");
        youtubeUrl = youtubeUrl.split('&')[0]; // Remove other parameters
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
    });

    totalDays = totalDays[0] ? parseInt(totalDays[0]) : 0;



    await User.findByIdAndUpdate(req.user._id, {
        $push: { createdTrips: newTrip._id },
    });

    console.log(req.body);

    await newTrip.save();


    res.redirect("/");

}

// displaying all trips 

const showAllTrips = async (req, res) => {
    const perPage = 6; // Number of trips per page
    const page = parseInt(req.query.page) || 1; // Current page number

    const totalTrips = await Trip.countDocuments(); // Get the total number of trips
    const allTrips = await Trip.find()
        .populate("owner")
        .skip((perPage * page) - perPage) // Skip trips to get the correct page
        .limit(perPage); // Limit the number of trips per page

    res.render("trips/showAll", {
        allTrips,
        currentPage: page,
        totalPages: Math.ceil(totalTrips / perPage)
    });
};
// showing particular trip 

const showTrip = async (req, res) => {
    let { id } = req.params;
    const trip = await Trip.findById(id).populate({
        path: 'owner',
        populate: {
            path: 'tripLeader'
        }
    });
    res.render("trips/trip.ejs", { trip })


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
        } = req.body;

        // Convert totalDays to integer
        totalDays = parseInt(totalDays[0]) || 0;

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
            buffer
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
    const trips = await User.findById(req.user._id).populate("createdTrips");
    res.render("trips/mytrip.ejs", { trips })
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

    const { startingLocation, destinationLocation, fromDate, toDate } = req.body;


    // Parse the input dates
    const departureDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Extend the endDate by 6 days
    const extendedEndDate = new Date(endDate.getTime() + 6 * 24 * 60 * 60 * 1000);

    // Apply a 1-day buffer to handle edge cases
    const departureBufferStart = new Date(departureDate.getTime() - 24 * 60 * 60 * 1000);
    const departureBufferEnd = new Date(departureDate.getTime() + 24 * 60 * 60 * 1000);

    console.log('Departure Date with Buffer Start:', departureBufferStart);
    console.log('Extended End Date:', extendedEndDate);

    // Exact match query with a 6-day extension and 1-day buffer
    const exactMatchTrips = await Trip.find({
        fromLocation: { $regex: new RegExp('^' + startingLocation, 'i') },
        location: { $regex: new RegExp('^' + destinationLocation, 'i') },
        departure: { $gte: departureBufferStart, $lte: departureBufferEnd },
        endDate: { $gte: endDate, $lte: extendedEndDate }
    });


    const destinationMatch = await Trip.find({
        location: { $regex: new RegExp('^' + destinationLocation, 'i') }
    });

    console.log('Exact Match Trips:', exactMatchTrips);
    // console.log('Destination Match:', destinationMatch);


    // Render the results in the mainSearch.ejs view
    res.render("trips/mainSearch.ejs", { exactMatchTrips, destinationMatch });



}

const whislist = async (req, res) => {

    // Extract the wishlist array from the request body
    const { wishlist } = req.body;

    // Initialize the wishlist array in the session if it doesn't exist
    req.session.wishlist = req.session.wishlist || [];

    // Loop through the wishlist items received from the client
    wishlist.forEach(tripId => {
        // Check if the tripId is not already in the wishlist stored in the session
        if (!req.session.wishlist.includes(tripId)) {
            // Add the tripId to the wishlist stored in the session
            req.session.wishlist.push(tripId);
        }
    });

    console.log("Wishlist updated:", req.session.wishlist);

}

const reviews = async (req, res) => {

    const { id } = req.params;
    const { name, comment } = req.body;

    // Find the trip by ID
    const trip = await Trip.findById(id);

    // Get the trip start date
    const tripStartDate = new Date(trip.departure);

    // Calculate the current date
    const currentDate = new Date();

    // Calculate the date after 1 day of trip start
    const allowedDate = new Date(tripStartDate);
    allowedDate.setDate(tripStartDate.getDate() + 1);

    // Check if the current date is after the allowed date
    if (currentDate < allowedDate) {
        // If the current date is before the allowed date, user cannot post review yet
        return res.status(400).json({ error: "Review cannot be posted before the trip starts." });
    }

    // Create a new review instance
    const newReview = new Review({
        name,
        comment
    });

    // Save the new review
    await newReview.save();

    // Push the new review to the trip's reviews array
    trip.reviews.push(newReview);

    // Save the updated trip
    await trip.save();

    console.log(trip);
    res.redirect(`/${id}`);

}

const aboutus = async (req, res) => {

    const allData = await Admin.find();


    const adminData = allData[0];

    const { d1, d2, d3, d4, p1, p2, p3, p4 } = adminData;


    const tripPackage1 = await Trip.findById(p1);
    const tripPackage2 = await Trip.findById(p2);
    const tripPackage3 = await Trip.findById(p3);
    const tripPackage4 = await Trip.findById(p4);

    const tripPackages = [tripPackage1, tripPackage2, tripPackage3, tripPackage4]

    res.render("trips/aboutus.ejs", { tripPackages })
}

const getSecondarySearch = async (req, res) => {

    // Extract values from req.body
    const destination = req.body.destination.trim(); // Use trim() to remove any leading/trailing spaces
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const fromdte = req.body.fromdte;
    const todte = req.body.todte;

    const categories = req.body.categories ? req.body.categories.split(',').map(cat => cat.trim()) : []; // Assuming categories can be comma-separated

    let query = {};

    // Add location to query if destination is provided and not empty
    if (destination) {
        query.location = { $regex: new RegExp(destination, 'i') }; // Case-insensitive match
    }

    // Add categories to query if any are provided
    if (categories.length > 0) {
        query.categories = { $in: categories }; // Match any of the provided categories
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

    // Parse 'fromdte' and 'todte' with the current year
    const currentYear = new Date().getFullYear();

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
            .exec();

        // console.log('Trips Found:', trips);  // Log the found trips


        res.render("trips/secondarySearch", { trips })

    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Error fetching trips');
    }
}

export { mainSearch, getSecondarySearch, aboutus, reviews, whislist, searchTrips, newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip, deleteTrip, mytrip, postEditTrip, catagariesTrips, priceFilter };

