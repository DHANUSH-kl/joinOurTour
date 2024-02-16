import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));


const showNewTrip = (req,res) => {
    res.render("admin/newTrip.ejs")
}

const addNewTrip = (req,res)=>{
    let {departure,catagaries,title,description,accomodations,aboutLeader,includes} = req.body;
    console.log(departure);
    console.log(catagaries);
    console.log(title);
    console.log(description);
    console.log(aboutLeader);
    console.log(accomodations);
    console.log(includes);
    res.redirect("/");
}

export {showNewTrip , addNewTrip};
