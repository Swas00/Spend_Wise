const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    month: {
      type: String, // Format: YYYY-MM
      required: true
    },
    monthlyAllowance: {
      type: Number,
      default: 0
    },
    totalBudget: {
      type: Number,
      default: 0
    },
    savingsTarget: {
      type: Number,
      default: 0
    },
    categoryBudgets: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index: one budget per user per month
budgetSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
