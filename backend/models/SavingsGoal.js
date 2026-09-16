const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be at least ₹1"]
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"]
    },
    category: {
      type: String,
      enum: ["Gadget", "Travel", "Education", "Emergency", "Lifestyle", "Other"],
      default: "Gadget"
    },
    targetDate: {
      type: Date
    },
    color: {
      type: String,
      default: "amber"
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
