const { default: mongoose } = require("mongoose");
const User = require("../model/userModel");

const getAllTrainer = async (req, res) => {
  const { userID } = req.user;
  const limit = parseInt(req.query.limit);
  const page = parseInt(req.query.page);
  const skip = (page - 1) * limit;
  console.log("Limitt", limit);
  try {
    const totalTrainers = await User.countDocuments({ role: "coach" });
    const totalPages = Math.ceil(totalTrainers / limit);

    const allTrainers = await User.aggregate([
      {
        $match: {
          role: "coach",
        },
      },

      {
        $lookup: {
          from: "rates",
          let: { coachId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$trainerID", "$$coachId"],
                },
              },
            },
          ],
          as: "isRating",
        },
      },

      {
        $addFields: {
          "trainerProfile.rating": {
            $ifNull: [{ $avg: "$isRating.rating" }, 0],
          },
        },
      },
      {
        $project: {
          email: 1,
          role: 1,
          trainerProfile: 1,
          myRequests: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    res.status(200).json({
      data: allTrainers,
      message: "all Trainers are available",
      page: page,
      totalPages: totalPages,
    });

    // {
    //   $lookup: {
    //     from: "clients",
    //     let: { coachId: "$_id" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $and: [
    //               { $eq: ["$trainerID", "$$coachId"] },
    //               { $eq: ["$status", "accepted"] },
    //             ],
    //           },
    //         },
    //       },

    //       {
    //         $lookup: {
    //           from: "users",
    //           localField: "userID",
    //           foreignField: "_id",
    //           as: "userProfile",
    //         },
    //       },

    //       { $unwind: "$userProfile" },

    //       {
    //         $project: {
    //           "userProfile.traineeProfile.profileImage": 1,
    //         },
    //       },
    //     ],
    //     as: "myClients",
    //   },
    // },
    // {
    //   $addFields: {
    //     "trainerProfile.myClients": {
    //       $map: {
    //         input: "$myClients",
    //         as: "client",
    //         in: "$$client.userProfile.traineeProfile.profileImage",
    //       },
    //     },
    //   },
    // },
    // {
    //   $lookup: {
    //     from: "clients",
    //     let: { coachId: "$_id" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $and: [
    //               { $eq: ["$trainerID", "$$coachId"] },
    //               { $eq: ["$status", "pending"] },
    //             ],
    //           },
    //         },
    //       },

    //       {
    //         $lookup: {
    //           from: "users",
    //           localField: "userID",
    //           foreignField: "_id",
    //           as: "userProfile",
    //         },
    //       },

    //       { $unwind: "$userProfile" },

    //       {
    //         $project: {
    //           "userProfile.traineeProfile.profileImage": 1,
    //         },
    //       },
    //     ],
    //     as: "myRequests",
    //   },
    // },
  } catch (error) {
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
    const findUser = await User.findById({ _id: userID });

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

const editProfile = async (req, res) => {
  try {
    const { userID, role } = req.user;
    const { firstName, lastName, profileImage } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({
        status: false,
        message: "First name and last name are required",
      });
    }
    const updateFields = {
      ...(firstName && { firstName: firstName }),
      ...(lastName && { lastName: lastName }),
      ...(profileImage && {
        [role === "user"
          ? "traineeProfile.profileImage"
          : "trainerProfile.profileImage"]: profileImage,
      }),
    };

    const updatedUser = await User.findByIdAndUpdate(userID, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      status: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};
module.exports = {
  getAllTrainer,
  getCurrentUser,
  editProfile,
};
