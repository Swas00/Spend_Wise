const express = require("express");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Budget = require("../models/Budget");
const SavingsGoal = require("../models/SavingsGoal");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Helper to compute month date range and metrics
async function getUserFinancialContext(userId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysLeft = Math.max(1, totalDaysInMonth - currentDay + 1);

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Fetch month data
  const [expenses, incomes, budgetDoc, goals] = await Promise.all([
    Expense.find({ user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    Income.find({ user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    Budget.findOne({
      user: userId,
      month: `${year}-${String(month + 1).padStart(2, "0")}`
    }),
    SavingsGoal.find({ user: userId })
  ]);

  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalIncome = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const currentBalance = totalIncome - totalSpent;

  // Category breakdown
  const catMap = {};
  let weekendSpent = 0;
  let weekdaySpent = 0;
  let weekendDays = 0;
  let weekdayDays = 0;

  // Track dates with spending for No-Spend days
  const spendingDaysSet = new Set();

  expenses.forEach((e) => {
    const cat = e.category || "Other";
    const amt = Number(e.amount) || 0;
    catMap[cat] = (catMap[cat] || 0) + amt;

    const d = new Date(e.date);
    spendingDaysSet.add(d.toDateString());

    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendSpent += amt;
    } else {
      weekdaySpent += amt;
    }
  });

  // Calculate weekend vs weekday ratio
  for (let d = 1; d <= currentDay; d++) {
    const testDate = new Date(year, month, d);
    const dow = testDate.getDay();
    if (dow === 0 || dow === 6) weekendDays++;
    else weekdayDays++;
  }

  const avgWeekend = weekendDays > 0 ? weekendSpent / weekendDays : 0;
  const avgWeekday = weekdayDays > 0 ? weekdaySpent / weekdayDays : 0;
  const weekendHigherPercent = avgWeekday > 0
    ? Math.max(0, Math.round(((avgWeekend - avgWeekday) / avgWeekday) * 100))
    : 0;

  // No-Spend days in elapsed days
  const noSpendDays = Math.max(0, currentDay - spendingDaysSet.size);

  // Highest category
  let highestCat = "None";
  let highestCatAmt = 0;
  Object.entries(catMap).forEach(([cat, amt]) => {
    if (amt > highestCatAmt) {
      highestCat = cat;
      highestCatAmt = amt;
    }
  });

  const dailyAverage = currentDay > 0 ? Math.round(totalSpent / currentDay) : 0;
  const projectedMonthly = Math.round(dailyAverage * totalDaysInMonth);

  const effectiveBudget = budgetDoc?.totalBudget || budgetDoc?.monthlyAllowance || 0;
  const remainingBudget = Math.max(0, effectiveBudget - totalSpent);
  const dailyLimit = Math.round(remainingBudget / daysLeft);

  return {
    year,
    monthName: now.toLocaleString("en-IN", { month: "long" }),
    currentDay,
    totalDaysInMonth,
    daysLeft,
    totalSpent,
    totalIncome,
    currentBalance,
    effectiveBudget,
    remainingBudget,
    dailyLimit,
    dailyAverage,
    projectedMonthly,
    highestCat,
    highestCatAmt,
    highestCatPercent: totalSpent > 0 ? Math.round((highestCatAmt / totalSpent) * 100) : 0,
    weekendHigherPercent,
    weekendVelocity: avgWeekday > 0 ? Math.round((avgWeekend / avgWeekday) * 10) / 10 : 1.0,
    noSpendDays,
    catMap,
    goalsCount: goals.length,
    expensesCount: expenses.length
  };
}

// @route   GET /api/advisor/insights
// @desc    Get aggregated student insights, gamification metrics & projections
router.get("/insights", async (req, res) => {
  try {
    const ctx = await getUserFinancialContext(req.user._id);
    res.json(ctx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/advisor/query
// @desc    Ask AI Student Financial Assistant a question based on real Indian college student context
router.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Please provide a question" });
    }

    const ctx = await getUserFinancialContext(req.user._id);
    const q = query.toLowerCase();

    let answer = "";

    // 1. Affordability check: e.g. "Can I afford a ₹3,000 trip with friends?"
    const priceMatch = query.match(/(\d+[\d,]*)/);
    if ((q.includes("afford") || q.includes("trip") || q.includes("buy")) && priceMatch) {
      const price = Number(priceMatch[1].replace(/,/g, ""));
      const postPurchaseBalance = ctx.currentBalance - price;
      const postPurchaseDailyLimit = Math.round(Math.max(0, postPurchaseBalance) / ctx.daysLeft);

      if (ctx.currentBalance <= 0) {
        answer = `❌ **Not Recommended:** Your current recorded balance is ₹${ctx.currentBalance.toLocaleString("en-IN")}. Spending ₹${price.toLocaleString("en-IN")} will push your balance into a deficit. It is better to postpone this until next month's allowance or stipend arrives!`;
      } else if (postPurchaseBalance < 0) {
        answer = `⚠️ **Budget Deficit Warning:** You currently have a remaining balance of ₹${ctx.currentBalance.toLocaleString("en-IN")}. Spending ₹${price.toLocaleString("en-IN")} will result in a shortage of ₹${Math.abs(postPurchaseBalance).toLocaleString("en-IN")}, putting your essential funds at risk!`;
      } else if (postPurchaseBalance < 1000 && ctx.daysLeft > 5) {
        answer = `⚠️ **Very Tight Budget:** While technically possible (current balance: ₹${ctx.currentBalance.toLocaleString("en-IN")}), after spending ₹${price.toLocaleString("en-IN")}, you will only have ₹${postPurchaseBalance.toLocaleString("en-IN")} left for the next ${ctx.daysLeft} days (approx **₹${postPurchaseDailyLimit}/day** for meals, commute, and emergencies). Only proceed if this is an essential priority!`;
      } else {
        answer = `✅ **Affordable:** Your current balance is ₹${ctx.currentBalance.toLocaleString("en-IN")}. After spending ₹${price.toLocaleString("en-IN")}, you will still have **₹${postPurchaseBalance.toLocaleString("en-IN")}** remaining. Your safe daily spending limit for the remaining ${ctx.daysLeft} days will be **₹${postPurchaseDailyLimit}/day**. Proceed responsibly!`;
      }
    }
    // 2. Highest spending query
    else if (q.includes("most") || q.includes("highest") || q.includes("largest") || q.includes("where") || q.includes("expense") || q.includes("spent")) {
      if (ctx.highestCatAmt === 0) {
        answer = `You have not recorded any expenses in ${ctx.monthName} yet! Start logging your entries to view your highest spending category.`;
      } else {
        answer = `📊 **Highest Spending Category:** **${ctx.highestCat}** is your largest spending area this month at **₹${ctx.highestCatAmt.toLocaleString("en-IN")}**, representing **${ctx.highestCatPercent}%** of your total monthly expenses (₹${ctx.totalSpent.toLocaleString("en-IN")}).`;
      }
    }
    // 3. How to save query
    else if (q.includes("save") || q.includes("saving") || q.includes("cut") || q.includes("reduce")) {
      const discSpent = (ctx.catMap["Food"] || 0) + (ctx.catMap["Entertainment"] || 0) + (ctx.catMap["Shopping"] || 0);

      answer = `💡 **Smart Money-Saving Strategies for College Students:**
1. **Reduce Food Delivery & Outside Dining:** You have spent ₹${discSpent.toLocaleString("en-IN")} on dining and leisure. Opting for hostel mess or campus canteen meals 3 days a week can easily save you **₹${Math.round(discSpent * 0.25).toLocaleString("en-IN")}**.
2. **Increase 'No-Spend Days':** You have recorded **${ctx.noSpendDays} zero-spend days** this month. Aim for at least 2 zero-spend days every week.
3. **Use Student Concessions & Discounts:** Use student Metro and bus passes, share streaming subscriptions with flatmates, and activate student discounts (Spotify Student, Prime Student, etc.).
4. **Adhere to Your Daily Safe Limit:** Keep your daily discretionary spending under **₹${ctx.dailyLimit > 0 ? ctx.dailyLimit : ctx.dailyAverage}/day**.`;
    }
    // 4. Weekend vs weekday query
    else if (q.includes("weekend") || q.includes("spike") || q.includes("velocity") || q.includes("saturday") || q.includes("sunday")) {
      if (ctx.weekendHigherPercent > 0) {
        answer = `📈 **Weekend Spending Surge:** You spend **${ctx.weekendHigherPercent}% more on weekends** compared to weekdays! Weekend outings, cafes, and entertainment drive this increase. Setting a weekend spending ceiling can help preserve your allowance.`;
      } else {
        answer = `⚖️ **Balanced Spending:** Great discipline! Your spending is evenly distributed throughout the week. Your average daily burn rate is **₹${ctx.dailyAverage}/day**.`;
      }
    }
    // 5. Prediction / End of Month query
    else if (q.includes("prediction") || q.includes("project") || q.includes("end") || q.includes("month") || q.includes("forecast")) {
      answer = `🔮 **Month-End Expenditure Forecast:**
- Total spent so far: **₹${ctx.totalSpent.toLocaleString("en-IN")}** (Day ${ctx.currentDay} of ${ctx.totalDaysInMonth})
- Average daily burn rate: **₹${ctx.dailyAverage}/day**
- Projected Month-End Total: **₹${ctx.projectedMonthly.toLocaleString("en-IN")}**
${
  ctx.effectiveBudget > 0
    ? ctx.projectedMonthly > ctx.effectiveBudget
      ? `⚠️ **Warning:** At your current pace, you are projected to **exceed your monthly budget of ₹${ctx.effectiveBudget.toLocaleString("en-IN")} by approximately ₹${(ctx.projectedMonthly - ctx.effectiveBudget).toLocaleString("en-IN")}**!`
      : `✅ **On Track:** You are on pace to finish **under your ₹${ctx.effectiveBudget.toLocaleString("en-IN")} budget**, leaving approximately ₹${(ctx.effectiveBudget - ctx.projectedMonthly).toLocaleString("en-IN")} in savings.`
    : `Set a monthly budget in the Budget Planner to receive custom pace alerts!`
}`;
    }
    // 6. Default general advisor summary
    else {
      answer = `🤖 **SpendWise Student Snapshot (${ctx.monthName}):**
- **Available Balance:** ₹${ctx.currentBalance.toLocaleString("en-IN")}
- **Total Monthly Expenses:** ₹${ctx.totalSpent.toLocaleString("en-IN")} across ${ctx.expensesCount} entries
- **Daily Safe Limit:** ₹${ctx.dailyLimit}/day (${ctx.daysLeft} days remaining)
- **Top Spending Category:** ${ctx.highestCat} (₹${ctx.highestCatAmt.toLocaleString("en-IN")})
- **No-Spend Days:** ${ctx.noSpendDays} days

*You can ask: "Can I afford a ₹2,500 trip?", "Where did I spend the most?", or "How can I save ₹1,500?"*`;
    }

    res.json({
      reply: answer,
      answer,
      contextSnapshot: ctx,
      context: ctx
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
