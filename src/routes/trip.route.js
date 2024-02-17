import { Router } from "express";
import { addNewTrip, showAllTrips ,newTripForm,showTrip } from "../controllers/newTrip.controler.js";
import { storage } from "../cloudinary.js";
import multer from 'multer';
const upload = multer({ storage })

const router = Router();

router.route("/")
    .get(newTripForm)
    .post( upload.array('tripImages[]' , 10),(addNewTrip))

router.route("/alltrips")
    .get(showAllTrips)


router.route("/alltrips/:id").get(showTrip)
export default router;