import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import {User} from '../models/user.model.js';

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
   


export {signupForm , signupUser , signinForm , signinUser , logout };