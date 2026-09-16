const express = require("express");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Helper to get YYYY-MM
const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// @route   GET /api/budgets/current
// @desc    Get current month budget with calculated spending & smart alerts
router.get("/current", async (req, res) => {
  try {
    const monthKey = req.query.month || getCurrentMonthKey();
    let budget = await Budget.findOne({ user: req.user._id, month: monthKey });

    // If no budget set yet, return default template
    if (!budget) {
      budget = {
        month: monthKey,
        monthlyAllowance: 0,
        totalBudget: 0,
        savingsTarget: 0,
        categoryBudgets: new Map()
      };
    }

    // Calculate actual expenses for this calendar month
    const [year, monthNum] = monthKey.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const categorySpending = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categorySpending[cat] = (categorySpending[cat] || 0) + (Number(e.amount) || 0);
    });

    // Days remaining in the month for daily spending limit
    const now = new Date();
    const totalDaysInMonth = new Date(year, monthNum, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

    const effectiveTotalBudget = budget.totalBudget || budget.monthlyAllowance || 0;
    const remainingBudget = Math.max(0, effectiveTotalBudget - totalSpent);
    const dailySpendingLimit = Math.round(remainingBudget / daysRemaining);

    // Build category progress analysis
    const categoryAnalysis = [];
    const catBudgets = budget.categoryBudgets instanceof Map
      ? Object.fromEntries(budget.categoryBudgets)
      : budget.categoryBudgets || {};

    // Check all budgeted categories and active spending categories
    const allCategories = Array.from(new Set([...Object.keys(catBudgets), ...Object.keys(categorySpending)]));

    const smartAlerts = [];

    allCategories.forEach((cat) => {
      const allocated = catBudgets[cat] || 0;
      const spent = categorySpending[cat] || 0;
      const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
      const remaining = Math.max(0, allocated - spent);

      let status = "safe"; // safe, warning, exceeded
      if (allocated > 0) {
        if (percentage >= 100) {
          status = "exceeded";
          smartAlerts.push({
            type: "danger",
            category: cat,
            message: `⚠️ Budget exceeded for ${cat}! You have spent ₹${spent.toLocaleString("en-IN")} against ₹${allocated.toLocaleString("en-IN")} allocated.`
          });
        } else if (percentage >= 80) {
          status = "warning";
          smartAlerts.push({
            type: "warning",
            category: cat,
            message: `Notice: ${cat} budget is at ${percentage.toFixed(0)}% capacity. ₹${remaining.toLocaleString("en-IN")} remaining.`
          });
        }
      }

      categoryAnalysis.push({
        category: cat,
        allocated,
        spent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        status
      });
    });

    // Overall budget alert
    if (effectiveTotalBudget > 0 && totalSpent >= effectiveTotalBudget) {
      smartAlerts.unshift({
        type: "danger",
        category: "Total",
        message: `🚨 Overall Monthly Budget Exceeded! Total disbursements: ₹${totalSpent.toLocaleString("en-IN")} vs Budget: ₹${effectiveTotalBudget.toLocaleString("en-IN")}.`
      });
    }

    res.json({
      budget,
      totalSpent,
      remainingBudget,
      dailySpendingLimit,
      daysRemaining,
      categoryAnalysis,
      smartAlerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/budgets
// @desc    Set or update monthly budget and category limits
router.post("/", async (req, res) => {
  try {
    const { month, monthlyAllowance, totalBudget, savingsTarget, categoryBudgets } = req.body;
    const monthKey = month || getCurrentMonthKey();

    const updatedBudget = await Budget.findOneAndUpdate(
      { user: req.user._id, month: monthKey },
      {
        user: req.user._id,
        month: monthKey,
        monthlyAllowance: Number(monthlyAllowance) || 0,
        totalBudget: Number(totalBudget) || 0,
        savingsTarget: Number(savingsTarget) || 0,
        categoryBudgets: categoryBudgets || {}
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(updatedBudget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
