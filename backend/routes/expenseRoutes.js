const express = require("express");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for all expense routes
router.use(protect);

router.post("/", async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      user: req.user._id
    });
    const savedExpense = await expense.save();

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.category && req.query.category !== "all") {
      filter.category = req.query.category;
    }

    if (req.query.paymentMethod && req.query.paymentMethod !== "all") {
      filter.paymentMethod = req.query.paymentMethod;
    }

    if (req.query.isRecurring !== undefined) {
      filter.isRecurring = req.query.isRecurring === "true";
    }

    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        message: "Expense entry not found or unauthorized"
      });
    }

    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense entry not found or unauthorized"
      });
    }

    res.json({
      message: "Expense deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;