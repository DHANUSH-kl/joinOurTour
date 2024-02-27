import { Router } from "express";
const router = Router();
import { signupForm , signupUser ,  signinForm , signinUser  } from "../controllers/user.controller.js";
import passport from "passport";
import { asyncWrap } from "../constants.js";

router.route("/")
    .get(asyncWrap(signupForm))
    .post(signupUser)

router.route("/signin")
    .get(signinForm)
    .post( passport.authenticate("local" , {
        failureRedirect : "/signup",
    }) , signinUser)


export default router;