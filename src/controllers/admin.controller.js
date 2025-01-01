import express from 'express';
import methodOverride from 'method-override'
import bodyParser from 'body-parser';
import { storage } from '../cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });
const app = express();
import { User } from '../models/user.model.js';
import Admin from '../models/admin.model.js';
import { Trip } from '../models/travel.model.js';
import { Review } from '../models/review.model.js';
import nodemailer from 'nodemailer';


app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

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

    res.render("admin/admin.ejs", { tripPackages, destinationPackages })


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

const editAdminForm =async (req,res) => {

    try {
        // Fetch all Admin documents and get the first one
        const allAdminData = await Admin.find();
        const adminData = allAdminData[0]; // Access the first document

        if (!adminData) {
            return res.status(404).send('Admin data not found.');
        }

        // Render the EJS template with the admin data
        res.render('admin/editAdmin.ejs', { adminData });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the admin data.');
    }

}

const editAdminPannel = async(req,res) => {

    try {
        const updatedData = req.body;

        // Find all Admin documents and get the first one
        const allAdminData = await Admin.find();
        const adminData = allAdminData[0]; // Access the first document

        if (!adminData) {
            return res.status(404).send('Admin data not found.');
        }

        // Update the document with new values
        Object.assign(adminData, updatedData);

        // Save the updated document
        await adminData.save();

        console.log(adminData);
        res.status(200).send('Admin data updated successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while updating the admin data.');
    }

}

const walletPage = async(req,res)=> {

    res.render("admin/wallet.ejs")

}


const sendCoin = async(req,res) => {

    const { email, tokens } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email: email }); // Assuming 'username' is the field used for email in passport-local-mongoose

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Add tokens to the user's wallet
        user.wallet += Number(tokens);  // Make sure tokens are treated as a number

        // Save the updated user document
        await user.save();

        // Respond with a success message
        res.send(`Successfully added ${tokens} tokens to ${email}'s wallet.`);
    } catch (error) {
        console.error('Error sending tokens:', error);
        res.status(500).send('Internal Server Error');
    }


}

const adminPerks = async(req,res) => {

    try {
        const pendingTrips = await Trip.find({ status: 'pending' });
        res.render('admin/adminPerks.ejs', { pendingTrips });
      } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Internal Server Error');
    }


}



const updateTripStatus = async (req, res) => {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
  
    try {
      const trip = await Trip.findById(id).populate('owner');
  
      if (!trip) return res.status(404).send('Trip not found');
  
      if (action === 'accept') {
        trip.status = 'accepted';
        await trip.save();

      } else if (action === 'reject') {
        trip.status = 'rejected';
        trip.rejectionReason = rejectionReason;

         // Check if the owner and email exist
         if (!trip.owner || !trip.owner.email) {
            return res.status(400).send('Owner email not found');
        }


         // Get the owner's email dynamically using getOwnerEmail method
         const ownerEmail = await trip.owner.email;
         if (!ownerEmail) {
             return res.status(400).send('Owner email not found');
         }
  
        // Send rejection email
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password
          },
        });
  
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: ownerEmail,
          subject: 'Trip Rejection Notification',
          text: `Your trip titled "${trip.title}" has been rejected. Reason: ${rejectionReason}`,
        });
      }
  
      res.redirect('admin/adminpannel');
    } catch (error) {
      console.error('Error updating trip status:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  


const analytics = async(req,res) => {


    const { ratingFilter, minRatingCount, sortRevenue, page = 1 } = req.query;
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;

    try {
        const operators = await User.find({ isTourOperator: true })
            .populate({
                path: 'trips',
                match: {
                    ratingsAverage: ratingFilter ? { $gte: ratingFilter } : undefined,
                    ratingsQuantity: minRatingCount ? { $gte: minRatingCount } : undefined,
                },
                options: {
                    sort: sortRevenue ? { revenue: sortRevenue === 'asc' ? 1 : -1 } : undefined,
                },
            });

        const totalTrips = await Trip.countDocuments();
        const totalPages = Math.ceil(totalTrips / limit);

        // Ensure `trips` is always an array
        const sanitizedOperators = operators.map(operator => ({
            ...operator.toObject(),
            trips: operator.trips || [], // Default to an empty array if trips is undefined
        }));

        res.render('admin/analyticsPage', {
            operators: sanitizedOperators,
            totalPages,
            currentPage: Number(page),
        });
    } catch (err) {
        console.error('Error generating trip reports:', err);
        res.status(500).send('Server Error');
    }


}





const reportedTrips = async (req, res) => {
    try {
        console.log("Fetching reported trips...");

        const sortOrder = req.query.sort === 'asc' ? 1 : -1; // Determine the sort order based on the query parameter

        // Fetch all trips with their reports and sort by the number of reports (high to low or low to high)
        const trips = await Trip.aggregate([
            { $match: { "report.0": { $exists: true } } }, // Only trips with reports
            {
                $project: {
                    title: 1,
                    reportCount: { $size: "$report" },
                    topReason: { $arrayElemAt: ["$report.reason", 0] },
                    reports: { $ifNull: ["$report", []] } // Safeguard: Ensure reports is always an array
                }
            },
            { $sort: { reportCount: sortOrder } } // Sort based on reportCount (ascending or descending)
        ]);

        console.log("Trips fetched:", trips);

        if (trips.length === 0) {
            console.log("No trips found with reports.");
        }

        // Map the trips to the necessary format
        const tripData = trips.map(trip => ({
            tripId: trip._id,
            title: trip.title,
            count: trip.reportCount,
            topReason: trip.topReason || "No reason provided",
            allReports: Array.isArray(trip.reports) 
                ? trip.reports.map(r => ({
                    reason: r.reason,
                    reportedAt: r.reportedAt // Show the report creation time
                }))
                : [] // Ensure it's an empty array if reports is not an array
        }));

        // Render the EJS template
        res.render("admin/reportedTrips", { tripData });
    } catch (err) {
        console.error("Error fetching reported trips:", err);
        res.status(500).send("An error occurred while fetching reported trips.");
    }
};

// Fetch all reports for a specific trip
const fetchTripReports = async (req, res) => {
    try {
        const tripId = req.params.tripId;

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).send("Trip not found");
        }

        res.json({ reports: trip.report });
    } catch (err) {
        console.error("Error fetching trip reports:", err);
        res.status(500).send("An error occurred while fetching trip reports.");
    }
};




export { fetchTripReports , reportedTrips , analytics , updateTripStatus , adminPerks , walletPage , sendCoin , editAdminForm , editAdminPannel, posttripPackage, becomeOwnerForm, postOwner, agentAccessForm, postAgentAccess, tripLeaderForm, postTripLeader, displayPackages }