import dotenv from 'dotenv';
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
import { Booking } from '../models/booking.model.js';
import { Payment } from "../models/payment.model.js";  // Adjust path if needed
import { Review } from '../models/review.model.js';
import { CompletedTrip } from '../models/CompletedTrip.model.js';
import { TripPayout } from "../models/tripPayout.model.js";
import moment from 'moment';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';

dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// Create a transporter instance
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App password or real password
    }
});


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

const editAdminForm = async (req, res) => {

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

const editAdminPannel = async (req, res) => {

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

const walletPage = async (req, res) => {

    res.render("admin/wallet.ejs")

}


const sendCoin = async (req, res) => {

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

const adminPerks = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        let filter = {};
        let completedFilter = {};
        let ongoingFilter = {};

        console.log("Received Dates:", fromDate, toDate); // Debugging

        if (fromDate && toDate) {
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);
            endDate.setHours(23, 59, 59, 999); // Ensure full-day inclusion

            // Filter for created trips in the date range
            filter = { createdAt: { $gte: startDate, $lte: endDate } };

            // Filter for completed trips (trips that ended within the date range)
            completedFilter = { endDate: { $gte: startDate, $lte: endDate } };

            // Filter for ongoing trips (trips that started before `toDate` but are still ongoing)
            ongoingFilter = { endDate: { $gt: endDate } };
        }

        console.log("Filter Query:", JSON.stringify(filter, null, 2)); // Debugging
        console.log("Completed Trips Filter:", JSON.stringify(completedFilter, null, 2)); // Debugging
        console.log("Ongoing Trips Filter:", JSON.stringify(ongoingFilter, null, 2)); // Debugging

        // Fetch pending trips with filter (created within date range)
        const pendingTrips = await Trip.find({ status: 'pending', ...filter }) || [];
        console.log("Filtered Pending Trips:", pendingTrips.length);

        const today = new Date();
        const users = await User.find({ isAgent: true }).populate({
            path: "createdTrips",
        });

        console.log("Filtered Users:", users.length);

        const formattedUsers = users.map(user => {
            const createdTrips = user.createdTrips.filter(trip =>
                fromDate && toDate ? trip.createdAt >= filter.createdAt.$gte && trip.createdAt <= filter.createdAt.$lte : true
            ).length;

            const completedTrips = user.createdTrips.filter(trip =>
                fromDate && toDate ? trip.endDate >= completedFilter.endDate.$gte && trip.endDate <= completedFilter.endDate.$lte : trip.endDate < today
            ).length;

            const ongoingTrips = user.createdTrips.filter(trip =>
                fromDate && toDate ? trip.endDate > ongoingFilter.endDate.$gt : trip.endDate >= today
            ).length;

            return {
                id: user._id,
                username: user.username,
                email: user.email,
                createdTrips,
                completedTrips,
                ongoingTrips,
                revenue: `$${user.wallet ? user.wallet.toLocaleString() : "0"}`,
            };
        });

        res.render('admin/adminPerks.ejs', { pendingTrips, agents: formattedUsers });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Internal Server Error');
    }
};



const tripManagement = async (req, res) => {
    try {
        const pendingTrips = await Trip.find({ status: 'pending' });

        console.log("Pending Trips Count:", pendingTrips.length);

        res.render("admin/tripManagement.ejs", { pendingTrips });
    } catch (error) {
        console.error("Error fetching pending trips:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};





const updateTripStatus = async (req, res) => {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    const user = await User.findById(req.user._id);

    try {
        const trip = await Trip.findById(id).populate('owner');

        if (!trip) return res.status(404).send('Trip not found');

        if (action === 'accept') {
            trip.status = 'accepted';
            // Deduct 100 tokens from the user's wallet after creating the trip
            user.wallet -= 100;
            await user.save(); // Save the updated user wallet
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

            // Delete the rejected trip
            await trip.deleteOne();  // This will remove the trip from the database

        }

        res.redirect('/');

    } catch (error) {
        console.error('Error updating trip status:', error);
        res.status(500).send('Internal Server Error');
    }
};



const analytics = async (req, res) => {


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
        const sortOrder = req.query.sort === 'asc' ? 1 : -1; // Determine sort order

        const trips = await Trip.aggregate([
            { $match: { "report.0": { $exists: true } } }, // Only trips with reports
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            {
                $project: {
                    title: 1,
                    reportCount: { $size: "$report" },
                    topReason: { $arrayElemAt: ["$report.reason", 0] },
                    reports: { $ifNull: ["$report", []] },
                    ownerUsername: { $arrayElemAt: ["$ownerDetails.username", 0] } // Extract owner's username
                }
            },
            { $sort: { reportCount: sortOrder } }
        ]);

        const tripData = trips.map(trip => ({
            tripId: trip._id,
            title: trip.title,
            count: trip.reportCount,
            topReason: trip.topReason || "No reason provided",
            ownerUsername: trip.ownerUsername || "Unknown Owner",
        }));

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


const revokeAgent = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isAgent = false;
        user.revoked = true;
        user.suspendedUntil = null;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Agent Access Revoked",
            text: `Dear ${user.username}, your agent access has been revoked.`
        });

        res.json({ message: "Agent access revoked" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}


const suspendAgent = async (req, res) => {

    try {
        const { days } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isAgent = false;
        user.suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        await user.save();

        res.json({ message: `User suspended for ${days} days` });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }

}


const liftSuspension = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.suspendedUntil = null;
        user.isAgent = true;
        await user.save();
        res.json({ message: "User suspension lifted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

const revokedPage = async (req, res) => {
    try {
        const users = await User.find({ suspendedUntil: { $exists: true } }); // Fetch suspended users
        res.render("admin/revokedAc.ejs", { users }); // Pass data to EJS
    } catch (error) {
        console.error("Error fetching revoked users:", error);
        res.status(500).send("Internal Server Error");
    }
};


const revokedData = async (req, res) => {
    try {
        const users = await User.find({
            $or: [{ isAgent: false }, { suspendedUntil: { $exists: true, $gt: new Date() } }]
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error("Error fetching revoked users:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const agentTrips = async (req, res) => {
    try {
        const { type, agentId } = req.params;
        let trips = [];

        if (type === "created") {
            trips = await Trip.find({ owner: agentId });
        } else if (type === "completed") {
            trips = await Trip.find({
                owner: agentId,
                endDate: { $lt: new Date() } // Completed trips (end date is in the past)
            });
        } else if (type === "ongoing") {
            trips = await Trip.find({
                owner: agentId,
                endDate: { $gte: new Date() } // Ongoing trips (end date is in the future)
            });
        } else {
            return res.status(400).send("Invalid trip type");
        }

        res.render("admin/agentTrips.ejs", { trips, type });
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).send("Internal Server Error");
    }
}


const dashboard = async (req, res) => {
    try {
        const selectedYear = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        const monthlySignups = [];

        for (let month = 0; month < 12; month++) {
            const startOfMonth = new Date(Date.UTC(selectedYear, month, 1)); // Use UTC
            const endOfMonth = new Date(Date.UTC(selectedYear, month + 1, 0, 23, 59, 59)); // End of month

            const count = await User.countDocuments({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            monthlySignups.push({ month: month + 1, count }); // Store month numbers for labels
        }

        // Total Users & Agents
        const totalUsers = await User.countDocuments({});
        const totalAgents = await User.countDocuments({ isAgent: true });

        // Most Popular Trip Categories
        const categoryData = await Trip.aggregate([
            { $unwind: "$categories" },
            { $group: { _id: "$categories", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Trips Per Duration
        const durationData = await Trip.aggregate([
            { $group: { _id: "$totalDays", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // console.log("Monthly Signups", monthlySignups);
        // console.log("Total Users", totalUsers);
        // console.log("Total Agents", totalAgents);
        // console.log("Category Data", categoryData);
        // console.log("monthlySignups", monthlySignups);

      
        // Step 1: Aggregate total revenue per trip from Booking
        const revenueData = await Booking.aggregate([
            {
                $match: { status: "booked" } // ✅ Only confirmed bookings
            },
            {
                
                $group: {
                    _id: "$trip",
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        // Step 2: Fetch trip titles from both Trip and CompletedTrip models
        const tripIds = revenueData.map(item => item._id);
        const activeTrips = await Trip.find({ _id: { $in: tripIds } }, "_id title");
        const completedTrips = await CompletedTrip.find({ _id: { $in: tripIds } }, "_id title");

        // Merge all trips into a lookup map for easy access
        const tripTitleMap = new Map();
        [...activeTrips, ...completedTrips].forEach(trip => {
            tripTitleMap.set(trip._id.toString(), trip.title);
        });

        // Step 3: Prepare final topRevenueData array
        const topRevenueData = revenueData.map(item => ({
            _id: item._id,
            totalRevenue: item.totalRevenue,
            title: tripTitleMap.get(item._id.toString()) || "Unknown Trip"
        }));

        console.log("Revenue Aggregation:", revenueData);
        console.log("Trip IDs from Booking:", tripIds);
        console.log("Active Trips:", activeTrips);
        console.log("Completed Trips:", completedTrips);
        
        


        res.render('admin/dashboard', {
            userSignups: monthlySignups, // Fixed structure
            selectedYear,
            totalUsers,
            totalAgents,
            categoryData,
            durationData,
            topRevenueData
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Internal Server Error");
    }
};





const userInsight = async (req, res) => {
    try {
        const users = await User.find({}, 'username firstName lastName state city phoneNumber email'); // Fetch only required fields
        res.render('admin/allUsers', { users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const agentInsight = async (req, res) => {
    try {
        const agents = await User.find({ isAgent: true }, 'username firstName lastName state city phoneNumber email tripLeader');
        res.render('admin/agentUsers', { agents });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}


const userRecord = async (req, res) => {
    try {
        const users = await User.find({}, 'username firstName lastName state city phoneNumber email createdAt')
            .sort({ createdAt: -1 }); // Sort by most recent signups

        res.render('admin/userRecord.ejs', { users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}


const togglefeaturedtours = async (req, res) => {
    try {
        const { id } = req.params;
        const { featured } = req.body; // Get the value from the form

        // Update the trip
        const updatedTrip = await Trip.findByIdAndUpdate(id, { featured: featured === "true" }, { new: true });

        if (!updatedTrip) {
            return res.status(404).send("Trip not found.");
        }

        res.redirect(`/tour/${id}`); // Redirect back to the trip details page
    } catch (error) {
        console.error("Error updating featured status:", error);
        res.status(500).send("Server error.");
    }
}


const managefeatured = async (req, res) => {
    try {
        // Fetch all featured trips and populate owner details
        const featuredTrips = await Trip.find({ featured: true }).populate("owner");

        res.render("admin/managefeatured.ejs", { featuredTrips });
    } catch (error) {
        console.error("Error fetching featured trips:", error);
        res.status(500).send("Server error.");
    }
};


const getAdminTripPayments = async (req, res) => {
    try {
        // Ongoing Trips
        const ongoingTrips = await Trip.find().populate('owner').lean();
        const ongoingBookings = await Booking.find({
            trip: { $in: ongoingTrips.map(t => t._id) },
            status: 'booked',
            "payment.status": "captured"
        }).lean();

        const ongoingMap = {};
        ongoingBookings.forEach(b => {
            const id = b.trip.toString();
            if (!ongoingMap[id]) ongoingMap[id] = { revenue: 0, count: 0 };
            ongoingMap[id].revenue += b.totalAmount;
            ongoingMap[id].count += 1;
        });

        // Completed Trips
        const completedTrips = await CompletedTrip.find().populate('owner').lean();
        const completedBookings = await Booking.find({
            trip: { $in: completedTrips.map(t => t.originalTripId) },
            status: 'booked',
            "payment.status": "captured"
        }).lean();

        const completedMap = {};
        completedBookings.forEach(b => {
            const id = b.trip.toString();
            if (!completedMap[id]) completedMap[id] = { revenue: 0 };
            completedMap[id].revenue += b.totalAmount;
        });

        const payouts = await TripPayout.find().lean();
        const payoutMap = {};
        payouts.forEach(p => {
            payoutMap[p.trip.toString()] = p;
        });

        // Attach data
        ongoingTrips.forEach(trip => {
            const id = trip._id.toString();
            trip.totalRevenue = ongoingMap[id]?.revenue || 0;
            trip.totalBookings = ongoingMap[id]?.count || 0;
            trip.advancePaid = payoutMap[id]?.advancePaid || 0;
        });

        completedTrips.forEach(trip => {
            const id = trip.originalTripId.toString();
            trip.totalRevenue = completedMap[id]?.revenue || 0;

            const payout = payoutMap[id] || {};
            trip.advancePaid = payout.advancePaid || 0;
            trip.finalPaid = payout.finalPaid || 0;
            trip.commissionRate = payout.commissionRate || 10;
            trip.fixedCharges = payout.fixedCharges || 0;
            trip.finalSettlementAmount = trip.totalRevenue - trip.advancePaid - (trip.totalRevenue * trip.commissionRate / 100) - trip.fixedCharges;
            trip.profit = trip.totalRevenue - trip.finalSettlementAmount;
        });

        res.render("admin/adminTripdetails.ejs", {
            ongoingTrips,
            completedTrips
        });
    } catch (err) {
        console.error("❌ Admin trip payment error:", err);
        res.status(500).send("Internal Server Error");
    }
};

const getTransactionsPage = async (req, res) => {
    const { month } = req.query; // format: 2025-04
    const start = new Date(`${month}-01`);
    const end = new Date(`${month}-31`);

    const payouts = await TripPayout.find({ "transactions.date": { $gte: start, $lte: end } })
        .populate("trip operator")
        .lean();

    const results = [];

    payouts.forEach(payout => {
        const monthTx = payout.transactions.filter(t => t.date >= start && t.date <= end);
        const adv = monthTx.find(t => t.type === "advance");
        const final = monthTx.find(t => t.type === "final");

        results.push({
            trip: payout.trip.title || "Trip",
            operator: payout.operator.firstName,
            advanceAmount: adv?.amount,
            finalAmount: final?.amount,
            advanceDone: !!adv,
            finalDone: !!final
        });
    });

    res.render("admin/transactions.ejs", { results, month });
};





const settlePayment = async (req, res) => {
    try {
        const { tripId, commission } = req.body;
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).send("Trip not found");
        }

        const bookings = await Booking.find({ tripId, status: "Paid" });
        const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
        const profit = (totalRevenue * commission) / 100;
        const totalPayable = totalRevenue - profit;

        // Here, integrate Razorpay or other payout logic
        console.log(`Settling ₹${totalPayable} to trip operator for trip ${trip.title}`);

        res.json({ success: true, message: "Payment settled successfully!" });
    } catch (error) {
        console.error("Error settling payment:", error);
        res.status(500).send("Internal Server Error");
    }
};


const getrefundrequest = async (req, res) => {
    try {
        const refundRequests = await Booking.find({ status: "Refund Requested" })
            .populate('user', 'username email phoneNumber')
            .populate('trip', 'title departure endDate')
            .select('totalAmount refundableAmount paymentId status'); // ✅ Add missing fields



        const today = new Date();

        refundRequests.forEach(request => {
            if (!request.trip || !request.trip.departure || !request.totalAmount) {
                request.refundableAmount = 0; // If trip details are missing, set refund to 0
                return;
            }

            const tripStart = new Date(request.trip.departure); // Use departure instead of startDate
            const daysBeforeStart = Math.floor((tripStart - today) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

            console.log(`Trip Title: ${request.trip.title}`);
            console.log(`Departure Date: ${request.trip.departure}`);
            console.log(`Days Before Start: ${daysBeforeStart}`);
            console.log(`Total Amount: ${request.totalAmount}`);

            if (daysBeforeStart > 30) {
                request.refundableAmount = request.totalAmount; // Full refund
            } else if (daysBeforeStart > 7) {
                request.refundableAmount = request.totalAmount * 0.70; // 70% refund
            } else {
                request.refundableAmount = request.totalAmount * 0.50; // 50% refund
            }

            request.refundableAmount = parseFloat(request.refundableAmount.toFixed(2)); // Format to 2 decimal places
            console.log(`Refundable Amount: ${request.refundableAmount}`);
        });

        console.log("Refund Requests Data:", refundRequests);


        res.render('admin/adminrefunds.ejs', { refundRequests });
    } catch (error) {
        console.error("Error fetching refund requests:", error);
        res.status(500).send("Internal Server Error");
    }
};



const settleRefund = async (req, res) => {
    try {
        console.log("🔄 Received Refund Request:", req.body);

        const { bookingId, email, amount } = req.body;

        if (!bookingId || !email || !amount) {
            console.log("❌ Missing required fields");
            return res.status(400).send("Missing required fields");
        }

        // ✅ Fetch booking details and populate trip data
        const booking = await Booking.findById(bookingId).populate('trip');
        if (!booking) {
            console.log("❌ Booking not found");
            return res.status(404).send("Booking not found");
        }

        const trip = booking.trip;
        if (!trip) {
            console.log("❌ Trip not found");
            return res.status(404).send("Trip not found");
        }

        // ✅ Ensure the refund is still pending
        if (booking.status !== "Refund Requested") {
            console.log("❌ Refund request is not pending");
            return res.status(400).send("Refund request is not pending");
        }

        // ✅ Get Razorpay Payment ID
        const razorpayPaymentId = booking.payment?.paymentId;
        if (!razorpayPaymentId) {
            console.log("❌ Razorpay Payment ID not found for this booking");
            return res.status(400).send("Razorpay Payment ID not found for this booking");
        }

        console.log(`✅ Processing refund for Payment ID: ${razorpayPaymentId}, Amount: ₹${amount}`);

        // ✅ Initiate Razorpay refund
        try {
            const razorpayResponse = await razorpay.payments.refund(razorpayPaymentId, {
                amount: Math.round(amount * 100), // Convert to paisa
                speed: "normal",
                notes: { reason: "Trip cancellation refund" }
            });

            console.log("✅ Razorpay Refund Success:", razorpayResponse);

            // ✅ Restore trip spots (tickets)
            const totalCostPerTicket = trip.totalCost;
            const numTickets = Math.round(booking.totalAmount / totalCostPerTicket);
            trip.spots += numTickets;
            await trip.save();
            console.log(`✅ Updated trip spots: ${trip.spots}`);

            // ✅ Update booking status
            booking.payment.status = "Refunded";
            booking.status = "refunded";
            await booking.save();
            console.log("✅ Booking status updated to refunded");

            // ✅ Send Email Confirmation
            await sendRefundEmail(email, amount);

            return res.send({ success: true, message: "Refund processed successfully!" });

        } catch (razorpayError) {
            console.error("❌ Error processing refund:", razorpayError);
            return res.status(500).send("Failed to process refund. Please try again.");
        }
    } catch (error) {
        console.error("❌ Internal Server Error:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Function to Send Email Notification
async function sendRefundEmail(email, amount) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Refund Processed Successfully",
        text: `Your refund of ₹${amount} has been successfully processed. It will be credited within 3-5 working days.`
    };

    await transporter.sendMail(mailOptions);
}

export { userInsight, getTransactionsPage, settleRefund, getAdminTripPayments, getrefundrequest, settlePayment, managefeatured, togglefeaturedtours, userRecord, agentInsight, agentTrips, dashboard, tripManagement, revokedData, revokedPage, liftSuspension, suspendAgent, revokeAgent, fetchTripReports, reportedTrips, analytics, updateTripStatus, adminPerks, walletPage, sendCoin, editAdminForm, editAdminPannel, posttripPackage, becomeOwnerForm, postOwner, agentAccessForm, postAgentAccess, tripLeaderForm, postTripLeader, displayPackages }