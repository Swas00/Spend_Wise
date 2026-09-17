const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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

// @route   POST /api/auth/forgot-password
// @desc    Initiate password recovery by sending recovery code & token
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide your registered email address" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "No SpendWise account found with this email address. Please check your spelling or register."
      });
    }

    // Generate 6-digit numeric recovery code (100000 - 999999)
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Generate secure random reset token
    const rawResetToken = crypto.randomBytes(32).toString("hex");

    // Hash the code and token with SHA-256 for secure DB storage
    const hashedCode = crypto.createHash("sha256").update(recoveryCode).digest("hex");
    const hashedToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    // Set 15-minute expiration
    const expireTime = Date.now() + 15 * 60 * 1000;

    user.resetPasswordCode = hashedCode;
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expireTime;
    await user.save();

    res.json({
      success: true,
      message: "Recovery code generated successfully. Valid for 15 minutes.",
      email: user.email,
      recoveryCode,
      resetToken: rawResetToken
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to initiate password reset"
    });
  }
});

// @route   POST /api/auth/verify-recovery-code
// @desc    Verify if 6-digit recovery code is valid
// @access  Public
router.post("/verify-recovery-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Please provide both email and 6-digit recovery code" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedCode = crypto.createHash("sha256").update(code.trim()).digest("hex");

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordCode: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired recovery code. Please check your code or request a new one."
      });
    }

    res.json({
      success: true,
      message: "Recovery code verified successfully.",
      resetToken: user.resetPasswordToken
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to verify recovery code"
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Set new password after verifying recovery code or token
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, resetToken, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long"
      });
    }

    let user = null;

    if (resetToken) {
      const hashedToken = crypto.createHash("sha256").update(resetToken.trim()).digest("hex");
      user = await User.findOne({
        $or: [{ resetPasswordToken: hashedToken }, { resetPasswordToken: resetToken.trim() }],
        resetPasswordExpire: { $gt: Date.now() }
      });
    }

    if (!user && email && code) {
      const normalizedEmail = email.trim().toLowerCase();
      const hashedCode = crypto.createHash("sha256").update(code.trim()).digest("hex");
      user = await User.findOne({
        email: normalizedEmail,
        resetPasswordCode: hashedCode,
        resetPasswordExpire: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset session. Please request a new recovery code."
      });
    }

    // Update password (pre-save hook will automatically hash with bcrypt)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordCode = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful! You can now sign in with your new password."
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to reset password"
    });
  }
});

module.exports = router;
