import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Coins,
  Calendar,
  TrendingUp,
  Receipt,
  PlusCircle,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Landmark,
  AlertTriangle,
  Zap,
  Award,
  Sparkles,
  Users,
  Wallet,
  FileSpreadsheet,
  CheckCircle2,
  Sliders
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import ExpenseCard from "../components/ExpenseCard";
import {
  getExpenses,
  getIncomes,
  getCurrentBudget,
  getStudentInsights
} from "../services/api";
import { STUDENT_CATEGORIES } from "../utils/studentCategories";

// Custom Classic Tooltip for Charts
function ClassicTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-100 border border-amber-500/40 p-3 rounded-lg shadow-xl text-xs space-y-1 animate-scale-in">
        <p className="font-semibold text-amber-300 uppercase tracking-wider">
          {label || payload[0].name}
        </p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-xs font-serif font-bold text-white flex justify-between gap-4">
            <span style={{ color: entry.fill || "#f59e0b" }}>{entry.name}:</span>
            <span>₹{Number(entry.value).toLocaleString("en-IN")}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budget, setBudget] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAllDashboardData() {
      try {
        setLoading(true);
        const [expData, incData, budData, insData] = await Promise.allSettled([
          getExpenses(),
          getIncomes(),
          getCurrentBudget(),
          getStudentInsights()
        ]);

        if (isMounted) {
          if (expData.status === "fulfilled") setExpenses(Array.isArray(expData.value) ? expData.value : []);
          if (incData.status === "fulfilled") setIncomes(Array.isArray(incData.value) ? incData.value : []);
          if (budData.status === "fulfilled") setBudget(budData.value);
          if (insData.status === "fulfilled") setInsights(insData.value);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load ledger records");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live current month metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalLifetimeExpense = 0;
    let monthlyExpense = 0;
    let lifetimeIncome = 0;
    let monthlyIncome = 0;

    expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      totalLifetimeExpense += amt;
      if (item.date) {
        const d = new Date(item.date);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          monthlyExpense += amt;
        }
      }
    });

    incomes.forEach((item) => {
      const amt = Number(item.amount) || 0;
      lifetimeIncome += amt;
      if (item.date) {
        const d = new Date(item.date);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          monthlyIncome += amt;
        }
      }
    });

    const netAvailableBalance = lifetimeIncome - totalLifetimeExpense;
    const monthlyNetSavings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((monthlyNetSavings / monthlyIncome) * 100)) : 0;

    return {
      totalLifetimeExpense,
      monthlyExpense,
      lifetimeIncome,
      monthlyIncome,
      netAvailableBalance,
      savingsRate
    };
  }, [expenses, incomes]);

  // Donut chart category data
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      const cat = item.category || "Other";
      const amt = Number(item.amount) || 0;
      map[cat] = (map[cat] || 0) + amt;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: STUDENT_CATEGORIES[name]?.colorHex || STUDENT_CATEGORIES.Other.colorHex
    }));
  }, [expenses]);

  // Chronological Monthly Trend: Inflow vs Outflow
  const chronologicalTrendData = useMemo(() => {
    const monthlyMap = {};
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    expenses.forEach((item) => {
      if (!item.date) return;
      const d = new Date(item.date);
      const key = `${months[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, outflow: 0, inflow: 0 };
      monthlyMap[key].outflow += Number(item.amount) || 0;
    });

    incomes.forEach((item) => {
      if (!item.date) return;
      const d = new Date(item.date);
      const key = `${months[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, outflow: 0, inflow: 0 };
      monthlyMap[key].inflow += Number(item.amount) || 0;
    });

    return Object.values(monthlyMap).slice(-6);
  }, [expenses, incomes]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses]);

  const todayString = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            ))}
          </div>
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 animate-slide-down">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Landmark className="w-4 h-4" />
            <span>Indian Campus Treasury &bull; {todayString}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-serif">
            Student Financial Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time allowance, daily safe spending limit, budget caps, and campus expenditure analytics.
          </p>
        </div>

        <Link
          to="/add-expense"
          className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Expense</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-sm animate-slide-down">
          {error}
        </div>
      )}

      {/* Smart Alerts Banner */}
      {budget?.alerts && budget.alerts.length > 0 && (
        <div className="space-y-2 animate-slide-down">
          {budget.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-medium shadow-xs ${
                alert.level === "danger"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Student Financial Metric Command Strip (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Available Balance</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p
            className={`text-xl sm:text-2xl font-extrabold tabular-nums font-serif tracking-tight ${
              metrics.netAvailableBalance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            ₹{metrics.netAvailableBalance.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Available cash & bank</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pocket Money</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold tabular-nums font-serif tracking-tight text-slate-900 dark:text-white">
            ₹{metrics.monthlyIncome.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Monthly inflows</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Expenses</span>
            <Receipt className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold tabular-nums font-serif tracking-tight text-rose-600 dark:text-rose-400">
            ₹{metrics.monthlyExpense.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Monthly expenditure</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Remaining Budget</span>
            <Coins className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold tabular-nums font-serif tracking-tight text-slate-900 dark:text-white">
            ₹{Number(budget?.remainingBudget || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {budget?.totalBudget ? `${Math.round(budget.percentUsed || 0)}% utilized` : "No cap set"}
          </p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Daily Safe Limit</span>
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold tabular-nums font-serif tracking-tight text-amber-600 dark:text-amber-400">
            ₹{Number(budget?.dailySpendingLimit || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Safe pace till month-end</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Savings Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold tabular-nums font-serif tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.savingsRate}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Allowance saved</p>
        </div>
      </div>

      {/* Quick Access Feature Navigation Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          to="/budget"
          className="btn-press flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
        >
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Budget & Goals</div>
            <div className="text-[10px] text-slate-400 font-normal">Cap category limits</div>
          </div>
        </Link>

        <Link
          to="/splits"
          className="btn-press flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
        >
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Split Bills</div>
            <div className="text-[10px] text-slate-400 font-normal">Flatmates & friends</div>
          </div>
        </Link>

        <Link
          to="/calendar"
          className="btn-press flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Expense Calendar</div>
            <div className="text-[10px] text-slate-400 font-normal">Day-by-day calendar</div>
          </div>
        </Link>

        <Link
          to="/advisor"
          className="btn-press flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
        >
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Campus AI Advisor</div>
            <div className="text-[10px] text-slate-400 font-normal">Affordability advisor</div>
          </div>
        </Link>

        <Link
          to="/reports"
          className="btn-press flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
        >
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Financial Reports</div>
            <div className="text-[10px] text-slate-400 font-normal">CSV & Guardian audit</div>
          </div>
        </Link>
      </div>

      {/* Student Campus Insights & Gamification Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Behavioral Insights Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                Student Campus Insights
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Real-time Analytics
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Weekend Spending Surge
              </span>
              <p className="text-lg font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">
                {insights?.weekendVelocity ? `${insights.weekendVelocity}x` : "1.0x"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">vs weekdays</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Daily Average Spend
              </span>
              <p className="text-lg font-bold font-serif text-slate-900 dark:text-white mt-1">
                ₹{Number(insights?.dailyAverage || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">daily burn</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Month-End Forecast
              </span>
              <p className="text-lg font-bold font-serif text-blue-600 dark:text-blue-400 mt-1">
                ₹{Number(insights?.projectedMonthlySpend || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">forecasted</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-amber-800 dark:text-amber-400">💡 Student Tip: </span>
            {insights?.weekendVelocity > 1.5
              ? "Weekend outings, food delivery, and social expenses cause a spending surge! Split bills with flatmates to preserve your allowance."
              : "Your spending pace throughout the week is steady. Maintain this discipline to achieve your savings goal!"}
          </div>
        </div>

        {/* Gamification & Badges Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                Discipline Badges & Streak
              </h2>
            </div>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {insights?.noSpendDays || 0} Zero-Spend Days
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                (insights?.noSpendDays || 0) >= 3
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white"
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/40 opacity-60"
              }`}
            >
              <div className="text-2xl mb-1">🏅</div>
              <div className="font-bold text-xs">Frugal Scholar</div>
              <div className="text-[10px] text-slate-400 mt-0.5">3+ No-spend days</div>
            </div>

            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                budget?.totalBudget && metrics.monthlyExpense <= budget.totalBudget
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white"
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/40 opacity-60"
              }`}
            >
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-bold text-xs">Budget Master</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Under budget cap</div>
            </div>

            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                metrics.savingsRate >= 20
                  ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white"
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/40 opacity-60"
              }`}
            >
              <div className="text-2xl mb-1">💎</div>
              <div className="font-bold text-xs">Savvy Saver</div>
              <div className="text-[10px] text-slate-400 mt-0.5">&gt;20% savings rate</div>
            </div>

            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                expenses.length >= 5
                  ? "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white"
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/40 opacity-60"
              }`}
            >
              <div className="text-2xl mb-1">🛡️</div>
              <div className="font-bold text-xs">Faithful Auditor</div>
              <div className="text-[10px] text-slate-400 mt-0.5">5+ vouchers logged</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            Earn student achievement badges by logging transactions, maintaining budget caps, and completing zero-spend days!
          </p>
        </div>
      </div>

      {expenses.length === 0 && incomes.length === 0 ? (
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm backdrop-blur-xs">
          <div className="inline-flex p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-400 rounded-2xl mb-4">
            <Receipt className="w-10 h-10 animate-float" />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-2">
            The Student Ledger is Currently Fresh
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            Record your monthly allowance or first expense voucher to unlock categorical breakdowns, daily spend pacing, and campus AI advice.
          </p>
          <Link
            to="/add-expense"
            className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-amber-300 dark:text-slate-950 rounded-xl font-semibold shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-amber-400 dark:text-slate-950" />
            <span>Record Your First Transaction</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Charts Section: Inflow vs Outflow & Categorical Share */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown (Donut Chart) */}
            <div className="bg-white/95 dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                    Campus Category Breakdown
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Portfolio Share
                </span>
              </div>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={48}
                      paddingAngle={4}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {categoryData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ClassicTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inflows vs Outflows (Dual Bar Chart) */}
            <div className="bg-white/95 dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                    Cashflow: Income vs Expenses
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Trajectory
                </span>
              </div>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chronologicalTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-700/60"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={12}
                      fontFamily="inherit"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(val) => `₹${val}`}
                      fontFamily="inherit"
                    />
                    <Tooltip content={<ClassicTooltip />} />
                    <Legend />
                    <Bar
                      name="Inflows (Pocket Money / Allowance)"
                      dataKey="inflow"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Outflows (College & Living Expenses)"
                      dataKey="outflow"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Ledger Entries */}
          <div className="bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 backdrop-blur-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Recent Verified Vouchers (Ledger Records)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest entries recorded with UPI / Cash settlement & campus categories
                </p>
              </div>

              <Link
                to="/expenses"
                className="btn-press inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-3 pt-1">
              {recentExpenses.map((exp) => (
                <ExpenseCard key={exp._id} expense={exp} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;