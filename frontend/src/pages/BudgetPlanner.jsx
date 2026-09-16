import { useState, useEffect } from "react";
import {
  Target,
  PiggyBank,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Laptop,
  Plane,
  Coins,
  ArrowUpRight
} from "lucide-react";
import {
  getCurrentBudget,
  saveBudget,
  getSavingsGoals,
  createSavingsGoal,
  depositToSavingsGoal,
  deleteSavingsGoal
} from "../services/api";
import { STUDENT_CATEGORIES, STUDENT_CATEGORY_LIST } from "../utils/studentCategories";

function BudgetPlanner() {
  const [budgetData, setBudgetData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Budget Modal state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    monthlyAllowance: "",
    totalBudget: "",
    savingsTarget: "",
    categoryBudgets: {}
  });

  // New Goal Modal state
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    category: "Gadget",
    targetDate: ""
  });

  // Deposit Modal state
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadBudgetData() {
      try {
        const [bData, gData] = await Promise.all([
          getCurrentBudget(),
          getSavingsGoals()
        ]);
        if (!ignore) {
          setBudgetData(bData);
          setGoals(gData || []);

          const catBudgets = bData?.budget?.categoryBudgets instanceof Map
            ? Object.fromEntries(bData.budget.categoryBudgets)
            : bData?.budget?.categoryBudgets || {};

          setBudgetForm({
            monthlyAllowance: bData?.budget?.monthlyAllowance || "",
            totalBudget: bData?.budget?.totalBudget || "",
            savingsTarget: bData?.budget?.savingsTarget || "",
            categoryBudgets: { ...catBudgets }
          });
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load budget and savings goals");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBudgetData();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await saveBudget({
        monthlyAllowance: Number(budgetForm.monthlyAllowance) || 0,
        totalBudget: Number(budgetForm.totalBudget) || 0,
        savingsTarget: Number(budgetForm.savingsTarget) || 0,
        categoryBudgets: budgetForm.categoryBudgets
      });
      setIsEditingBudget(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createSavingsGoal({
        title: goalForm.title,
        targetAmount: Number(goalForm.targetAmount),
        currentAmount: Number(goalForm.currentAmount) || 0,
        category: goalForm.category,
        targetDate: goalForm.targetDate || null
      });
      setIsAddingGoal(false);
      setGoalForm({
        title: "",
        targetAmount: "",
        currentAmount: "",
        category: "Gadget",
        targetDate: ""
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Failed to create savings goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount) return;
    try {
      setSaving(true);
      await depositToSavingsGoal(depositGoal._id, Number(depositAmount));
      setDepositGoal(null);
      setDepositAmount("");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Failed to deposit funds");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Are you sure you want to remove this savings goal?")) return;
    try {
      await deleteSavingsGoal(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Failed to delete savings goal");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 animate-pulse"></div>
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const allowance = budgetData?.budget?.monthlyAllowance || 0;
  const totalBudget = budgetData?.budget?.totalBudget || allowance;
  const spent = budgetData?.totalSpent || 0;
  const remaining = budgetData?.remainingBudget || 0;
  const dailyLimit = budgetData?.dailySpendingLimit || 0;
  const daysLeft = budgetData?.daysRemaining || 1;
  const overallPercent = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 animate-slide-down">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <Target className="w-4 h-4" />
            <span>Indian Campus Budget &bull; Savings Target</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Student Budget & Savings Goals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Set your monthly pocket money limit, monitor mess/canteen caps, and achieve savings targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingBudget(true)}
            className="btn-press px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-300 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Configure Monthly Budget
          </button>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="btn-press flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-sm animate-slide-down">
          {error}
        </div>
      )}

      {/* Smart Alerts Banner */}
      {budgetData?.smartAlerts && budgetData.smartAlerts.length > 0 && (
        <div className="space-y-2 animate-slide-down">
          {budgetData.smartAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 border shadow-xs ${
                alert.type === "danger"
                  ? "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                  : "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-slide-up stagger-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pocket Money Budget Cap</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
            ₹{totalBudget.toLocaleString("en-IN")}
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallPercent >= 100 ? "bg-rose-500" : overallPercent >= 80 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            ₹{spent.toLocaleString("en-IN")} spent ({overallPercent}% capacity)
          </p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-slide-up stagger-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Remaining Budget Buffer</span>
            <PiggyBank className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            ₹{remaining.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Safe spending buffer for the remainder of this cycle.
          </p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-slide-up stagger-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Daily Safe Limit</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-blue-600 dark:text-blue-400">
            ₹{dailyLimit.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-400"> / day</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Calculated across the {daysLeft} remaining days in this month.
          </p>
        </div>
      </div>

      {/* Category Budget Allocation Progress Bars */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 animate-slide-up stagger-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Category Allocation Caps
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live consumption vs target monthly allocations
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/20">
            Live Meter
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {budgetData?.categoryAnalysis && budgetData.categoryAnalysis.length > 0 ? (
            budgetData.categoryAnalysis.map((item) => {
              const meta = STUDENT_CATEGORIES[item.category] || STUDENT_CATEGORIES.Other;
              const Icon = meta.icon;

              return (
                <div
                  key={item.category}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${meta.bgLight} ${meta.textColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold font-serif text-sm text-slate-900 dark:text-white">
                          {meta.emoji} {item.category}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          Allocated: ₹{item.allocated.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          item.status === "exceeded"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : item.status === "warning"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {item.percentage}% used
                      </span>
                      <div className="text-xs font-serif font-bold text-slate-900 dark:text-white mt-1">
                        ₹{item.spent.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.status === "exceeded"
                          ? "bg-rose-500"
                          : item.status === "warning"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400 col-span-2">
              No category allocations set yet. Click &quot;Configure Monthly Budget&quot; to set target caps!
            </p>
          )}
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 animate-slide-up stagger-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Milestone Vaults</span>
            </div>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Student Savings Goals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accumulate funds for laptops, mobile phones, semester trips, and emergency reserves.
            </p>
          </div>

          <button
            onClick={() => setIsAddingGoal(true)}
            className="btn-press px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            + Add Target
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <PiggyBank className="w-10 h-10 text-amber-500/60 mx-auto mb-2" />
            <p className="font-serif font-bold text-slate-900 dark:text-white">No Savings Goals Configured</p>
            <p className="text-xs text-slate-400 mt-1">
              Start building a target fund for your next device, project, or trip!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              const remainingAmt = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div
                  key={goal._id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-xl">
                        {goal.category === "Travel" ? <Plane className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                      </div>

                      {goal.isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Achieved!
                        </span>
                      ) : (
                        <span className="text-xs font-serif font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded">
                          {pct}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold font-serif text-slate-900 dark:text-white text-base mt-3">
                      {goal.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Target: ₹{goal.targetAmount.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                        ₹{goal.currentAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ₹{remainingAmt.toLocaleString("en-IN")} to go
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => setDepositGoal(goal)}
                      className="btn-press flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-amber-300 dark:text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Deposit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-xs text-slate-400 hover:text-rose-500 px-2 py-1.5 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Edit Monthly Budget */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
              Configure Monthly Budget
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Set your overall allowance limit and assign category spending caps.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Total Monthly Allowance / Budget (₹)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={budgetForm.totalBudget}
                  onChange={(e) => setBudgetForm({ ...budgetForm, totalBudget: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm font-bold font-serif text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Category Allocation Caps (₹)
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                  {STUDENT_CATEGORY_LIST.map((cat) => (
                    <div key={cat} className="space-y-1">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate block">
                        {STUDENT_CATEGORIES[cat].emoji} {cat}
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={budgetForm.categoryBudgets[cat] || ""}
                        onChange={(e) =>
                          setBudgetForm({
                            ...budgetForm,
                            categoryBudgets: {
                              ...budgetForm.categoryBudgets,
                              [cat]: Number(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-serif font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-press px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Savings Goal */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
              Establish Savings Goal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Define a target expenditure to build savings systematically.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook M3, Goa Vacation, Semester Emergency"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Target (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="60000"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-sm font-serif font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Initial Deposit (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={goalForm.currentAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-sm font-serif font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Gadget">Gadget & Hardware</option>
                  <option value="Travel">Travel & Semester Trip</option>
                  <option value="Education">Education & Courses</option>
                  <option value="Emergency">Emergency Reserve</option>
                  <option value="Lifestyle">Lifestyle & Apparel</option>
                  <option value="Other">Other Objective</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-press px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {saving ? "Creating..." : "Establish Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Deposit */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white mb-1">
              Deposit to {depositGoal.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter the amount you wish to contribute towards this target.
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Contribution Value (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-base font-serif font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-press px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {saving ? "Depositing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetPlanner;
