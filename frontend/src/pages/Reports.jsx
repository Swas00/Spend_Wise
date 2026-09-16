import { useState, useEffect, useMemo } from "react";
import {
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Receipt,
  PiggyBank,
  Landmark,
  Layers
} from "lucide-react";
import { getExpenses, getIncomes, getCurrentBudget } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Reports() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "expenses" | "incomes"
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [expData, incData, budData] = await Promise.allSettled([
          getExpenses(),
          getIncomes(),
          getCurrentBudget(selectedMonth)
        ]);
        if (expData.status === "fulfilled") setExpenses(Array.isArray(expData.value) ? expData.value : []);
        if (incData.status === "fulfilled") setIncomes(Array.isArray(incData.value) ? incData.value : []);
        if (budData.status === "fulfilled") setBudget(budData.value);
      } catch (err) {
        console.error("Failed to load reports data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMonth]);

  // Filter transactions for the chosen month
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const monthMatch = e.date ? e.date.startsWith(selectedMonth) : false;
      const searchMatch =
        !searchTerm ||
        (e.title && e.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return monthMatch && searchMatch;
    });
  }, [expenses, selectedMonth, searchTerm]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => {
      const monthMatch = i.date ? i.date.startsWith(selectedMonth) : false;
      const searchMatch =
        !searchTerm ||
        (i.source && i.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return monthMatch && searchMatch;
    });
  }, [incomes, selectedMonth, searchTerm]);

  // Combined ledger stream
  const combinedTransactions = useMemo(() => {
    const list = [];
    if (typeFilter === "all" || typeFilter === "expenses") {
      filteredExpenses.forEach((exp) => {
        list.push({
          id: exp._id,
          date: exp.date,
          title: exp.title,
          category: exp.category || "Other",
          type: "expense",
          amount: Number(exp.amount) || 0,
          paymentMethod: exp.paymentMethod || "UPI",
          notes: exp.notes || ""
        });
      });
    }
    if (typeFilter === "all" || typeFilter === "incomes") {
      filteredIncomes.forEach((inc) => {
        list.push({
          id: inc._id,
          date: inc.date,
          title: inc.source || "Income",
          category: inc.source || "Allowance",
          type: "income",
          amount: Number(inc.amount) || 0,
          paymentMethod: "Bank / Transfer",
          notes: inc.description || ""
        });
      });
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredExpenses, filteredIncomes, typeFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalExp = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalInc = filteredIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const netSavings = totalInc - totalExp;
    const savingsRate = totalInc > 0 ? Math.max(0, Math.round((netSavings / totalInc) * 100)) : 0;

    // Category breakdown
    const catMap = {};
    filteredExpenses.forEach((exp) => {
      const cat = exp.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + (Number(exp.amount) || 0);
    });

    const categoryBreakdown = Object.entries(catMap)
      .map(([name, total]) => ({
        name,
        total,
        percentage: totalExp > 0 ? Math.round((total / totalExp) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalExp,
      totalInc,
      netSavings,
      savingsRate,
      categoryBreakdown,
      count: combinedTransactions.length
    };
  }, [filteredExpenses, filteredIncomes, combinedTransactions]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (combinedTransactions.length === 0) {
      alert("No transaction records available for export in this timeframe.");
      return;
    }

    const headers = ["Date", "Type", "Title/Source", "Category", "Payment Method", "Amount (INR)", "Notes"];
    const rows = combinedTransactions.map((t) => [
      t.date ? new Date(t.date).toLocaleDateString("en-IN") : "",
      t.type.toUpperCase(),
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${(t.category || "").replace(/"/g, '""')}"`,
      `"${(t.paymentMethod || "").replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `SpendWise_Ledger_Statement_${selectedMonth.replace("-", "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in print:p-0 print:m-0 print:max-w-none">
      {/* Non-print Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Landmark className="w-4 h-4" />
            <span>Indian Student Treasury &bull; Monthly Statement & Guardian Report</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-serif">
            Financial Statements & CSV Export
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Generate monthly expenditure statements for personal audit, flatmates, or parents/guardians.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="btn-press inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-press inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Statement / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon (Hidden on Print) */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs backdrop-blur-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Statement Cycle:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                typeFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              All Entries
            </button>
            <button
              onClick={() => setTypeFilter("expenses")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                typeFilter === "expenses"
                  ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Outflows (Expenses)
            </button>
            <button
              onClick={() => setTypeFilter("incomes")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                typeFilter === "incomes"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Inflows (Pocket Money)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search statement records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-48"
          />
        </div>
      </div>

      {/* Printable Statement Sheet Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Printable Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-amber-500/40 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-serif uppercase tracking-wider text-slate-900 dark:text-white">
                Spend<span className="text-amber-500">Wise</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                Official Student Financial Statement
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personal Treasury & Indian College Student Accounting
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <p className="font-semibold text-slate-900 dark:text-white">
              Account Holder: <span className="font-bold">{user?.name || "Student Scholar"}</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400">Email: {user?.email || "N/A"}</p>
            <p className="text-slate-500 dark:text-slate-400">
              Statement Cycle:{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(selectedMonth + "-01").toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </p>
          </div>
        </div>

        {/* Executive Summary Quadrant */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Total Inflows
            </span>
            <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{stats.totalInc.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-400">{filteredIncomes.length} pocket money / credits</p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Total Outflows (Expenses)
            </span>
            <p className="text-2xl font-bold font-serif text-rose-600 dark:text-rose-400 mt-1">
              ₹{stats.totalExp.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-400">{filteredExpenses.length} vouchers logged</p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5 text-amber-500" /> Net Surplus (Savings)
            </span>
            <p
              className={`text-2xl font-bold font-serif mt-1 ${
                stats.netSavings >= 0
                  ? "text-slate-900 dark:text-white"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              ₹{stats.netSavings.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-400">
              {budget?.totalBudget
                ? `Budget cap: ₹${Number(budget.totalBudget).toLocaleString("en-IN")}`
                : stats.netSavings >= 0
                ? "Surplus remaining"
                : "Budget deficit"}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Savings Rate
            </span>
            <p className="text-2xl font-bold font-serif text-blue-600 dark:text-blue-400 mt-1">
              {stats.savingsRate}%
            </p>
            <p className="text-[11px] text-slate-400">Of monthly allowance preserved</p>
          </div>
        </div>

        {/* Category Expenditure Allocation Summary */}
        {stats.categoryBreakdown.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Categorical Expenditure Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.categoryBreakdown.map((item) => (
                <div
                  key={item.name}
                  className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-400 font-medium">{item.percentage}%</span>
                  </div>
                  <p className="text-base font-bold font-serif text-slate-900 dark:text-white mt-1">
                    ₹{item.total.toLocaleString("en-IN")}
                  </p>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Journal Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              Verified Ledger Transactions ({combinedTransactions.length})
            </h3>
            <span className="text-xs text-slate-400">Currency: INR (₹)</span>
          </div>

          {combinedTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-sm">
              No transactions found for the chosen month and filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {combinedTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {tx.date ? new Date(tx.date).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {tx.title}
                        {tx.notes && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            {tx.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {tx.paymentMethod}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-serif font-bold whitespace-nowrap ${
                          tx.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}₹
                        {tx.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Verification Footer for Print */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-1">
          <p>This statement is auto-generated by SpendWise Financial Ledger. All records are cryptographically verified per user authentication.</p>
          <p>Generated on {new Date().toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  );
}

export default Reports;
