import { Router } from "express";
import express from 'express';
import { contactPage,createOrder,getUserBookings,cancelBooking,verifyPayment,showFeaturedTrips,showtoursbymonth,tourbymonths,tourbydestination,showgroupdestination ,contactUsPost , getpayment , reportTrip, showWishlist,searchTrips, deleteReview, discoverPage, mainSearch, getSecondarySearch, whislist, aboutus, addNewTrip, showAllTrips, newTripForm, showTrip, editTripForm, deleteTrip, mytrip, postEditTrip, catagariesTrips, priceFilter, reviews, fetchWhislist } from "../controllers/newTrip.controler.js";
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




router.route("/featuredtrips")
    .get(showFeaturedTrips)

router.route("/showtourbymonths/:month")
    .get(showtoursbymonth)

router.route("/tourbymonths")
    .get(tourbymonths)

router.route("/group/:fromLocation/:location")
    .get(showgroupdestination)

router.route("/tourbydestination")
    .get(tourbydestination)

router.route("/contactUs")
    .get(contactPage)
    .post(contactUsPost)


router.route("/aboutus")
    .get(asyncWrap(aboutus));

router.route("/report-trip/:id")
    .post(reportTrip);

router.route("/update-wishlist")
    .post(isLoggedIn, asyncWrap(whislist));

router.route("/tour/:id/reviews")
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
    .get(asyncWrap(getSecondarySearch));
    

router.route("/mainSearch")
    .post(asyncWrap(mainSearch));

router.route("/catagories")
    .post(asyncWrap(catagariesTrips));

router.route("/mytrips")
    .get(isLoggedIn,isAgent, asyncWrap(mytrip));

router.route("/create-order")
    .post(createOrder)

router.route("/verify-payment")
    .post(verifyPayment)

router.route("/bookings")
    .get(getUserBookings)

router.route("/cancel-booking/:id")
    .post(cancelBooking)



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
    .get(isLoggedIn,isAgent,asyncWrap(newTripForm))
    .post(upload.fields([{ name: 'tripImages', maxCount: 10 }, { name: 'stopImages', maxCount: 10 }]), (addNewTrip));

// Add Route to Handle Favicon Requests
router.get('/favicon.ico', (req, res) => res.status(204).end());




export default router;
