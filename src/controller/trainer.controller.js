const User = require("../model/userModel");

const getAllTrainer = async (req, res) => {
  const page = req.query.page;
  const limit = req.query.limit;
  const skip = (page - 1) * limit;
  console.log("Page", page, "limit", limit);
  try {
    const totalTrainers = await User.countDocuments({ role: "coach" });
    const totalPages = Math.ceil(totalTrainers / limit);
    const allTrainers = await User.find({ role: "coach" })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      status: true,
      data: allTrainers,
      totalPages: totalPages,
      page: page,
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

const getCurrentUser = async (req, res) => {
  console.log("OK HITTEEEE");
  const userID = req.user.userID;
  try {
    const findUser = await User.findById({ _id: userID }).populate({
      path: "trainerProfile.clients",
      select: "status",
    });

    res.status(200).json({
      status: true,
      data: findUser,
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
  getCurrentUser,
};
