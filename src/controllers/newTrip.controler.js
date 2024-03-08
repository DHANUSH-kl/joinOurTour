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
        ,excludes

    } = req.body;

    // Extract the trip and stop images from req.files
    const tripImages = req.files.tripImages ? req.files.tripImages.map(file => ({
        path: file.path, 
    })) : [];

    const stopImages = req.files.stopImages ? req.files.stopImages.map(file => ({
        path: file.path,
    })) : [];

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
        stopLocation,
        stopDescription,
        tripImages, 
        stopImages,
        owner : userId,
    });


    await User.findByIdAndUpdate(req.user._id, {
        $push: { createdTrips: newTrip._id },
    });

    // console.log(req.body);
    console.log(req.files);


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
    const trip = await Trip.findById(id).populate("owner");
    console.log(trip)
    res.render("trips/trip.ejs", { trip })
}

// edit trip 

const editTripForm = async (req, res) => {
    let {id} = req.params;
    const trip = await Trip.findById(id);
    res.render("trips/editTrip.ejs", { trip })
}

const postEditTrip = async (req, res) => {
    let { id } = req.params;

    // Extract trip details from the request body
    let {
        departure,
        endDate,
        categories,
        location,
        minTripmates,
        maxTripmates,
        tripimages,
        title,
        tripDescription,
        accomodations,
        aboutLeader,
        includes,
        excludes,
        totalDays,
        stopLocation,
        stopDescription,
        trainTicket,
        flightTicket,
        totalCost,
        buffer
    } = req.body;

    // Preprocess fields to replace undefined with empty string or empty array
    departure = departure ?? '';
    endDate = endDate ?? '';
    categories = categories ?? [];
    location = location ?? '';
    minTripmates = minTripmates ?? '';
    maxTripmates = maxTripmates ?? '';
    tripimages = tripimages ?? [];
    title = title ?? '';
    tripDescription = tripDescription ?? ' ';
    accomodations = accomodations ?? [];
    aboutLeader = aboutLeader ?? '';
    includes = includes ?? [];
    excludes = excludes ?? [];
    totalDays = totalDays ?? '';
    stopLocation = stopLocation ?? [];
    stopDescription = stopDescription ?? [];
    trainTicket = trainTicket ?? '';
    flightTicket = flightTicket ?? '';
    totalCost = totalCost ?? '';
    buffer = buffer ?? '';

    // Define the update object
    let update = {
        departure,
        endDate,
        categories,
        location,
        minTripmates,
        maxTripmates,
        tripimages,
        title,
        tripDescription,
        accomodations,
        aboutLeader,
        includes,
        excludes,
        totalDays,
        stopLocation,
        stopDescription,
        trainTicket,
        flightTicket,
        totalCost,
        buffer
    };

    console.log("update" , update);

    // Use findByIdAndUpdate to update the trip. The $set operator is used to specify the fields to update.
    const updatedTrip = await Trip.findByIdAndUpdate(id, { $set: update }, { new: true });

    if (!updatedTrip) {
        // Handle case where the trip is not found
        return res.status(404).send('Trip not found');
    }

    // Optionally, you can return the updated trip to the client or redirect to another page
    res.redirect(`/${id}`); 
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
    console.log(categories)
    const trips = await Trip.find({ categories: categories })
    res.render("trips/catagoriesTrip.ejs" , {trips})
}


export { newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip , deleteTrip , mytrip , postEditTrip , catagariesTrips };
