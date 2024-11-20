import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import {User} from '../models/user.model.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const signupForm = async (req,res) => {
    res.render("user/signupForm.ejs");
}

const signupUser = async(req,res) => {
   

    const { username, email, password, phoneNumber, fullName} = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).send('Email is already registered.');
        }

        // Create a new user
        const newUser = new User({
            username,
            email: email.toLowerCase(),
            phoneNumber,
            fullName
        });

        // Register user with Passport local Mongoose
        await User.register(newUser, password);
        
        // Redirect or send success message
        res.redirect('/');  // or any other page after successful signup
    } catch (error) {
        console.error('Signup Error:', error);  // Log the error
        res.status(500).send('An error occurred. Please try again.');
    }


}

const signinForm = async (req,res) => {
    res.render("user/signinForm.ejs");
}

const signinUser = async(req,res) => {
    res.redirect("/")
}

const logout = (req, res, next) => {
    req.logout(err => {
       if (err) return next(err);
    });
    res.redirect('/');
    
};
   

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },

});




// Forgot password route
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        return res.status(404).send('No user found with that email.');
    }

    // Generate a token and set its expiration
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send the email
    const resetUrl = `${process.env.RESET_PASSWORD_URL}/${token}`;
    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of your password.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            return res.status(500).send('Error sending email.');
        }
        res.send('Password reset email sent.');
    });
};

// Reset password route
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).send('Password reset token is invalid or has expired.');
    }

    // Update the user's password
    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send('Password has been reset.');
};

const forgotPasswordPage = async(req,res)=> {

    const user = await User.findOne({ email: "dhanushchandu123@gmail.com" });

    console.log(user)

    res.render("user/forgotPassword.ejs");

}

const resetPasswordPage = async(req,res)=> {

    const { token } = req.params; // Extract token from URL parameters
    res.render("user/resetPassword.ejs", { token }); // Pass token to template

}

export {  resetPasswordPage ,forgotPasswordPage , forgotPassword, resetPassword , signupForm , signupUser , signinForm , signinUser , logout };