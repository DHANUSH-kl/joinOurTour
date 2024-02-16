import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import { storage } from '../cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));


const showNewTrip = (req,res) => {
    res.render("admin/newTrip.ejs")
}

const addNewTrip = (req,res)=>{
    let {departure,catagaries,title,description,accomodations,aboutLeader,includes,location,tripImages,totalDays,stopLocation,stopDescription} = req.body;
    const url = req.files.map(file => file.path);
    console.log("departure ",departure);
    console.log("catagaries ",catagaries);
    console.log('title ',title);
    console.log('description ',description);
    console.log('aboutLeader ',aboutLeader);
    console.log('accomodations ',accomodations);
    console.log('includes ',includes);
    console.log('totalDays ',totalDays);
    console.log('stopLocation ',stopLocation);
    console.log('stopDescription ',stopDescription);
    console.log('location ',location);
    
    // res.redirect("/");
}

export {showNewTrip , addNewTrip};
