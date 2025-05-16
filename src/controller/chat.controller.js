const chatModel = require("../model/chatModel");

const createChat = async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({
      status: false,
      message: "usersID is required",
    });
  }

  const userIds = [req.user.userID, userID];

  try {
    const existChat = await chatModel
      .findOne({
        users: { $all: userIds },
      })
      .lean();

    if (existChat) {
      return res.status(200).json({
        status: true,
        data: existChat,
        message: "Chatroom already exists",
      });
    }

    const newChat = await chatModel.create({
      users: userIds,
    });

    return res.status(201).json({
      status: true,
      data: newChat,
      message: "Chatroom created successfully",
    });
  } catch (error) {
    console.error("Chat creation error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getChat = async (req, res) => {
  const userId = req.user.userID;
  console.log("UUUUUU", userId);
  try {
    const allChats = await chatModel
      .find({ users: userId })
      .populate({
        path: "users",
        select:
          "firstName lastName email traineeProfile.profileImage trainerProfile.profileImage ",
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      status: true,
      message: "all chats",
      chat: allChats,
    });
  } catch (error) {
    console.error("Chat creation error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { createChat, getChat };
