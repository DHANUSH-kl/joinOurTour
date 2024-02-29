import express from 'express';
import bodyParser from 'body-parser';
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
    console.log(req.files);
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

    } = req.body;

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
        totalDays,
        stopLocation,
        stopDescription,
        owner : userId,
    });
    console.log(newTrip);
    // console.log(req.body.catagaries)
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
    res.render("trips/trip.ejs", { trip })
}

// edit trip 

const editTripForm = async (req, res) => {
    let { id } = req.params;
    const trip = await Trip.findById(id);
    console.log(trip);
    res.render("trips/editTrip.ejs", { trip })
}

const deleteTrip = async(req,res) => {
    let {id} = req.params;
    await Trip.findByIdAndDelete(id);
    res.redirect("/")
}


export { newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip , deleteTrip };
