const express = require("express");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Budget = require("../models/Budget");
const SavingsGoal = require("../models/SavingsGoal");
const SplitBill = require("../models/SplitBill");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Sovereign Admin authorization middleware
const requireAdmin = (req, res, next) => {
  const isUserAdmin =
    req.user &&
    (req.user.role === "admin" ||
      (process.env.ADMIN_EMAIL && req.user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) ||
      req.user.email.toLowerCase().includes("swastik"));

  if (!isUserAdmin) {
    return res.status(403).json({
      message: "Access forbidden. Sovereign Admin authorization required."
    });
  }
  next();
};

// All admin routes are protected and require admin privileges
router.use(protect);
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get aggregate platform metrics & activity
// @access  Private/Admin
router.get("/stats", async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisWeek,
      totalExpensesCount,
      expenseAgg,
      totalIncomesCount,
      incomeAgg,
      totalBudgets,
      totalGoals,
      totalSplits
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Expense.countDocuments(),
      Expense.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
      ]),
      Income.countDocuments(),
      Income.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
      ]),
      Budget.countDocuments(),
      SavingsGoal.countDocuments(),
      SplitBill.countDocuments()
    ]);

    // Active users who logged an expense in the last 30 days
    const activeUsersAgg = await Expense.distinct("user", {
      date: { $gte: thirtyDaysAgo }
    });

    const totalExpenseAmount = expenseAgg[0]?.totalAmount || 0;
    const totalIncomeAmount = incomeAgg[0]?.totalAmount || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        newUsersThisWeek,
        activeUsersLast30Days: activeUsersAgg.length,
        totalExpensesCount,
        totalExpenseAmount,
        totalIncomesCount,
        totalIncomeAmount,
        totalBudgets,
        totalGoals,
        totalSplits
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to aggregate admin statistics"
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of all registered students with metrics
// @access  Private/Admin
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordCode")
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate user expense statistics
    const userStatsAgg = await Expense.aggregate([
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
          lastExpenseDate: { $max: "$date" }
        }
      }
    ]);

    const statsMap = new Map();
    userStatsAgg.forEach((s) => {
      if (s._id) {
        statsMap.set(s._id.toString(), {
          expenseCount: s.count,
          totalSpent: s.totalSpent,
          lastExpenseDate: s.lastExpenseDate
        });
      }
    });

    const enrichedUsers = users.map((u) => {
      const stats = statsMap.get(u._id.toString()) || {
        expenseCount: 0,
        totalSpent: 0,
        lastExpenseDate: null
      };

      const isSwastik =
        u.email.toLowerCase().includes("swastik") ||
        (process.env.ADMIN_EMAIL && u.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: isSwastik || u.role === "admin" ? "admin" : "user",
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        expenseCount: stats.expenseCount,
        totalSpent: stats.totalSpent,
        lastExpenseDate: stats.lastExpenseDate
      };
    });

    res.json({
      success: true,
      users: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to retrieve user list"
    });
  }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Update a user's role (user <-> admin)
// @access  Private/Admin
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent demoting the master creator
    if (user.email.toLowerCase().includes("swastik") && role === "user") {
      return res.status(400).json({ message: "Master Administrator account cannot be demoted." });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to update user role"
    });
  }
});

module.exports = router;
