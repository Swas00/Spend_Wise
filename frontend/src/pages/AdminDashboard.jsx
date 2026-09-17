import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Users,
  Receipt,
  IndianRupee,
  RefreshCw,
  Search,
  Download,
  Calendar,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  UserCheck
} from "lucide-react";
import { getAdminStats, getAdminUsers, updateUserRole } from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [statsRes, usersRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers()
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
    } catch (err) {
      setError(err.message || "Failed to load admin metrics");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([getAdminStats(), getAdminUsers()])
      .then(([statsRes, usersRes]) => {
        if (!ignore) {
          setStats(statsRes.stats);
          setUsers(usersRes.users);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Failed to load admin metrics");
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleRoleToggle = async (userId, currentRole, userEmail) => {
    if (userEmail.toLowerCase().includes("swastik")) {
      alert("The master creator account role is immutable.");
      return;
    }

    const nextRole = currentRole === "admin" ? "user" : "admin";
    const confirmMsg = `Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(userId);
      await updateUserRole(userId, nextRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u))
      );
    } catch (err) {
      alert(err.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Export User Directory to CSV
  const handleExportCSV = () => {
    if (!users.length) return;

    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Role",
      "Registration Date",
      "Expenses Logged",
      "Total Amount Logged (INR)"
    ];

    const rows = users.map((u) => [
      `"${u._id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${new Date(u.createdAt).toLocaleString("en-IN")}"`,
      u.expenseCount || 0,
      u.totalSpent || 0
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SpendWise_Registered_Students_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 mb-4 animate-bounce">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Loading Sovereign Admin Portal
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 animate-pulse">
          Aggregating cloud user metrics and campus spending data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20 shrink-0 animate-float">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Sovereign Command Center
              </span>
              <span className="text-[10px] text-slate-400">&bull; Live Platform Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white tracking-tight mt-0.5">
              Admin & Student Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Real-time audit of registered students, campus activity, and database volume.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-400 hover:border-amber-500/40 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-2xl text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Registered Students */}
        <div className="classic-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registered Students
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-serif text-slate-900 dark:text-white tabular-nums">
              {stats?.totalUsers || 0}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{stats?.newUsersThisWeek || 0} joined in last 7 days</span>
            </div>
          </div>
        </div>

        {/* Total Outflows Logged */}
        <div className="classic-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Campus Outflows Logged
            </span>
            <div className="p-2.5 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-serif text-slate-900 dark:text-white tabular-nums">
              ₹{Number(stats?.totalExpenseAmount || 0).toLocaleString("en-IN")}
            </span>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Across <strong>{stats?.totalExpensesCount || 0}</strong> verified expense vouchers
            </div>
          </div>
        </div>

        {/* Total Inflows (Pocket Money / Stipends) */}
        <div className="classic-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Campus Allowances Recorded
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-serif text-slate-900 dark:text-white tabular-nums">
              ₹{Number(stats?.totalIncomeAmount || 0).toLocaleString("en-IN")}
            </span>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Across <strong>{stats?.totalIncomesCount || 0}</strong> pocket money entries
            </div>
          </div>
        </div>

        {/* Active Campus Ensembles (Budgets & Splits) */}
        <div className="classic-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Plans & Splits
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-serif text-slate-900 dark:text-white tabular-nums">
              {(stats?.totalBudgets || 0) + (stats?.totalGoals || 0) + (stats?.totalSplits || 0)}
            </span>
            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {stats?.totalBudgets || 0} Budgets &bull; {stats?.totalGoals || 0} Goals &bull; {stats?.totalSplits || 0} Splits
            </div>
          </div>
        </div>
      </div>

      {/* Registered Students Directory */}
      <div className="classic-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800">
        {/* Table Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>Campus User Registry</span>
              <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.length} Students
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified accounts registered in MongoDB Atlas cloud ledger.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4 font-bold">Student</th>
                <th className="py-3 px-4 font-bold">Email Address</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Registration Date</th>
                <th className="py-3 px-4 font-bold text-center">Expenses Logged</th>
                <th className="py-3 px-4 font-bold text-right">Volume Logged</th>
                <th className="py-3 px-4 font-bold text-center">Privileges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-500/50" />
                    <p className="font-semibold">No students found matching "{searchQuery}"</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.name
                    ? u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "U";

                  const isAdmin = u.role === "admin";
                  const isCreator = u.email.toLowerCase().includes("swastik");

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-serif shrink-0 ${
                              isAdmin
                                ? "bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-xs"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900 dark:text-white">
                              {u.name}
                            </span>
                            {isCreator && (
                              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                                Platform Creator
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            <Shield className="w-3 h-3" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            <UserCheck className="w-3 h-3" />
                            <span>Student</span>
                          </span>
                        )}
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Expenses Logged Count */}
                      <td className="py-3.5 px-4 text-center tabular-nums font-semibold text-slate-700 dark:text-slate-200">
                        {u.expenseCount || 0}
                      </td>

                      {/* Volume Logged */}
                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{Number(u.totalSpent || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Role Toggle Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isCreator ? (
                          <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">
                            Owner
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRoleToggle(u._id, u.role, u.email)}
                            disabled={actionLoading === u._id}
                            className="btn-press text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === u._id
                              ? "Updating..."
                              : isAdmin
                              ? "Demote to Student"
                              : "Make Admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
