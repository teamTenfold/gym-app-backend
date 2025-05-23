const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["coach", "user"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isToken: {
    type: String,
    default: null,
  },
  fcmToken: {
    type: String,
    default: null,
  },

  traineeProfile: {
    type: new mongoose.Schema(
      {
        profileImage: {
          type: String,
          default: "https://www.pngall.com/wp-content/uploads/5/Profile.png",
        },
        Dob: {
          type: Date,
          required: false,
        },
        gender: {
          type: String,
          required: false,
        },
        weight: {
          value: {
            type: Number,
            required: false,
          },
          unit: {
            type: String,
            enum: ["kg", "lbs"],
            default: "kg",
          },
        },
        height: {
          value: {
            type: Number,
            required: false,
          },
          unit: {
            type: String,
            enum: ["cm", "ft"],
            default: "cm",
          },
        },
        goalweight: {
          value: {
            type: Number,
            required: false,
          },
          unit: {
            type: String,
            enum: ["kg", "lbs"],
            default: "kg",
          },
        },
        isPlanActive: {
          type: Boolean,
          default: false,
          required: false,
        },
      },
      { _id: false }
    ),
    required: false,
  },

  trainerProfile: {
    type: new mongoose.Schema(
      {
        profileImage: {
          type: String,
          default:
            "https://images.unsplash.com/photo-1511367461989-f85a21fda167?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
        },
        Dob: {
          type: Date,
          required: false,
        },
        gender: {
          type: String,
          required: false,
        },
        country: {
          type: String,
          required: false,
        },
        city: {
          type: String,
          required: false,
        },
        certification: {
          type: String,
          required: false,
        },
        specialization: {
          type: [String],
          default: [],
        },
        bio: {
          type: String,
          required: false,
        },

        clients: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client", // Must match Client model name
          },
        ],
        requests: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client", // Must match Client model name
          },
        ],

        clientRequests: {
          type: Number,
          default: 0,
          min: 0,
        },
        totalClients: {
          type: Number,
          default: 0,
          min: 0,
        },
        rating: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
      { _id: false }
    ),
    required: false,
  },
});

userSchema.pre("save", function (next) {
  if (this.role === "user") {
    if (
      !this.traineeProfile ||
      !this.traineeProfile.Dob ||
      !this.traineeProfile.gender ||
      !this.traineeProfile.weight?.value ||
      !this.traineeProfile.height?.value ||
      !this.traineeProfile.goalweight?.value
    ) {
      return next(new Error("Missing required trainee profile fields"));
    }

    this.trainerProfile = undefined;
  } else if (this.role === "coach") {
    if (
      !this.trainerProfile ||
      !this.trainerProfile.Dob ||
      !this.trainerProfile.gender ||
      !this.trainerProfile.country ||
      !this.trainerProfile.city ||
      !this.trainerProfile.certification ||
      !this.trainerProfile.bio
    ) {
      return next(new Error("Missing required trainer profile fields"));
    }

    this.traineeProfile = undefined;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
