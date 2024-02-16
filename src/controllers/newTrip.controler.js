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
    let {departure,catagaries,title,description,accomodations,aboutLeader,includes,tripImages} = req.body;
    const url = req.files.map(file => file.path);
    console.log(departure);
    console.log(catagaries);
    console.log(title);
    console.log(description);
    console.log(aboutLeader);
    console.log(accomodations);
    console.log(includes);
    console.log(tripImages);
    console.log(url);
    
    // res.redirect("/");
}

export {showNewTrip , addNewTrip};
