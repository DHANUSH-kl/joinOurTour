import dotenv from 'dotenv';
import express  from 'express';
import connectDB from './db/db.js'
import {app} from './app.js'
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import { urlencoded } from 'express';
import path from 'path'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path:'./env'
})


connectDB()
.then( ()=> {
    app.listen(process.env.PORT , ()=> {
        console.log(`server is listening to the port ${process.env.PORT}`)
    })
} )
.catch((error)=>{
    console.log( "mongoDB connection error" , error );
})


app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname , "/public")));
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views" ));
app.engine("ejs",ejsMate);


app.get("/",(req,res)=> {
    res.render("admin/newTrip.ejs")
})

app.post("/",(req,res) => {
    let {departure,tripTitle,totalDays,startLocation,tripDescription,} = req.body;
    console.log(departure);
    console.log(tripTitle);
    console.log(totalDays);
    console.log(startLocation);
    console.log(tripDescription);
    res.redirect("/");
})