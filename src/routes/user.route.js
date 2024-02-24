import { Router } from "express";
const router = Router();
import { signupForm , signupUser , signinForm , signinUser , becomeOwnerForm , postOwner } from "../controllers/user.controller.js";
import passport from "passport";

router.route("/")
    .get(signupForm)
    .post(signupUser)

router.route("/signin")
    .get(signinForm)
    .post( passport.authenticate("local" , {
        failureRedirect : "/signup",
    }) , signinUser)

    
router.route("/owner")
    .get(becomeOwnerForm)
    .post(postOwner)

export default router;