const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String },
    users: [{ type: ObjectId, required: true, ref: "User", required: true }],
    latestMessage: { type: {}, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
