const User = require("../model/userModel");

const getAllTrainer = async (req, res) => {
  try {
    const allTrainers = await User.find({ role: "coach" });
    res.status(200).json({
      status: true,
      data: allTrainers,
      message: "All trainers are successfully fetched",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getAllTrainer,
};
