import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  Filter,
  X,
  Save,
  Receipt,
  BookOpen
} from "lucide-react";
import ExpenseCard from "../components/ExpenseCard";
import { getExpenses, updateExpense, deleteExpense } from "../services/api";
import {
  STUDENT_CATEGORIES,
  STUDENT_CATEGORY_LIST
} from "../utils/studentCategories";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Editing state
  const [editingExpense, setEditingExpense] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    category: "Food",
    date: "",
    description: ""
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const data = await getExpenses();
        if (!ignore) {
          setExpenses(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Error fetching expenses");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you wish to strike this entry from the ledger?")) {
      return;
    }

    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete expense");
    }
  };

  const handleStartEdit = (expense) => {
    setEditingExpense(expense);
    setEditFormData({
      amount: expense.amount || "",
      category: expense.category || "Food",
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
      description: expense.description || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      setSubmittingEdit(true);
      const updated = await updateExpense(editingExpense._id, {
        amount: Number(editFormData.amount),
        category: editFormData.category,
        date: editFormData.date,
        description: editFormData.description
      });

      setExpenses((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
      setEditingExpense(null);
    } catch (err) {
      alert(err.message || "Failed to update expense");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const itemCat = item.category === "Travel" ? "Transport" : item.category;
      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory ||
        itemCat === selectedCategory;

      const meta = STUDENT_CATEGORIES[itemCat] || STUDENT_CATEGORIES.Other;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (meta.label && meta.label.toLowerCase().includes(query)) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(query)) ||
        item.amount.toString().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [expenses, selectedCategory, searchQuery]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  }, [filteredExpenses]);

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 animate-slide-down">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Campus Expense Journal &bull; Student Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Daily Expenses & Ledger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Search, verify, edit, or remove your daily student expense records.
          </p>
        </div>

        <Link
          to="/add-expense"
          className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-300 dark:text-amber-400 border border-amber-500/30 rounded-xl font-medium shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-amber-400" />
          <span>Add Expense</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-sm animate-slide-down">
          {error}
        </div>
      )}

      {/* Filter and Search Bar with Animated Focus */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 animate-slide-up stagger-1 backdrop-blur-xs">
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400" />
          <input
            type="text"
            placeholder="Search by Swiggy, Metro, Xerox, cafe, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
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
      </div>

      {/* Total Filter Summary */}
      {!loading && expenses.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>
            Displaying {filteredExpenses.length} of {expenses.length} expense entries
          </span>
          <span>
            Total Expenses:{" "}
            <strong className="text-slate-900 dark:text-white font-serif font-bold text-sm">
              ₹{totalFilteredAmount.toLocaleString("en-IN")}
            </strong>
          </span>
        </div>
      )}

      {/* Expense List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm backdrop-blur-xs animate-slide-up">
          <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700">
            <Receipt className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white mb-1">
            No Expense Records Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
            {expenses.length === 0
              ? "Your ledger currently has no campus expense records documented."
              : "No transactions meet your query or chosen category parameters."}
          </p>
          {expenses.length === 0 && (
            <Link
              to="/add-expense"
              className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-amber-500 text-amber-300 dark:text-slate-950 rounded-xl font-medium transition-all"
            >
              <PlusCircle className="w-5 h-5 text-amber-400 dark:text-slate-950" />
              <span>Record First Expense</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredExpenses.map((expense, idx) => (
            <div
              key={expense._id}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
            >
              <ExpenseCard
                expense={expense}
                onDelete={handleDelete}
                onEdit={handleStartEdit}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Expense Modal Dialog with Backdrop Blur & ScaleIn */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-500/30 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                  Edit Expense Entry
                </h3>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, amount: e.target.value })
                  }
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-base font-serif font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Student Category
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, category: e.target.value })
                  }
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, date: e.target.value })
                  }
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Description / Payee
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:outline-none transition-all"
                  placeholder="Details of transaction..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-press flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-press flex-1 py-2.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-amber-300 dark:text-slate-950 border border-amber-500/30 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  <Save className="w-4 h-4 text-amber-400 dark:text-slate-950" />
                  <span>{submittingEdit ? "Amending..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;