import { Router } from "express";
import { storage } from "../cloudinary.js";
import { showLeaderForm , addLeaderInfo } from "../controllers/leader.controller.js";
import multer from 'multer';
const upload = multer({ storage })

const router = Router();


router.route("/")
    .get(showLeaderForm)
    .post(addLeaderInfo)





export default router;