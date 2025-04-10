import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import {User} from '../models/user.model.js';
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from 'crypto';
import nodemailer from 'nodemailer';


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Temporary storage for OTPs
const otpStorage = {};

// Function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Render the signup page
const signupForm = async (req, res) => {
    console.log(req.user);
    res.render("user/signupForm.ejs");
}

const signupUser = async (req, res) => {
  

    const { firstName, lastName, state, city, phoneNumber } = req.body;
    req.session.signupData = { firstName, lastName, state, city, phoneNumber };

    console.log(firstName);
    res.redirect('/user/auth'); // Redirect to next step



};

const auth = async (req,res) => {
    if (!req.session.signupData) return res.redirect('/user/signup');
    res.render('user/auth.ejs');
}

const authdata = async(req,res) => {
    const { username, email, password } = req.body;
    const emailLower = email.toLowerCase();
    
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: emailLower });
        if (existingUser) return res.status(400).send('Email is already registered.');

        // Generate OTP
        const otp = generateOTP();

        // Store user data and OTP temporarily
        otpStorage[emailLower] = { otp, userData: { ...req.session.signupData, username, email: emailLower, password } };
        req.session.email = emailLower;

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Signup',
            text: `Your OTP is: ${otp}`,
        });
        
        console.log(`OTP sent to ${email}: ${otp}`);
        res.redirect('/user/verify-user');
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).send('An error occurred. Please try again.');
    }
}

const savesignupdata = async(req,res) => {
    req.session.signupData = req.body;
}

const verifyOtpAndSignup = async (req, res) => {
    const { otp } = req.body;
    const email = req.session.email; // Retrieve email from session

    console.log("otp" , otp);

    if (!email) {
        return res.status(400).send('Email not found in session.');
    }

    // Check if OTP exists for the email
    const storedData = otpStorage[email.toLowerCase()];
    if (!storedData || storedData.otp !== otp) {
        return res.status(400).send('Invalid or expired OTP.');
    }

    try {
        // OTP is correct, create the user
        const { username, phoneNumber, firstName, lastName, state,city, password } = storedData.userData;
        const newUser = new User({ username, email: email.toLowerCase(), phoneNumber, firstName, lastName, state,city });

        // Register user with Passport local Mongoose
        await User.register(newUser, password);

        // Clear OTP storage and session email
        delete otpStorage[email.toLowerCase()];
        req.session.email = null; // Clear the email from session

        // Redirect to success or login page
        res.redirect('/user/signin');
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).send('An error occurred. Please try again.');
    }
};


// Render OTP verification page
const verifyUserPage = async (req, res) => {
    res.render("user/verify.ejs");
}

const signinForm = async (req,res) => {

    const user=req.user;
    res.render("user/signinForm.ejs", {user});
}

const signinUser = async(req,res) => {
    req.flash("success", "Signed in successfully!");
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
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

   // Find the user by email, and select only the fields you need
   const user = await User.findOne({ email: email.toLowerCase() }).select('email username');

    console.log("user details: ",user)

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

   
        // Update the user's password using the setPassword method
        await user.setPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Save the user without triggering validation
        await user.save({ validate: false });

    res.send('Password has been reset.');
};

const forgotPasswordPage = async(req,res)=> {


    res.render("user/forgotPassword.ejs");

}

const resetPasswordPage = async(req,res)=> {

    const { token } = req.params; // Extract token from URL parameters
    res.render("user/resetPassword.ejs", { token }); // Pass token to template

}

const forgotUsername = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if a user exists with the provided email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).send('No user found with that email.');
        }

        // Email the username to the user
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Your Username',
            text: `Hello,\n\nWe received a request to retrieve your username. Here it is:\n\n
            Username: ${user.username}\n\n
            If you did not request this, please ignore this email.\n`,
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                return res.status(500).send('Error sending email.');
            }
            res.send('Username has been sent to your email.');
        });
        res.redirect("/user/signin")
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred.');
    }
};


const usernamePage = async(req,res) => {
    res.render("user/username.ejs")
}



export {forgotUsername,auth, savesignupdata,usernamePage,authdata, verifyUserPage, verifyOtpAndSignup , resetPasswordPage ,forgotPasswordPage , forgotPassword, resetPassword , signupForm , signupUser , signinForm , signinUser , logout };