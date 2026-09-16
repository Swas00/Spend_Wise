const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");

const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");
const splitRoutes = require("./routes/splitRoutes");
const advisorRoutes = require("./routes/advisorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/splits", splitRoutes);
app.use("/api/advisor", advisorRoutes);

// Serve static frontend build if present
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for client-side routing (compatible with Express 5)
  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (req, res) => {
    res.send("SpendWise API Server is running");
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`SpendWise Server running on port ${PORT}`);
});

let rawMongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : "";
// Clean up any accidental wrapping quotes
if (
  (rawMongoUri.startsWith('"') && rawMongoUri.endsWith('"')) ||
  (rawMongoUri.startsWith("'") && rawMongoUri.endsWith("'"))
) {
  rawMongoUri = rawMongoUri.slice(1, -1).trim();
}
// Clean up accidental "MONGO_URI=" prefix if pasted into the value box
if (rawMongoUri.startsWith("MONGO_URI=")) {
  rawMongoUri = rawMongoUri.replace(/^MONGO_URI=\s*/, "").trim();
}

if (!rawMongoUri) {
  console.error("CRITICAL ERROR: MONGO_URI environment variable is missing!");
  console.error("Please add MONGO_URI to your Render dashboard under Environment variables.");
} else {
  mongoose
    .connect(rawMongoUri)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
    });
}