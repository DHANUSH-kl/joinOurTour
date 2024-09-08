import { Router } from "express";
import express from 'express';
import { deleteReview , discoverPage , mainSearch,  getSecondarySearch , whislist,aboutus, addNewTrip, showAllTrips ,newTripForm,showTrip,editTripForm  , deleteTrip , mytrip , postEditTrip , catagariesTrips , priceFilter ,searchTrips, reviews} from "../controllers/newTrip.controler.js";
import { storage } from "../cloudinary.js";
import bodyParser from 'body-parser';
import { isLoggedIn , isAgent , isOwner } from "../middlewares.js";
import { asyncWrap } from "../constants.js";
import multer from 'multer';
const upload = multer({ storage })

const router = Router();

// Middleware to parse form data
router.use(express.urlencoded({ extended: true }));

router.route("/createtrip")
    .get(asyncWrap( newTripForm ) )
    .post( upload.fields([{ name: 'tripImages', maxCount: 10 }, { name: 'stopImages', maxCount: 10 }]) ,(addNewTrip))

router.route("/aboutus")
    .get(asyncWrap(aboutus))

router.route("/update-wishlist")
    .post( isLoggedIn , asyncWrap(whislist))

router.route("/reviews")
    .post(reviews)

router.route("/discover")
    .post(discoverPage)

router.route("/")
    .get(asyncWrap(showAllTrips))
    .post(asyncWrap(whislist))

router.route("/:id/reviews")
    .post(asyncWrap(reviews))


router.route("/reviews/:id/delete")
    .post(deleteReview)

router.route("/priceFilter")
    .post( asyncWrap(priceFilter))

router.route("/searchTrips")
    .post(asyncWrap(searchTrips))

router.route("/secondarysearch")
    .post(asyncWrap(getSecondarySearch))

router.route("/mainSearch")
    .post(asyncWrap(mainSearch))

router.route("/catagaries")
    .post(asyncWrap( catagariesTrips ))
    
router.route("/mytrips")
    .get( isLoggedIn , asyncWrap(mytrip) )
    
router.route("/:id")
    .get(asyncWrap(showTrip))
    .delete(asyncWrap(deleteTrip))

router.route("/:id/editTrip")
    .get(asyncWrap(editTripForm))
    .put(upload.fields([{ name: 'tripImages', maxCount: 10 }, { name: 'stopImages', maxCount: 10 }]),asyncWrap(postEditTrip))

export default router;