import { Router } from "express";
import { addNewTrip, showAllTrips ,newTripForm,showTrip,editTripForm , deleteTrip , } from "../controllers/newTrip.controler.js";
import { storage } from "../cloudinary.js";
import multer from 'multer';
import { isLoggedIn , isAgent , isOwner } from "../middlewares.js";
import { asyncWrap } from "../constants.js";
const upload = multer({ storage })

const router = Router();

router.route("/createtrip")
    .get(asyncWrap(newTripForm))
    .post( asyncWrap( addNewTrip ) );

router.route("/")
    .get(asyncWrap(showAllTrips))
    
router.route("/:id")
    .get(asyncWrap(showTrip))
    .delete(asyncWrap(deleteTrip))

router.route("/:id/editTrip")
    .get(asyncWrap(editTripForm))

export default router;