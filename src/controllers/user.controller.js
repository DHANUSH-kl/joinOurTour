import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import {User} from '../models/user.model.js';
import Twilio from 'twilio';
const client = Twilio(process.env.YOUR_TWILIO_ACCOUNT_SID, process.env.YOUR_TWILIO_AUTH_TOKEN);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const signupForm = async (req,res) => {
    res.render("user/signupForm.ejs");
}

const signupUser = async(req,res) => {
    const {username , email , password } = req.body;

    const newUser  = new User({
        username,
        email,
    });
    const registeredUser  = await User.register(newUser , password);

    console.log(registeredUser);
    // res.redirect("/")
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
   
const twilioForm = async(req,res)=> {
    res.render("user/twilioForm.ejs")
}



const sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    
    // Add country code if not provided
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // Send OTP via SMS
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhoneNumber
        });

        // Store OTP in session
        req.session.otp = otp;
        req.session.phoneNumber = formattedPhoneNumber;

        res.status(200).send('OTP sent');
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send('Failed to send OTP');
    }
};


const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    if (otp === req.session.otp) {
        req.session.authenticated = true;
        req.session.otp = null;
        res.status(200).send('Authenticated');
    } else {
        res.status(400).send('Invalid OTP');
    }
};

export {sendOtp, verifyOtp, twilioForm ,signupForm , signupUser , signinForm , signinUser , logout };