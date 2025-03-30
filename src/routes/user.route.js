import { Router } from "express";
const router = Router();
import {forgotUsername,usernamePage,auth,savesignupdata,verifyOtpAndSignup,authdata, verifyUserPage, forgotPasswordPage , resetPasswordPage , forgotPassword, resetPassword , signupForm , signupUser ,  signinForm , signinUser, logout  } from "../controllers/user.controller.js";
import passport from "passport";
import { asyncWrap } from "../constants.js";
import { isAgent, isLoggedIn, isOwner ,saveRedirectUrl} from "../middlewares.js";



// Google Authentication
// router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// router.route("/auth/google/callback")
//     .get(passport.authenticate('google', { failureRedirect: '/user/auth' }), async (req, res) => {
//         if (!req.session.signupData) return res.redirect('/user/signup');
        
//         const { email } = req.user;
//         const emailLower = email.toLowerCase();
        
//         try {
//             // Check if user already exists
//             const existingUser = await User.findOne({ email: emailLower });
//             if (existingUser) return res.redirect('/user/signin');
            
//             // Save user data
//             const newUser = new User({ ...req.session.signupData, email: emailLower, username: req.user.displayName });
//             await newUser.save();
            
//             req.session.signupData = null;
//             res.redirect('/user/signin');
//         } catch (error) {
//             console.error('Google Signup Error:', error);
//             res.redirect('/user/auth');
//         }
//     });


router.route("/save-signup-data")
    .post(savesignupdata)


router.route("/auth")
    .get(auth)
    .post(authdata)
    

router.route("/signup")
    .get(asyncWrap(signupForm))
    .post(signupUser)

router.route("/signin")
    .get(signinForm)
    .post(saveRedirectUrl, passport.authenticate("local" , {
        failureRedirect : "/user/signin",
        failureFlash: "Invalid username or password!",
    }) , signinUser)



router.route("/verify-user")
    .get(verifyUserPage)
    .post(verifyOtpAndSignup)

router.route("/forgot-username")
    .get(usernamePage)
    .post(forgotUsername)

router.route("/logout")
    .get(asyncWrap(logout))

router.route('/forgot-password')
    .get(asyncWrap(forgotPasswordPage))
    .post(asyncWrap(forgotPassword))

router.route('/reset-password/:token')
    .get(asyncWrap(resetPasswordPage))
    .post(asyncWrap(resetPassword))

export default router;