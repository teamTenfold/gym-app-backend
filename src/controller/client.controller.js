const clientModel = require("../model/clientModel");
const userModel = require("../model/userModel");

const sendRequest = async (req, res) => {
  const userId = req.user.userID;
  const { trainerID } = req.body;

  try {
    const user = await userModel.findOne({
      _id: userId,
      role: "user",
    });
    console.log("UserID", userId);
    console.log("User", user);

    if (user.traineeProfile?.isPlanActive) {
      return res.status(409).json({
        status: false,
        message: "You already have an active plan",
      });
    }

    const trainerExist = await userModel.findOne({
      _id: trainerID,
      role: "coach",
    });
    if (!trainerExist) {
      return res.status(400).json({
        status: false,
        message: "Trainer Does not exist",
      });
    }

    const existingRequest = await clientModel.findOne({
      userID: userId,
      trainerID,
      status: { $in: ["pending", "accepted"] },
    });
    if (existingRequest) {
      const statusMessage =
        existingRequest.status === "accepted"
          ? "You are already a client of this trainer"
          : "You already have a pending request with this trainer";

      return res.status(409).json({
        status: false,
        message: statusMessage,
      });
    }

    const addReq = await clientModel.create({
      userID: userId,
      trainerID,
      status: "pending",
    });
    const updatedTrainer = await userModel.findByIdAndUpdate(
      trainerID,
      { $inc: { "trainerProfile.clientRequests": 1 } },
      { new: true }
    );

    if (!addReq && !updatedTrainer) {
      return res.status(400).json({
        status: false,
        message: "Something went wrong Request cannot be send",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Request has been sent to Trianer",
      data: updatedTrainer,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};

const acceptRequest = async (req, res) => {
  const { reqID } = req.body;
  const userId = req.user.userID;

  if (!reqID) {
    return res.status(400).json({
      status: false,
      message: "Request ID is required",
    });
  }

  try {
    const checkPlanActive = await userModel.findOne({ _id: reqID });

    const request = await clientModel.findById(reqID);

    if (!request) {
      return res.status(404).json({
        status: false,
        message: "Request not found",
      });
    }

    if (request.status === "accepted") {
      return res.status(409).json({
        status: false,
        message: "Request already accepted",
      });
    }

    const [updatedRequest, updatedTrainer] = await Promise.all([
      clientModel.findByIdAndUpdate(
        reqID,
        { status: "accepted" },
        { new: true }
      ),
      userModel.findByIdAndUpdate(
        request.trainerID,
        {
          $inc: {
            "trainerProfile.clientRequests": -1,
            "trainerProfile.totalClients": 1,
          },
        },
        { new: true }
      ),
    ]);

    if (!updatedRequest || !updatedTrainer) {
      return res.status(400).json({
        status: false,
        message: "Error processing request",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Request accepted successfully",
      data: {
        request: updatedRequest,
        trainer: updatedTrainer,
      },
    });
  } catch (error) {
    console.error("Accept request error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { reqID } = req.body;
    const findReq = await clientModel.findOne({
      _id: reqID,
      status: "pending",
    });

    if (!findReq) {
      return res.status(400).json({
        status: false,
        message: "Cannot find any request",
      });
    }

    const [deletReq, updatedTrainer] = await Promise.all([
      clientModel.findByIdAndDelete({ _id: reqID }),
      userModel.findByIdAndUpdate(
        findReq.trainerID,
        {
          $inc: {
            "trainerProfile.clientRequests": -1,
          },
        },
        { new: true }
      ),
    ]);

    if (!deletReq || !updatedTrainer) {
      return res.status(400).json({
        status: false,
        message: "There is an error deleting the request",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Request has been successfully deleted",
    });
  } catch (error) {}
};

const getallRequests = async (req, res) => {
  const trainerID = req.user.userID;
  console.log("IDD", trainerID);
  if (!trainerID) {
    return res.status(400).json({
      status: false,
      message: "Trainer ID is required",
    });
  }

  try {
    const clients = await clientModel
      .find({
        trainerID,
        status: "pending",
      })
      .populate({
        path: "userID",
        select: "firstName lastName email",
      });

    if (clients.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No requests found",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: "requests retrieved successfully",
      data: clients,
    });
  } catch (error) {
    console.error("Get requests error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getClients = async (req, res) => {
  const trainerID = req.user.userID;

  if (!trainerID) {
    return res.status(400).json({
      status: false,
      message: "Trainer ID is required",
    });
  }

  try {
    const clients = await clientModel
      .find({
        trainerID,
        status: "accepted",
      })
      .populate({
        path: "userID",
        select: "firstName lastName email",
      });

    if (clients.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No clients found",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: "Clients retrieved successfully",
      data: clients,
    });
  } catch (error) {
    console.error("Get clients error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  deleteRequest,
  getallRequests,
  getClients,
};
