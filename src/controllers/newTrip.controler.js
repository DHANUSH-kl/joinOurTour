import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import { storage } from '../cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });
import { Trip } from '../models/travel.model.js';

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage }).any());

// creating a new trip 

const newTripForm = async (req, res) => {
    res.render("trips/newTrip.ejs");
    
}

// posting new trip 

const addNewTrip = async (req, res) => {
    let { departure,endDate, catagaries,location,tripimages ,title, tripDescription, accomodations, aboutLeader, includes, totalDays, stopLocation, stopDescription } = req.body;
    let userId = req.user._id;
    // let tripImages = req.files;
    // let stopImages = req.files;

    // tripImages = tripImages.map(file => file.filename);
    // stopImages = stopImages.map(file => file.filename);

    // console.log("departure ", departure);
    // console.log("endDate ", endDate);
    // console.log('location ', location);
    // console.log("catagaries ", catagaries);
    // console.log('title ', title);
    // console.log('description ', tripDescription);
    // console.log('aboutLeader ', aboutLeader);
    // console.log('accomodations ', accomodations);
    // console.log('includes ', includes);
    // console.log('totalDays ', totalDays);
    // console.log('stopLocation ', stopLocation);
    // console.log('stopDescription ', stopDescription);
    // console.log('tripimages ', tripimages);


    // console.log("tripImages" , tripImages);
    // console.log("stopImages" , stopImages);


    const newTrip = new Trip({
        departure,
        endDate,
        location,
        catagaries,
        title,
        tripDescription,
        accomodations,
        includes,
        totalDays,
        stopLocation,
        stopDescription,
        owner : userId,
    });

    // console.log(newTrip);
    console.log(req.body)
    // await newTrip.save();


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
    // console.log(id);
    // console.log(trip);

    res.render("trips/editTrip.ejs", { trip })
}

const deleteTrip = async(req,res) => {
    let {id} = req.params;
    await Trip.findByIdAndDelete(id);
    res.redirect("/")
}


export { newTripForm, showAllTrips, addNewTrip, editTripForm, showTrip , deleteTrip };
