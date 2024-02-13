import { Router } from "express";
import { addNewTrip, showNewTrip } from "../controllers/newTrip.controler.js";

const router = Router();

router.route("/")
    .get(showNewTrip)
    .post(addNewTrip)


export default router;