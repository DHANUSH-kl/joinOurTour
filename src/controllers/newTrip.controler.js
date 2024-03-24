import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../models/user.model.js';
import { storage } from '../cloudinary.js';
import multer from 'multer';
import { Trip } from '../models/travel.model.js';
const upload = multer({ storage });
const app = express();

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// creating a new trip 

const newTripForm = async (req, res) => {
    res.render("trips/newTrip.ejs");    
}

// posting new trip 

const addNewTrip = async (req, res) => {

    let { departure
        ,endDate
        ,categories
        ,location
        ,minTripmates
        ,maxTripmates
        ,tripimages
        ,title
        ,tripDescription
        ,accomodations
        ,aboutLeader
        ,includes
        ,totalDays
        ,stopLocation
        ,stopDescription
        ,trainTicket
        ,flightTicket
        ,totalCost
        ,buffer
        ,transport
        ,excludes

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
        owner : userId,
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

    console.log(trip)

}

// edit trip 

const editTripForm = async (req, res) => {
    let {id} = req.params;
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



const deleteTrip = async(req,res) => {
    let {id} = req.params;
    await Trip.findByIdAndDelete(id);

     // Remove the trip ID from the user's createdTrips array
     await User.findByIdAndUpdate(req.user._id , {
        $pull: { createdTrips: id },
    });

    res.redirect("/")
}

const mytrip = async(req,res) => {
    const trips = await User.findById(req.user._id).populate("createdTrips");
    res.render("trips/mytrip.ejs" , {trips} )
}

const catagariesTrips = async(req,res) => {
    const {categories} = req.body;

    const trips = await Trip.find({ categories: { $in: categories } });

    res.render("trips/catagoriesTrip.ejs" , {trips})
}


const priceFilter = async(req,res) => {


    const {minTotal , maxTotal} = req.body;

     // Find trips whose total cost is within the specified range
     const allTrips = await Trip.find({
        totalCost: { $gte: minTotal, $lte: maxTotal }
    });

    console.log(trips)

    res.render("trips/priceFilterTrip.ejs" , {allTrips})

}


const searchTrips = async(req,res) => {
    try {
        const { location } = req.body;

        // Sanitize input if necessary

        // Perform search query
        const allTrips = await Trip.find({
            location: {
                $regex: new RegExp('^' + location, 'i')
            }
        });

        res.render("trips/searchTrips.ejs" ,{allTrips});

    } catch (error) {
        console.error("Error searching trips:", error);
        res.status(500).json({ error: "Internal server error" });
    }

}

export { searchTrips , newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip , deleteTrip , mytrip , postEditTrip , catagariesTrips , priceFilter };
