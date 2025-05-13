const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    email: {
      type: String,
      required: true,
    },
    otpCode: {
      type: String,
      required: true,
    },
    usedfor: {
      type: String,
      require: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Otp", otpSchema);
