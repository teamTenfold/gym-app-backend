const chatModel = require("../model/chatModel");
const messageModal = require("../model/messageModal");

const createMessage = async (req, res) => {
  const { chatID, text } = req.body;
  const userId = req.user.userID;

  try {
    const send = await messageModal.create({
      user: userId,
      text,
      chatID,
    });
    if (!send) {
      return res.status(403).json({
        status: false,
        message: "There is an error sending the message",
      });
    }
    const chatUpdate = await chatModel
      .findByIdAndUpdate(chatID, { latestMessage: text }, { new: true })
      .populate({
        path: "users",
        select: "firstName",
        match: { _id: { $ne: userId } },
      });
    return res.status(200).json({
      message: "Message Sent Successfully",
      status: true,
      roomData: chatUpdate,
      messageData: send,
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

const getMessage = async (req, res) => {
  const chatID = req.query.chatID;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const message = await messageModal
      .find({
        chatID: chatID,
      })
      .lean()
      .populate({
        path: "user",
        select: "firstName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: message,
      status: true,
      message: "All messages are recieved ",
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

module.exports = { createMessage, getMessage };
