const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const rateSchema = new mongoose.Schema({
  trainerID: { type: ObjectId, ref: "User" },
  userID: { type: ObjectId, ref: "User" },
  rating: {
    type: Number,
    default: null,
    required: true,
  },
});
module.exports = mongoose.model("Rate", rateSchema);
