import { Router } from "express";
import {agentTrips,getTransactionsPage,managefeatured,getrefundrequest,settleRefund ,settlePayment,agentInsight,getAdminTripPayments ,togglefeaturedtours,userRecord, userInsight , tripManagement, dashboard ,revokedPage,revokedData,liftSuspension,suspendAgent,revokeAgent, fetchTripReports , reportedTrips , analytics , updateTripStatus , adminPerks , sendCoin , walletPage , editAdminForm ,editAdminPannel, posttripPackage , displayPackages,becomeOwnerForm, postOwner, agentAccessForm, postAgentAccess, tripLeaderForm, postTripLeader } from "../controllers/admin.controller.js";
import { asyncWrap } from "../constants.js";
import { isAgent, isLoggedIn, isOwner } from "../middlewares.js";
import multer from 'multer';
import { storage } from "../cloudinary.js";

const upload = multer({ storage });
const router = Router();


router.route("/managefeatured")
    .get(managefeatured)

router.route("/:id/toggle-featured")
    .post(togglefeaturedtours)

router.route("/userRecord")
    .get(userRecord)

router.route("/userInsight")
    .get(userInsight)

router.route("/agentInsight")
    .get(agentInsight)



router.route("/dashboard")
    .get(dashboard)


router.route("/tripManagement")
    .get(tripManagement)

router.route("/trips/:type/:agentId")
    .get(agentTrips)


router
    .get("/revoked-users", revokedPage);

router
    .get("/revoked-users-data", revokedData);

router
    .put("/revoke-access/:id", revokeAgent);

router
    .put("/suspend/:id", suspendAgent);

router
    .put("/lift-suspension/:id", liftSuspension);



router.route("/featuredTrips")
    .get(displayPackages)
    .post(posttripPackage)

router.route("/adminpannel")
    .get(adminPerks)

router.route("/fetchReports")
    .get(reportedTrips)

router.route("/reportedTrips/:tripId")
    .get(fetchTripReports)

router.route("/analyticsPage")
    .get(analytics)

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

router.route("/getAdminTripPayments")
    .get(getAdminTripPayments)

router.route('/transactions')
    .get(getTransactionsPage);

router.route("/settle-payment")
    .post(settlePayment)

router.route("/refund-requests")
    .get(getrefundrequest)

router.route("/settle-refund")
    .post(settleRefund)

export default router;