import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/db.js'
import { app } from './app.js'
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import { urlencoded } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from "./models/user.model.js";
import { expressError } from './expressError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path: './env'
})


connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`server is listening to the port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log("mongoDB connection error", error);
    })

    

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
//express session


const sessionInfo = {
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
};



app.use(session(sessionInfo))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(cors());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    next();
});


//import routes

import tripRoutes from './routes/trip.route.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';

//route decleration

app.use("/", tripRoutes);
app.use("/user", userRoutes);
app.use("/admin" , adminRoutes);


// app.use((err, req, res, next) => {
//    res.send("SOMETHING went wrong");
// })


app.get('/', (req, res) => {
    // Generate JSON data (replace this with your actual data)
    const jsonData = { message: 'Hello, world!' };
  
    // Set the Content-Type header to indicate JSON response
    res.setHeader('Content-Type', 'application/json');
  
    // Send the JSON data as the response
    res.status(200).json(jsonData);
  });


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong!" } = err;
    res.status(statusCode).send(message);
})
app.all("*", (err, req, res, next) => {
    next(new expressError(404, "page not found"))
})

