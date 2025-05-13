const FitnessPlan = require("../model/planModal");
const userModel = require("../model/userModel");

const addPlan = async (req, res) => {
  const { trainerID, userID, planType, startDate, endDate } = req.body;

  if (!trainerID || !userID || !planType || !startDate) {
    return res.status(400).json({
      status: false,
      message:
        "Missing required fields: trainerID, userID, planType, startDate, endDate",
    });
  }

  try {
    const [userExist, trainerExist] = await Promise.all([
      userModel.findById(userID),
      userModel.findById(trainerID),
    ]);

    if (!userExist || !trainerExist) {
      return res.status(404).json({
        status: false,
        message: "User or trainer not found",
      });
    }

    const existingPlan = await FitnessPlan.findOne({
      userID: userID,
      trainerID: trainerID,
      planType: planType,
      status: { $in: ["active", "upcoming"] },
    });

    if (existingPlan) {
      return res.status(409).json({
        status: false,
        message: `${planType} plan is already active or upcoming for this user`,
      });
    }

    const newPlan = await FitnessPlan.create({
      ...req.body,
      status: startDate <= new Date() ? "active" : "upcoming",
    });

    return res.status(201).json({
      status: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Add plan error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getPlan = async (req, res) => {
  const userID = req.user.userID;

  try {
    const userExist = await userModel.findById(userID).lean();

    if (!userExist) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const plans = await FitnessPlan.findOne({ userID }).lean();

    if (plans.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No plans found",
        data: {},
      });
    }

    return res.status(200).json({
      status: true,
      message: "Plans retrieved successfully",
      data: plans,
    });
  } catch (error) {
    console.error("Get plans error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { addPlan, getPlan };
