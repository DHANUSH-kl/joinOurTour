import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import { storage } from '../cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });
import {Leader} from '../models/tripLeader.model.js'

app.use(bodyParser.urlencoded({ extended: true }));


const showLeaderForm = async (req,res) => {
    res.render("admin/leaderForm.ejs")
}

const addLeaderInfo = async (req,res) => {
    const {leaderName , aboutLeader , leaderProfile } = req.body;

    const leaderInfo = new Leader ({
        leaderName,
        aboutLeader,
        leaderProfile
    });

    await leaderInfo.save();

    console.log(leaderInfo);

    res.redirect("/");
}



export { showLeaderForm , addLeaderInfo };