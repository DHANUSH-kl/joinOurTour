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
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {User} from "./models/user.model.js";

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

//express session


const sessionInfo ={
    secret : process.env.sessionSecret,
    resave : false,
    saveUninitialized : true
};

app.use(session(sessionInfo))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname , "/public")));
app.use(cookieParser());
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views" ));
app.engine("ejs",ejsMate);



//import routes

import tripRoutes from './routes/trip.route.js';
import leaderRoutes from './routes/leader.route.js';
import userRoutes from './routes/user.route.js';

//route decleration

app.use("/" , tripRoutes);
app.use("/leaderform" , leaderRoutes);
app.use("/signup" , userRoutes);


