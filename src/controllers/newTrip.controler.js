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
    const allTrips = await Trip.find().populate("owner");
    res.render("trips/showAll", { allTrips })

}

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

        // Initialize tripimages with existing tripimages or an empty array if not present
        let tripimages = existingTrip.tripimages || [];

        // Check if req.files.tripImages is defined
        if (req.files && req.files.tripImages) {
            // Loop through each uploaded trip image
            req.files.tripImages.forEach((file, index) => {
                // If the uploaded trip image at this index should be updated
                if (tripimages[index]) {
                    tripimages[index].path = file.path;
                } else {
                    // If there is no existing trip image at this index, add the new one
                    tripimages.push({ path: file.path });
                }
            });
        }

        // Initialize stopImages with existing stopImages or an empty array if not present
        let stopImages = existingTrip.stopImages || [];

        // Check if req.files.stopImages is defined
        if (req.files && req.files.stopImages) {
            // Loop through each uploaded stop image
            req.files.stopImages.forEach((file, index) => {
                // If the uploaded stop image at this index should be updated
                if (stopImages[index]) {
                    stopImages[index].path = file.path;
                } else {
                    // If there is no existing stop image at this index, add the new one at the end
                    stopImages.push({ path: file.path });
                }
            });
        }

        // Preprocess fields to replace undefined with empty string or empty array
        departure = departure || '';
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

        // Merge the new data with the existing data
        const mergedData = {
            ...existingTrip._doc,
            departure,
            endDate,
            categories,
            location,
            minTripmates,
            maxTripmates,
            tripimages: tripimages.length > 0 ? tripimages : existingTrip.tripImages,
            title,
            tripDescription,
            accomodations,
            aboutLeader,
            includes,
            excludes,
            totalDays,
            stopLocation,
            stopImages: stopImages.length > 0 ? stopImages : existingTrip.stopImages,
            stopDescription,
            trainTicket,
            flightTicket,
            totalCost,
            buffer
        };

        // Update the trip with the merged data
        const updatedTrip = await Trip.findByIdAndUpdate(id, { $set: mergedData }, { new: true });

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



// const searchTrips = async (req, res) => {
//     try {
//         const { location, checkIn, checkOut } = req.body;

//         // Convert checkIn and checkOut to Date objects
//         const departure = new Date(checkIn);
//         const endDate = new Date(checkOut);

//         // Exact match trips with case-insensitive location
//         const exactMatchTrips = await Trip.find({
//             location: { $regex: new RegExp('^' + location, 'i') },
//             departure,
//             endDate
//         });

//         // Date flexible trips with the same location
//         const dateFlexibleTrips = await Trip.find({ location: { $regex: new RegExp('^' + location, 'i') }});

//         // Location flexible trips with dates around the entered departure and end dates
//         const locationFlexibleTrips = await Trip.find({
//             departure: { $gte: new Date(departure.getTime() - 24 * 60 * 60 * 1000), $lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000) }
//         });

//         const allTrips = await Trip.find();

//         console.log(req.body);
//         console.log("Location:", location);
//         console.log("Date Flexible Trips Query:", { location });
//         console.log(exactMatchTrips, locationFlexibleTrips, dateFlexibleTrips);

//         res.render("trips/searchTrips.ejs", { exactMatchTrips, locationFlexibleTrips, dateFlexibleTrips, allTrips });

//     } catch (error) {
//         console.error("Error searching trips:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }


// const searchTrips = async (req, res) => {
//     try {
//         const { location, checkIn, checkOut } = req.body;

//         // Convert checkIn and checkOut to Date objects
//         const departure = new Date(checkIn);
//         const endDate = new Date(checkOut);

//         // Exact match trips with case-insensitive location
//         const exactMatchTrips = await Trip.find({
//             location: { $regex: new RegExp('^' + location, 'i') },
//             departure,
//             endDate
//         }).lean(); // Use lean() for better performance and easier manipulation

//         // Add category to exact match trips
//         exactMatchTrips.forEach(trip => trip.category = 'Exact Match');

//         // Date flexible trips with the same location
//         const dateFlexibleTrips = await Trip.find({
//             location: { $regex: new RegExp('^' + location, 'i') }
//         }).lean();

//         // Add category to date flexible trips
//         dateFlexibleTrips.forEach(trip => trip.category = 'Date Flexible');

//         // Location flexible trips with dates around the entered departure and end dates
//         const locationFlexibleTrips = await Trip.find({
//             departure: {
//                 $gte: new Date(departure.getTime() - 24 * 60 * 60 * 1000),
//                 $lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
//             }
//         }).lean();

//         // Add category to location flexible trips
//         locationFlexibleTrips.forEach(trip => trip.category = 'Location Flexible');

//         const allTrips = await Trip.find().lean();

//         console.log(req.body);
//         console.log("Location:", location);
//         console.log("Date Flexible Trips Query:", { location });
//         console.log(exactMatchTrips, locationFlexibleTrips, dateFlexibleTrips);

//         res.render("trips/searchTrips.ejs", {
//             exactMatchTrips,
//             locationFlexibleTrips,
//             dateFlexibleTrips,
//             allTrips
//         });

//     } catch (error) {
//         console.error("Error searching trips:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


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

    res.render("trips/aboutus.ejs" , {tripPackages})
}

const getSecondarySearch = async(req,res) => {
    console.log(req.body)
}

export { getSecondarySearch , aboutus, reviews, whislist, searchTrips, newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip, deleteTrip, mytrip, postEditTrip, catagariesTrips, priceFilter };

