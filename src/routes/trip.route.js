import { Router } from "express";
import express from 'express';
import { getpayment , reportTrip, showWishlist, deleteReview, discoverPage, mainSearch, getSecondarySearch, whislist, aboutus, addNewTrip, showAllTrips, newTripForm, showTrip, editTripForm, deleteTrip, mytrip, postEditTrip, catagariesTrips, priceFilter, searchTrips, reviews, fetchWhislist } from "../controllers/newTrip.controler.js";
import { storage } from "../cloudinary.js";
import bodyParser from 'body-parser';
import { isLoggedIn, isAgent, isOwner } from "../middlewares.js";
import { asyncWrap } from "../constants.js";
import multer from 'multer';
import mongoose from 'mongoose';

const upload = multer({ storage });

const router = Router();

// Middleware to parse form data
router.use(express.urlencoded({ extended: true }));

// Specific Routes
router.route("/aboutus")
    .get(asyncWrap(aboutus));

router.route("/report-trip/:id")
    .post(reportTrip);

router.route("/update-wishlist")
    .post(isLoggedIn, asyncWrap(whislist));

router.route("/reviews")
    .post(reviews);

router.route("/fetchWhislist")
    .get(fetchWhislist);

router.route("/showWishlist")
    .get(isLoggedIn, showWishlist);

router.route("/discover")
    .post(discoverPage);

router.route("/priceFilter")
    .post(asyncWrap(priceFilter));

router.route("/searchTrips")
    .post(asyncWrap(searchTrips));

router.route("/secondarysearch")
    .post(asyncWrap(getSecondarySearch));

router.route("/mainSearch")
    .post(asyncWrap(mainSearch));

router.route("/catagories")
    .post(asyncWrap(catagariesTrips));

router.route("/mytrips")
    .get(isLoggedIn, asyncWrap(mytrip));

// Generic Routes
router.route("/")
    .get(asyncWrap(showAllTrips))
    .post(asyncWrap(whislist));

// Dynamic Routes

router.route("/:id/payment")
    .get(getpayment)

router.route("/tour/:id")
    .get(asyncWrap(showTrip))
    .delete(asyncWrap(deleteTrip));

router.route("/:id/editTrip")
    .get(asyncWrap(editTripForm))
    .put(upload.fields([{ name: 'tripImages', maxCount: 10 }, { name: 'stopImages', maxCount: 10 }]), asyncWrap(postEditTrip));

// Create Trip Route
router.route("/createtrip")
    .get(asyncWrap(newTripForm))
    .post(upload.fields([{ name: 'tripImages', maxCount: 10 }, { name: 'stopImages', maxCount: 10 }]), (addNewTrip));

// Add Route to Handle Favicon Requests
router.get('/favicon.ico', (req, res) => res.status(204).end());




export default router;
