import { Router } from "express";
const router = Router();
import passport from "passport";
import {User} from '../models/user.model.js';



// Google Authentication Route
router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Authentication Callback
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/user/signin' }), 
    async (req, res) => {
        const { email } = req.user;
        const emailLower = email.toLowerCase();

        try {
            let user = await User.findOne({ email: emailLower });

            if (!user) {
                // If no user exists and no signupData is present, redirect to signup
                if (!req.session.signupData) return res.redirect('/user/signup');

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
                    console.error('Login Error:', err);
                    return res.redirect('/user/signin');
                }
                return res.redirect('/'); // Redirect to home after login
            });

        } catch (error) {
            console.error('Google Signup Error:', error);
            res.redirect('/user/auth');
        }
    }
);

export default router;