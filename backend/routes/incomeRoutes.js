const express = require("express");
const Income = require("../models/Income");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// @route   GET /api/incomes
// @desc    Get all incomes for current user
router.get("/", async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/incomes
// @desc    Record new income (allowance, stipend, freelance, etc.)
router.post("/", async (req, res) => {
  try {
    const { amount, source, date, description, paymentMethod } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valid income amount is required" });
    }

    const income = new Income({
      user: req.user._id,
      amount: Number(amount),
      source: source || "Monthly Allowance",
      paymentMethod: paymentMethod || "UPI",
      date: date || new Date(),
      description: description ? description.trim() : ""
    });

    const savedIncome = await income.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/incomes/:id
// @desc    Delete income voucher
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Income entry not found or unauthorized" });
    }

    res.json({ message: "Income entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
