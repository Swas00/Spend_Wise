import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Utensils
} from "lucide-react";
import { getExpenses } from "../services/api";
import { STUDENT_CATEGORIES } from "../utils/studentCategories";

function CalendarView() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getExpenses();
        setExpenses(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load ledger transactions");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Map expenses by YYYY-MM-DD
  const expenseDateMap = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (!e.date) return;
      const key = new Date(e.date).toISOString().split("T")[0];
      if (!map[key]) {
        map[key] = { total: 0, items: [] };
      }
      map[key].total += Number(e.amount) || 0;
      map[key].items.push(e);
    });
    return map;
  }, [expenses]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Leading empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, dateKey: null });
    }
    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ dayNumber: d, dateKey });
    }
    return days;
  }, [year, month]);

  const selectedDayExpenses = expenseDateMap[selectedDateKey]?.items || [];
  const selectedDayTotal = expenseDateMap[selectedDateKey]?.total || 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 animate-pulse"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 animate-slide-down">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Daily Campus Expenses &bull; Calendar Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Expense Calendar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Visualize daily spending patterns, spot canteen spikes, and celebrate zero-spend days.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-serif font-bold text-sm text-slate-900 dark:text-white px-3">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main Grid: Calendar on Left, Selected Day Details on Right */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {calendarDays.map((cell, idx) => {
              if (!cell.dayNumber) {
                return <div key={idx} className="h-20 sm:h-24 rounded-2xl bg-transparent" />;
              }

              const dayData = expenseDateMap[cell.dateKey];
              const hasSpend = dayData && dayData.total > 0;
              const isSelected = selectedDateKey === cell.dateKey;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm"
                      : hasSpend
                      ? "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Category dot indicators */}
                    {hasSpend && (
                      <div className="flex gap-0.5">
                        {dayData.items.slice(0, 3).map((item, dotIdx) => {
                          const meta = STUDENT_CATEGORIES[item.category] || STUDENT_CATEGORIES.Other;
                          return (
                            <span
                              key={dotIdx}
                              className={`w-1.5 h-1.5 rounded-full ${meta.barColor}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    {hasSpend ? (
                      <span className="text-[11px] sm:text-xs font-serif font-bold text-slate-900 dark:text-white block truncate">
                        ₹{dayData.total.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
                        Zero Spend 🎯
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Transaction Drawer */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Daily Expense Breakdown
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                  {new Date(selectedDateKey + "T00:00:00").toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </h3>
              </div>

              <span className="text-lg font-bold font-serif text-amber-600 dark:text-amber-400">
                ₹{selectedDayTotal.toLocaleString("en-IN")}
              </span>
            </div>

            {selectedDayExpenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
                <p className="font-serif font-bold text-slate-800 dark:text-slate-200">
                  Great Discipline! Zero Spend Day! 🎯
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  No money spent today. 100% saved towards your monthly savings goal!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {selectedDayExpenses.map((item) => {
                  const meta = STUDENT_CATEGORIES[item.category] || STUDENT_CATEGORIES.Other;
                  const Icon = meta.icon || Utensils;

                  return (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${meta.bgLight} ${meta.textColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {item.description || item.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {meta.emoji} {item.category} &bull; {item.paymentMethod || "UPI"}
                          </span>
                        </div>
                      </div>

                      <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                        ₹{Number(item.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
