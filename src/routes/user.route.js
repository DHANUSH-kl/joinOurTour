import { Router } from "express";
const router = Router();
import { forgotPasswordPage , resetPasswordPage , forgotPassword, resetPassword , signupForm , signupUser ,  signinForm , signinUser, logout  } from "../controllers/user.controller.js";
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

router.route('/forgot-password')
    .get(asyncWrap(forgotPasswordPage))
    .post(asyncWrap(forgotPassword))

router.route('/reset-password/:token')
    .get(asyncWrap(resetPasswordPage))
    .post(asyncWrap(resetPassword))

export default router;