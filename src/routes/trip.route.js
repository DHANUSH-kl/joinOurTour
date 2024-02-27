import { Router } from "express";
import { addNewTrip, showAllTrips ,newTripForm,showTrip,editTripForm , deleteTrip , } from "../controllers/newTrip.controler.js";
import { storage } from "../cloudinary.js";
import multer from 'multer';
import { isLoggedIn , isAgent , isOwner } from "../middlewares.js";
import { asyncWrap } from "../constants.js";
const upload = multer({ storage })

const router = Router();

router.route("/createtrip")
    .get( isLoggedIn , isAgent , asyncWrap(newTripForm))
    .post( upload.fields([{ name: 'tripImages', maxCount: 10 }, { name: 'stopImages', maxCount: 10 }]),addNewTrip)

router.route("/")
    .get(showAllTrips)
    
router.route("/:id")
    .get(showTrip)
    .delete(deleteTrip)

router.route("/:id/editTrip")
    .get(editTripForm)

export default router;