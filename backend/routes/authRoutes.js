const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "spendwise_fallback_secret_key_2025",
    { expiresIn: "30d" }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new individual user account
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide your full name, email address, and password"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email address already exists. Please sign in."
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    // Seamless legacy data migration: if any expenses exist without a user, associate them with this first user
    try {
      await Expense.updateMany(
        { $or: [{ user: { $exists: false } }, { user: null }] },
        { $set: { user: user._id } }
      );
    } catch (migrateErr) {
      console.warn("Notice: Legacy expense migration check completed:", migrateErr.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create account"
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials. No account found with this email."
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials. Incorrect password."
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Authentication failed"
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

module.exports = router;
