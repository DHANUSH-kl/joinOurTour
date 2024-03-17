import express from 'express';
import bodyParser from 'body-parser';
import { storage } from '../cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });
const app = express();
import {User} from '../models/user.model.js';

app.use(bodyParser.urlencoded({ extended: true }));

const becomeOwnerForm = async(req,res) => {
    res.render("admin/ownerForm.ejs")
}

const postOwner = async(req,res) => {
    const {secret} = req.body;
    if( secret == process.env.SECRET )  {
       let  user = await User.findByIdAndUpdate( 
            req.user._id,
            { $set: { isOwner: true } },
            { new: true });
    } else {
        res.send("wrong password");
    }
}

const agentAccessForm = (req,res) => {
    res.render("admin/agentAccessFrom.ejs")
}

const postAgentAccess = async (req,res) => {
   let {username} = req.body;

   if (username) {
    let user =  await User.findOneAndUpdate(
        { username: username },
        { $set: { isAgent: true } },
        { new: true }
    );
   }
}

const tripLeaderForm = async(req,res) => {
    res.render("admin/tripLeaderForm.ejs");
}

const postTripLeader = async (req,res) => {

    const { companyName, companyEstablishedYear, companyContactNumber, companyEmail, emergencyContactNumber , aboutCompany , languages } = req.body;

    // Create a new Leader instance
    const tripLeader = {
        companyName,
        companyEstablishedYear,
        companyContactNumber,
        companyEmail,
        emergencyContactNumber,
        aboutCompany,
        languages,
    };

    // Update the user with the tripLeader information
    const user = await User.findByIdAndUpdate(req.user._id, { tripLeader });
    console.log(req.body)
    // console.log(user);



}

export { becomeOwnerForm , postOwner , agentAccessForm , postAgentAccess , tripLeaderForm , postTripLeader }