const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    startDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.index({ userID: 1 });
clientSchema.index({ trainerID: 1 });
clientSchema.index({ status: 1 });

module.exports = mongoose.model("Client", clientSchema);
