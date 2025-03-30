import cron from "node-cron";
import { Trip } from "../models/travel.model.js";
import { CompletedTrip } from "../models/completedTrip.model.js";

cron.schedule("* * * * *", async () => { // Runs every night at midnight
    console.log("🔄 Running completed trips job...");

    const expiredTrips = await Trip.find({ endDate: { $lt: new Date() } });

    console.log(`🛠 Found ${expiredTrips.length} expired trips.`);

    if (expiredTrips.length === 0) {
        console.log("⚠️ No expired trips found. Check the database.");
        return;
    }

    for (const trip of expiredTrips) {
        const existing = await CompletedTrip.findOne({ originalTripId: trip._id });
        if (!existing) {
            console.log(`📌 Moving trip: ${trip.title} (ID: ${trip._id})`);

            await CompletedTrip.create({
                originalTripId: trip._id,
                departure: trip.departure,
                endDate: trip.endDate,
                fromLocation: trip.fromLocation,
                location: trip.location,
                categories: trip.categories,
                title: trip.title,
                totalCost: trip.totalCost,
                owner: trip.owner,
                reviews: trip.reviews,
            });

            await Trip.deleteOne({ _id: trip._id });
        }
    }

    console.log(`✅ Moved ${expiredTrips.length} trips to CompletedTrip.`);
});
