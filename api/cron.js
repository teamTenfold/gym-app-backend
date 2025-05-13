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
