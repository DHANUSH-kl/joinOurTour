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
  secret: process.env.SESSIONSECRET,
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

// Error handling
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

app.all('*', (req, res, next) => {
  next(new expressError(404, 'Page not found'));
});

// Default route
app.get('/', (req, res) => {
  const jsonData = { message: 'Hello, world!' };
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(jsonData);
});
