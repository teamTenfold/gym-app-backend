// const cron = require("node-cron");
// const FitnessPlan = require("../model/planModal");

// // Runs every minute for testing (change to '25 0 * * *' for 00:25 AM later)
// cron.schedule(
//   "55 * * * *",
//   async () => {
//     try {
//       const now = new Date(); // Current UTC time
//       console.log(`⏰ Cron running at: ${now.toISOString()}`);

//       // 1. Activate plans where startDate <= now (UTC)
//       const activationResult = await FitnessPlan.updateMany(
//         {
//           status: "upcoming",
//           startDate: { $lte: now }, // Direct UTC comparison
//         },
//         { $set: { status: "active" } }
//       );
//       console.log(`✅ Activated ${activationResult.modifiedCount} plans`);

//       // 2. Complete plans where endDate < now (UTC)
//       const completionResult = await FitnessPlan.updateMany(
//         {
//           status: "active",
//           endDate: { $lt: now },
//         },
//         { $set: { status: "completed" } }
//       );
//       console.log(`✅ Completed ${completionResult.modifiedCount} plans`);
//     } catch (error) {
//       console.error("❌ Cron failed:", error.message);
//     }
//   },
//   {
//     scheduled: true,
//     timezone: "UTC", // Critical for matching your DB's +00:00 format
//   }
// );
const mongoose = require("mongoose");
const FitnessPlan = require("../src/model/planModal");

const MONGODB_URI = process.env.MONGODB_URI;

async function connectToDB() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  try {
    await connectToDB();

    const now = new Date();
    console.log(`⏰ Cron running at: ${now.toISOString()}`);

    // Activate plans
    const activationResult = await FitnessPlan.updateMany(
      {
        status: "upcoming",
        startDate: { $lte: now },
      },
      { $set: { status: "active" } }
    );

    // Complete plans
    const completionResult = await FitnessPlan.updateMany(
      {
        status: "active",
        endDate: { $lt: now },
      },
      { $set: { status: "completed" } }
    );

    res.status(200).json({
      activated: activationResult.modifiedCount,
      completed: completionResult.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Cron failed:", error.message);
    res.status(500).json({ error: error.message });
  }
}
