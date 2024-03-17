import { Router } from "express";
import { becomeOwnerForm, postOwner, agentAccessForm, postAgentAccess, tripLeaderForm, postTripLeader } from "../controllers/admin.controller.js";
import { asyncWrap } from "../constants.js";
import { isAgent, isLoggedIn, isOwner } from "../middlewares.js";
import multer from 'multer';
import { storage } from "../cloudinary.js";

const upload = multer({ storage });
const router = Router();


router.route("/owner")
    .get( isLoggedIn , becomeOwnerForm)
    .post(postOwner)

router.route("/grantagentaccess")
    .get(isLoggedIn , isOwner , agentAccessForm)
    .post(postAgentAccess)

router.route("/tripleaderform")
    .get(isLoggedIn , tripLeaderForm)
    .post(postTripLeader)



export default router;