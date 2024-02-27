import { Router } from "express";
const router = Router();
import { asyncWrap } from "../constants.js";
import { isAgent, isLoggedIn, isOwner } from "../middlewares.js";
import { becomeOwnerForm , postOwner , agentAccessForm , postAgentAccess , tripLeaderForm , postTripLeader } from "../controllers/admin.controller.js";


router.route("/owner")
    .get( isLoggedIn , becomeOwnerForm)
    .post(postOwner)

router.route("/grantagentaccess")
    .get(isLoggedIn , isOwner , agentAccessForm)
    .post(postAgentAccess)

router.route("/tripleaderform")
    .get(isLoggedIn ,isAgent , tripLeaderForm)
    .post(postTripLeader)


export default router;