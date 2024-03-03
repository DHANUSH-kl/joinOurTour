import { Router } from "express";
const router = Router();
import { signupForm , signupUser ,  signinForm , signinUser, logout  } from "../controllers/user.controller.js";
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

export default router;