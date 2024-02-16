import { Router } from "express";
import { addNewTrip, showNewTrip } from "../controllers/newTrip.controler.js";
import { storage } from "../cloudinary.js";
import multer from 'multer';
const upload = multer({ storage })

const router = Router();

router.route("/")
    .get(showNewTrip)
    .post( upload.array('tripImages[]' , 10),(addNewTrip))


export default router;