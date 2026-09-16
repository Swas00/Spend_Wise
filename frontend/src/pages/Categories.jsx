import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  PiggyBank,
  FolderMinus
} from "lucide-react";
import { getExpenses } from "../services/api";
import {
  STUDENT_CATEGORIES,
  STUDENT_CATEGORY_LIST
} from "../utils/studentCategories";

function Categories() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        const data = await getExpenses();
        if (active) {
          setExpenses(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load expenses");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const { categoryStats, grandTotal } = useMemo(() => {
    const total = expenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const statsMap = {};
    STUDENT_CATEGORY_LIST.forEach((catKey) => {
      const meta = STUDENT_CATEGORIES[catKey];
      statsMap[catKey] = {
        key: catKey,
        name: meta.label,
        emoji: meta.emoji,
        desc: meta.desc,
        meta,
        total: 0,
        count: 0
      };
    });

    expenses.forEach((item) => {
      let catKey = item.category;
      if (catKey === "Travel") catKey = "Transport";
      if (!statsMap[catKey]) catKey = "Other";

      statsMap[catKey].total += Number(item.amount) || 0;
      statsMap[catKey].count += 1;
    });

    const statsList = Object.values(statsMap).map((stat) => ({
      ...stat,
      percentage: total > 0 ? (stat.total / total) * 100 : 0,
      average: stat.count > 0 ? stat.total / stat.count : 0
    }));

    return { categoryStats: statsList, grandTotal: total };
  }, [expenses]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 animate-pulse"></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 animate-slide-down">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <PiggyBank className="w-4 h-4" />
            <span>Campus Categories &bull; Expense Breakdown</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Campus Categories
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Breakdown of your student expenses across canteen, commute, books, hostel, and outings.
          </p>
        </div>

        <Link
          to="/add-expense"
          className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-xl font-medium shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-amber-400" />
          <span>Add Expense</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-sm animate-slide-down">
          {error}
        </div>
      )}

      {/* Category Cards with Animated Progress Bars */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map((item, index) => {
          const meta = item.meta;
          const Icon = meta.icon || FolderMinus;

          return (
            <div
              key={item.key}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-4 animate-slide-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${meta.bgLight} ${meta.textColor} ${meta.borderColor} border shadow-xs`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-serif text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {item.count} {item.count === 1 ? "expense entry" : "expense entries"}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-serif font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
                {item.desc}
              </p>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                    ₹{item.total.toLocaleString("en-IN")}
                  </span>
                  {item.count > 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      avg ₹{Math.round(item.average).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
                  <div
                    className={`h-full ${meta.barColor} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classic Accounting Ledger Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-slide-up stagger-3">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
            Campus Category & Expense Breakdown
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consolidated statement of Indian student campus expenditure
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3.5">Campus Category</th>
                <th className="px-6 py-3.5 text-right">Entries</th>
                <th className="px-6 py-3.5 text-right">Total Expenses (₹)</th>
                <th className="px-6 py-3.5 text-right">% of Total</th>
                <th className="px-6 py-3.5 text-right">Average / Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {categoryStats.map((item) => (
                <tr
                  key={item.key}
                  className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">{item.count}</td>
                  <td className="px-6 py-4 text-right font-serif font-bold text-slate-900 dark:text-white">
                    ₹{item.total.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">
                    {item.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">
                    ₹{Math.round(item.average).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Double border footer for classic accounting balance */}
            <tfoot className="bg-slate-100/60 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-t-2 border-b-2 border-slate-300 dark:border-slate-700">
              <tr>
                <td className="px-6 py-4 font-serif text-sm">Total Campus Expenses</td>
                <td className="px-6 py-4 text-right font-serif">
                  {expenses.length}
                </td>
                <td className="px-6 py-4 text-right font-serif text-base text-amber-950 dark:text-amber-300">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4 text-right font-serif">100.0%</td>
                <td className="px-6 py-4 text-right font-serif">
                  ₹{expenses.length > 0
                    ? Math.round(grandTotal / expenses.length).toLocaleString("en-IN")
                    : 0}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Categories;