const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  share: {
    type: Number,
    required: true,
    min: 0
  },
  settled: {
    type: Boolean,
    default: false
  },
  settledAt: {
    type: Date
  }
});

const splitBillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Title is required for bill split"],
      trim: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0.01
    },
    paidByMe: {
      type: Boolean,
      default: true
    },
    myShare: {
      type: Number,
      default: 0
    },
    participants: [participantSchema],
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SplitBill", splitBillSchema);
