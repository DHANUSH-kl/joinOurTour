import { Router } from "express";
const router = Router();
import { sendOtp, verifyOtp ,twilioForm , signupForm , signupUser ,  signinForm , signinUser, logout  } from "../controllers/user.controller.js";
import passport from "passport";
import { asyncWrap } from "../constants.js";



router.route("/signup")
    .get(asyncWrap(signupForm))
    .post(signupUser)

router.route("/signin")
    .get(signinForm)
    .post( passport.authenticate("local" , {
        failureRedirect : "/user/signup",
    }) , signinUser)

router.route("/logout")
    .get(asyncWrap(logout))

router.route("/phonenumberSignin")
    .get(asyncWrap(twilioForm))

// Route to send OTP
router.route("/send-otp")
    .post(asyncWrap(sendOtp));

// Route to verify OTP
router.route("/verify-otp")
    .post(asyncWrap(verifyOtp));

export default router;