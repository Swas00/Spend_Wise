const express = require("express");
const SavingsGoal = require("../models/SavingsGoal");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// @route   GET /api/goals
// @desc    List all savings goals for user
router.get("/", async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/goals
// @desc    Create new savings goal (e.g. New Laptop, Trip, Emergency Fund)
router.post("/", async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, category, targetDate, color } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ message: "Title and target amount are required" });
    }

    const goal = new SavingsGoal({
      user: req.user._id,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      category: category || "Gadget",
      targetDate: targetDate || null,
      color: color || "amber",
      isCompleted: (Number(currentAmount) || 0) >= Number(targetAmount)
    });

    const saved = await goal.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/goals/:id/deposit
// @desc    Add funds to a savings goal
router.put("/:id/deposit", async (req, res) => {
  try {
    const { amount } = req.body;
    const deposit = Number(amount);

    if (isNaN(deposit) || deposit <= 0) {
      return res.status(400).json({ message: "Please provide a valid deposit amount" });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "Savings goal not found" });
    }

    goal.currentAmount += deposit;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete savings goal
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Savings goal not found or unauthorized" });
    }

    res.json({ message: "Savings goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
