const mongoose = require("mongoose");

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Database successfully connected");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
    process.exit(1); // Optional: exit if DB connection fails
  }
}

main();
