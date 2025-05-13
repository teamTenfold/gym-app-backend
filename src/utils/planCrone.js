const cron = require("node-cron");
const FitnessPlan = require("../model/planModal");

// Runs every minute for testing (change to '25 0 * * *' for 00:25 AM later)
cron.schedule(
  "55 * * * *",
  async () => {
    try {
      const now = new Date(); // Current UTC time
      console.log(`⏰ Cron running at: ${now.toISOString()}`);

      // 1. Activate plans where startDate <= now (UTC)
      const activationResult = await FitnessPlan.updateMany(
        {
          status: "upcoming",
          startDate: { $lte: now }, // Direct UTC comparison
        },
        { $set: { status: "active" } }
      );
      console.log(`✅ Activated ${activationResult.modifiedCount} plans`);

      // 2. Complete plans where endDate < now (UTC)
      const completionResult = await FitnessPlan.updateMany(
        {
          status: "active",
          endDate: { $lt: now },
        },
        { $set: { status: "completed" } }
      );
      console.log(`✅ Completed ${completionResult.modifiedCount} plans`);
    } catch (error) {
      console.error("❌ Cron failed:", error.message);
    }
  },
  {
    scheduled: true,
    timezone: "UTC", // Critical for matching your DB's +00:00 format
  }
);
