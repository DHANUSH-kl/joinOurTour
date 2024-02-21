import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import {User} from '../models/user.model.js';


app.use(bodyParser.urlencoded({ extended: true }));


const signupForm = async (req,res) => {
    res.render("user/signupForm.ejs");
}

const signupUser = async(req,res) => {
    const {username , email , password } = req.body;

    const newUser  = new User({
        username,
        email
    });

    const registeredUser  = await User.register(newUser , password);

    console.log(registeredUser);
    res.redirect("/allTrips")
}

const signinForm = async (req,res) => {
    res.render("user/signinForm.ejs");
}

const signinUser = async(req,res) => {
    res.redirect("/allTrips")
}
export {signupForm , signupUser , signinForm , signinUser };