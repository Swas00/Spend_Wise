import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Coins,
  FileCheck2,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat
} from "lucide-react";
import { createExpense, createIncome } from "../services/api";
import {
  STUDENT_CATEGORIES,
  STUDENT_CATEGORY_LIST,
  PAYMENT_METHODS,
  INCOME_SOURCES
} from "../utils/studentCategories";
import { parseNaturalLanguageInput } from "../utils/aiParser";

function AddExpense() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expense"); // "expense" | "income"

  // Natural language quick input
  const [quickInput, setQuickInput] = useState("");
  const [smartParsed, setSmartParsed] = useState(null);

  // Expense form state
  const [expense, setExpense] = useState({
    amount: "",
    category: "Food",
    paymentMethod: "UPI",
    isRecurring: false,
    recurringFrequency: "Monthly",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });

  // Income form state
  const [income, setIncome] = useState({
    amount: "",
    source: "Monthly Allowance",
    paymentMethod: "UPI",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  // Handle Quick Input typing
  const handleQuickInputChange = (e) => {
    const val = e.target.value;
    setQuickInput(val);
    const parsed = parseNaturalLanguageInput(val);
    setSmartParsed(parsed);
  };

  const applySmartInput = () => {
    if (!smartParsed) return;
    setExpense((prev) => ({
      ...prev,
      amount: smartParsed.amount || prev.amount,
      category: smartParsed.category || prev.category,
      description: smartParsed.description || prev.description
    }));
    setQuickInput("");
    setSmartParsed(null);
  };

  const handleExpenseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExpense((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (status.type) setStatus({ type: null, message: "" });
  };

  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    setIncome((prev) => ({
      ...prev,
      [name]: value
    }));
    if (status.type) setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (activeTab === "expense") {
        if (!expense.amount || !expense.date) {
          setStatus({
            type: "error",
            message: "Both a transaction value and timestamp are required."
          });
          return;
        }

        await createExpense({
          amount: Number(expense.amount),
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          isRecurring: expense.isRecurring,
          recurringFrequency: expense.isRecurring ? expense.recurringFrequency : "None",
          date: expense.date,
          description: expense.description.trim()
        });

        setStatus({
          type: "success",
          message: "Expense voucher successfully certified into your ledger."
        });

        setExpense({
          amount: "",
          category: "Food",
          paymentMethod: "UPI",
          isRecurring: false,
          recurringFrequency: "Monthly",
          date: new Date().toISOString().split("T")[0],
          description: ""
        });
      } else {
        if (!income.amount || !income.date) {
          setStatus({
            type: "error",
            message: "Both an income amount and timestamp are required."
          });
          return;
        }

        await createIncome({
          amount: Number(income.amount),
          source: income.source,
          paymentMethod: income.paymentMethod,
          date: income.date,
          description: income.description.trim()
        });

        setStatus({
          type: "success",
          message: "Income credit recorded and added to your available liquidity."
        });

        setIncome({
          amount: "",
          source: "Monthly Allowance",
          paymentMethod: "UPI",
          date: new Date().toISOString().split("T")[0],
          description: ""
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to document entry. Please verify connection."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 animate-slide-down">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Coins className="w-4 h-4" />
            <span>Student Treasury Ledger &bull; New Entry</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Record Transaction
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Log daily expenditures or student income credits into your private ledger.
          </p>
        </div>

        <Link
          to="/expenses"
          className="btn-press inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ledger</span>
        </Link>
      </div>

      {/* Dual Tab Switcher: Expense vs Income */}
      <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            setActiveTab("expense");
            setStatus({ type: null, message: "" });
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-serif text-sm font-bold transition-all cursor-pointer ${
            activeTab === "expense"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-500" />
          <span>College Expense</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("income");
            setStatus({ type: null, message: "" });
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-serif text-sm font-bold transition-all cursor-pointer ${
            activeTab === "income"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          <span>Pocket Money & Inflows</span>
        </button>
      </div>

      {/* Status Alerts */}
      {status.type === "success" && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-xl flex items-center justify-between gap-3 shadow-sm animate-slide-down">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{status.message}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(activeTab === "expense" ? "/expenses" : "/")}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 underline underline-offset-2 cursor-pointer"
          >
            Review &rarr;
          </button>
        </div>
      )}

      {status.type === "error" && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 rounded-xl flex items-center gap-2.5 shadow-sm animate-slide-down">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      {/* AI Smart Expense Parser (Only in Expense mode) */}
      {activeTab === "expense" && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-2 animate-slide-up">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Quick Parser &bull; Campus Categorizer</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={quickInput}
              onChange={handleQuickInputChange}
              placeholder="e.g. 'Swiggy 320', 'Chai samosa 40', 'Metro 45', 'Hostel rent 6500', 'Xerox 15'..."
              className="w-full bg-white dark:bg-slate-800 border border-amber-500/30 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {smartParsed && (smartParsed.amount || smartParsed.category) && (
              <div className="mt-2 flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-400/40 shadow-xs animate-scale-in">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Auto-detected:</span>
                  {smartParsed.amount && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 rounded font-bold font-serif">
                      ₹{smartParsed.amount}
                    </span>
                  )}
                  {smartParsed.category && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 rounded font-medium">
                      {smartParsed.category}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={applySmartInput}
                  className="btn-press px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Apply to Form
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none rounded-2xl p-6 sm:p-8 space-y-6 animate-slide-up stagger-1 backdrop-blur-xs"
      >
        {activeTab === "expense" ? (
          <>
            {/* Expense Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Expense Amount (₹) <span className="text-amber-600 dark:text-amber-400">*</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif font-bold text-xl group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 transition-colors">
                  ₹
                </span>
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="any"
                  value={expense.amount}
                  onChange={handleExpenseChange}
                  placeholder="0.00"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xl font-bold font-serif text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Student Category & Payment Method in 2 columns */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Student Category <span className="text-amber-600 dark:text-amber-400">*</span>
                </label>
                <select
                  name="category"
                  value={expense.category}
                  onChange={handleExpenseChange}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
                >
                  {STUDENT_CATEGORY_LIST.map((catKey) => {
                    const meta = STUDENT_CATEGORIES[catKey];
                    return (
                      <option key={catKey} value={catKey}>
                        {meta.emoji} {meta.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={expense.paymentMethod}
                  onChange={handleExpenseChange}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Transaction Date <span className="text-amber-600 dark:text-amber-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={expense.date}
                onChange={handleExpenseChange}
                required
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Particulars & Merchant Notes <span className="text-slate-400 font-normal tracking-normal lowercase">(optional)</span>
              </label>
              <textarea
                name="description"
                rows={2}
                value={expense.description}
                onChange={handleExpenseChange}
                placeholder="Specify canteen, shop name, books or reason..."
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all"
              />
            </div>

            {/* Recurring Expense Checkbox */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <Repeat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <div>
                  <label htmlFor="isRecurring" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Recurring Monthly Subscription
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hostel rent, Wi-Fi bill, Spotify, Netflix, gym, etc.
                  </p>
                </div>
              </div>
              <input
                id="isRecurring"
                type="checkbox"
                name="isRecurring"
                checked={expense.isRecurring}
                onChange={handleExpenseChange}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </>
        ) : (
          <>
            {/* Income Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Credit Value (₹) <span className="text-emerald-600 dark:text-emerald-400">*</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif font-bold text-xl group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
                  ₹
                </span>
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="any"
                  value={income.amount}
                  onChange={handleIncomeChange}
                  placeholder="0.00"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xl font-bold font-serif text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Income Source & Payment Method */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Income Source <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <select
                  name="source"
                  value={income.source}
                  onChange={handleIncomeChange}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                >
                  {INCOME_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Payment Mode
                </label>
                <select
                  name="paymentMethod"
                  value={income.paymentMethod}
                  onChange={handleIncomeChange}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Deposit Date <span className="text-emerald-600 dark:text-emerald-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={income.date}
                onChange={handleIncomeChange}
                required
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Particulars & Source Details <span className="text-slate-400 font-normal tracking-normal lowercase">(optional)</span>
              </label>
              <textarea
                name="description"
                rows={2}
                value={income.description}
                onChange={handleIncomeChange}
                placeholder="e.g. Monthly allowance from parents, stipend for August, freelance web design..."
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`btn-press w-full font-semibold py-3.5 px-4 rounded-xl border transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
            activeTab === "expense"
              ? "bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-amber-300 dark:text-slate-950 border-amber-500/30"
              : "bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 border-emerald-500/30"
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span>
            {loading
              ? "Updating Ledger..."
              : activeTab === "expense"
              ? "Certify & Save Expense Voucher"
              : "Record & Credit Allowance / Income"}
          </span>
        </button>
      </form>
    </div>
  );
}

export default AddExpense;