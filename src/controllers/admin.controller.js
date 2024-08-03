import express from 'express';
import bodyParser from 'body-parser';
import { storage } from '../cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });
const app = express();
import { User } from '../models/user.model.js';
import Admin from '../models/admin.model.js';
import { Trip } from '../models/travel.model.js';
import { Review } from '../models/review.model.js';

app.use(bodyParser.urlencoded({ extended: true }));

const becomeOwnerForm = async (req, res) => {
    res.render("admin/ownerForm.ejs")
}

const postOwner = async (req, res) => {
    const { secret } = req.body;
    if (secret == process.env.SECRET) {
        let user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { isOwner: true } },
            { new: true });
    } else {
        res.send("wrong password");
    }
}

const agentAccessForm = (req, res) => {
    res.render("admin/agentAccessFrom.ejs")
}

const postAgentAccess = async (req, res) => {
    let { username } = req.body;

    if (username) {
        let user = await User.findOneAndUpdate(
            { username: username },
            { $set: { isAgent: true } },
            { new: true }
        );
    }
}

const tripLeaderForm = async (req, res) => {
    res.render("admin/tripLeaderForm.ejs");
}

const postTripLeader = async (req, res) => {

    const { companyName, companyEstablishedYear, companyContactNumber, companyEmail, emergencyContactNumber, aboutCompany, languages } = req.body;

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

const displayPackages = async (req, res) => {


    const allData = await Admin.find();


    const adminData = allData[0];

    const { d1, d2, d3, d4, p1, p2, p3, p4 } = adminData;

    // Use Promise.all to fetch data concurrently
    const [destination1, destination2, destination3, destination4] = await Promise.all([
        Trip.findById(d1),
        Trip.findById(d2),
        Trip.findById(d3),
        Trip.findById(d4),
    ]);

    const [tripPackage1, tripPackage2, tripPackage3, tripPackage4] = await Promise.all([
        Trip.findById(p1),
        Trip.findById(p2),
        Trip.findById(p3),
        Trip.findById(p4),
    ]);

    const destinationPackages = [destination1, destination2, destination3, destination4]

    const tripPackages = [tripPackage1, tripPackage2, tripPackage3, tripPackage4]



    // const tripPackage = [p1,p2,p3,p4]

    res.render("admin/adminPannel.ejs", { tripPackages, destinationPackages })


}

const posttripPackage = async (req, res) => {

    const existingAdmin = await Admin.findOne({});

    if (existingAdmin) {
        return res.status(400).send("Admin data has already been filled. Only one entry is allowed.");
    }

    const { d1, d2, d3, d4, p1, p2, p3, p4 } = req.body;



    // Create a new instance of the Admin model

    const displayPackage = new Admin({
        d1,
        d2,
        d3,
        d4,
        p1,
        p2,
        p3,
        p4,
    });

    await displayPackage.save();


    console.log(displayPackage)
}

export { posttripPackage, becomeOwnerForm, postOwner, agentAccessForm, postAgentAccess, tripLeaderForm, postTripLeader, displayPackages }