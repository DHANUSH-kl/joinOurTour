import { Router } from "express";
import { addNewTrip, showAllTrips ,newTripForm,showTrip,editTripForm , deleteTrip , mytrip , postEditTrip , catagariesTrips } from "../controllers/newTrip.controler.js";
import { storage } from "../cloudinary.js";
import multer from 'multer';
import { isLoggedIn , isAgent , isOwner } from "../middlewares.js";
import { asyncWrap } from "../constants.js";
const upload = multer({ storage })

const router = Router();

router.route("/createtrip")
    .get(asyncWrap( newTripForm ) )
    .post( upload.fields([{ name: 'tripImages', maxCount: 10 }, { name: 'stopImages', maxCount: 10 }]),(addNewTrip))
    
router.route("/")
    .get(asyncWrap(showAllTrips))

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