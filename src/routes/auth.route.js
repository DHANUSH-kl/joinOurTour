import { Router } from "express";
const router = Router();
import passport from "passport";
import {User} from '../models/user.model.js';




router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);


// Google Authentication Callback
// Google Authentication Callback
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/user/signin' }), 
    async (req, res) => {

        if (!req.user) {
            return res.redirect('/user/signup');
        }

        try {
            const emailLower = req.user.email.toLowerCase();
            let user = await User.findOne({ email: emailLower });

            if (!user) {
                if (!req.session.signupData) {
                    return res.redirect('/user/signup');
                }

                // Create a new user
                user = new User({ 
                    ...req.session.signupData, 
                    email: emailLower, 
                    username: req.user.displayName 
                });

                await user.save();
                req.session.signupData = null;
            }

            // Log the user in
            req.login(user, (err) => {
                if (err) {
                    console.error("❌ Login Error:", err);
                    return res.redirect('/user/signin');
                }
                return res.redirect('/');
            });

        } catch (error) {
            console.error("❌ Google Signup Error:", error);
            res.redirect('/user/auth');
        }
    }
);


export default router;