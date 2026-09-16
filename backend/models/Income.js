const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, "Income amount is required"],
      min: [0.01, "Amount must be greater than zero"]
    },
    source: {
      type: String,
      required: [true, "Income source is required"],
      default: "Pocket Money / Monthly Allowance"
    },
    paymentMethod: {
      type: String,
      default: "UPI"
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Income", incomeSchema);
