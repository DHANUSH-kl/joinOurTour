import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/db.js';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from './models/user.model.js';
import { expressError } from './expressError.js';
import tripRoutes from './routes/trip.route.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import Razorpay from "razorpay";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Connect to database
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Session setup
const sessionInfo = {
  secret: process.env.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};

app.use(session(sessionInfo));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// EJS setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set current user for all views
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

// Route declarations
app.use('/', tripRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

app.get("/favicon.ico", (req, res) => res.status(204));


app.use((err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  console.error(err.stack); // Logs the full stack trace for debugging

  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});







