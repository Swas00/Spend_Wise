const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "spendwise_fallback_secret_key_2025"
      );

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message: "User session expired or user no longer exists"
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Session expired or invalid. Please sign in again."
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no authentication token provided"
    });
  }
};

module.exports = { protect };
