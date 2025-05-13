const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema for diet meal items
const dietItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  quantity: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
});

// Schema for diet meals (breakfast, lunch, dinner)
const dietMealSchema = new Schema({
  subHeading: {
    type: String,
    required: true,
    enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
    trim: true,
  },
  items: {
    type: [dietItemSchema],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "At least one meal item is required",
    },
  },
});

// Schema for workout exercises
const workoutExerciseSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
});

// Schema for daily plans
const dailyPlanSchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  meals: {
    type: [dietMealSchema],
    validate: {
      validator: function (v) {
        return this.planCategory === "diet" ? v.length > 0 : true;
      },
      message: "Diet plans require at least one meal",
    },
  },
  exercises: {
    type: [workoutExerciseSchema],
    validate: {
      validator: function (v) {
        return this.planCategory === "workout" ? v.length > 0 : true;
      },
      message: "Workout plans require at least one exercise",
    },
  },
});

const fitnessPlanSchema = new Schema(
  {
    planType: {
      type: String,
      required: true,
      enum: ["weekly", "monthly"],
    },
    planCategory: {
      type: String,
      required: true,
      enum: ["diet", "workout", "combined"],
    },

    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date().setHours(0, 0, 0, 0);
        },
        message: "Start date must be today or in the future",
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: [
        {
          validator: function (value) {
            return value > this.startDate;
          },
          message: "End date must be after start date",
        },
        {
          validator: function (value) {
            if (this.planType === "monthly") {
              const expectedEnd = new Date(this.startDate);
              expectedEnd.setMonth(expectedEnd.getMonth() + 1);
              return value.getTime() === expectedEnd.getTime();
            }
            return true;
          },
          message: "Monthly plans must have exactly 1 month duration",
        },
      ],
    },
    trainerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    days: {
      type: [dailyPlanSchema],
    },
    status: {
      type: String,
      enum: ["active", "upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

fitnessPlanSchema.virtual("durationDays").get(function () {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Compound index for better query performance
fitnessPlanSchema.index({ userID: 1, status: 1 });
fitnessPlanSchema.index({ trainerID: 1, startDate: 1 });
fitnessPlanSchema.index({ planType: 1, planCategory: 1 });
fitnessPlanSchema.index({ startDate: 1, endDate: 1 });

// Middleware to handle plan setup
fitnessPlanSchema.pre("save", function (next) {
  // Set status based on start date
  if (this.isModified("startDate") || this.isNew) {
    this.status = this.startDate <= new Date() ? "active" : "upcoming";
  }

  // Set end date for monthly plans
  if (this.planType === "monthly" && this.isModified("startDate")) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    this.endDate = endDate;
  }

  next();
});

// Add method to check if plan is active
fitnessPlanSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return (
    this.status === "active" && this.startDate <= now && this.endDate >= now
  );
};

const FitnessPlan = mongoose.model("FitnessPlan", fitnessPlanSchema);

module.exports = FitnessPlan;
