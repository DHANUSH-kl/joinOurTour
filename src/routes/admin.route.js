import { Router } from "express";
import { updateTripStatus , adminPerks , sendCoin , walletPage , editAdminForm ,editAdminPannel, posttripPackage , displayPackages,becomeOwnerForm, postOwner, agentAccessForm, postAgentAccess, tripLeaderForm, postTripLeader } from "../controllers/admin.controller.js";
import { asyncWrap } from "../constants.js";
import { isAgent, isLoggedIn, isOwner } from "../middlewares.js";
import multer from 'multer';
import { storage } from "../cloudinary.js";

const upload = multer({ storage });
const router = Router();


router.route("/featuredTrips")
    .get(displayPackages)
    .post(posttripPackage)

router.route("/adminpannel")
    .get(adminPerks)

router.route("/:id/update-status")
    .post(updateTripStatus);



router.route("/featuredTrips/editfeaturedTrips")
    .get(editAdminForm)
    .put(editAdminPannel)


router.route("/owner")
    .get( isLoggedIn , becomeOwnerForm)
    .post(postOwner)

router.route("/grantagentaccess")
    .get(isLoggedIn , isOwner , agentAccessForm)
    .post(postAgentAccess)

router.route("/tripleaderform")
    .get(isLoggedIn , tripLeaderForm)
    .post(postTripLeader)

router.route("/sendCoins")
    .get(walletPage)
    .post(sendCoin)


export default router;