import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import { storage } from '../cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });
import { Trip } from '../models/travel.model.js';

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));


// creating a new trip 

const newTripForm = async (req,res) => {
    res.render("admin/newTrip.ejs" );
}

// posting new trip 

const addNewTrip = async (req,res)=>{
    let {departure,catagaries,title,tripDescription,accomodations,aboutLeader,includes,location,tripImages,totalDays,stopLocation,stopDescription} = req.body;
    const url = req.files.map(file => file.path);
    console.log("departure ",departure);
    console.log("catagaries ",catagaries);
    console.log('title ',title);
    console.log('description ',tripDescription);
    console.log('aboutLeader ',aboutLeader);
    console.log('accomodations ',accomodations);
    console.log('includes ',includes);
    console.log('totalDays ',totalDays);
    console.log('stopLocation ',stopLocation);
    console.log('stopDescription ',stopDescription);
    console.log('location ',location);


    const newTrip = new Trip ({
        departure,
        location,
        catagaries,
        title,
        tripDescription,
        accomodations,
        includes,
        totalDays,
        stopLocation,
        stopDescription,
    });

    await newTrip.save();
    console.log(newTrip);

    
    res.redirect("/");
}

// displaying all trips 

const showAllTrips = async (req,res) => {
    const allTrips = await Trip.find();
    console.log(allTrips)

    res.render( "admin/showAll" , {allTrips})
}

// showing particular trip 

const showTrip = async (req,res) => {
    let {id} = req.params;
    const trip = await Trip.findById(id);
    res.render("admin/trip.ejs" , {trip})
}



export { newTripForm ,showAllTrips , addNewTrip , showTrip};
