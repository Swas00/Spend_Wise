import { useState, useEffect } from "react";
import {
  Users,
  PlusCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Coins,
  Receipt
} from "lucide-react";
import {
  getSplitBills,
  createSplitBill,
  toggleSettleParticipant,
  deleteSplitBill
} from "../services/api";

function SplitExpenses() {
  const [data, setData] = useState({ bills: [], totalOwedToMe: 0, totalSettled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Split Modal
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    totalAmount: "",
    friendsInput: "Rahul, Priya, Amit, Ayush", // comma separated
    includeMe: true,
    notes: ""
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadSplits() {
      try {
        const res = await getSplitBills();
        if (!ignore) {
          setData(res || { bills: [], totalOwedToMe: 0, totalSettled: 0 });
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load split bills");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSplits();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const handleCreateSplit = async (e) => {
    e.preventDefault();
    const total = Number(form.totalAmount);
    if (!form.title || isNaN(total) || total <= 0) {
      alert("Please enter a valid bill title and amount");
      return;
    }

    const rawNames = form.friendsInput
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (rawNames.length === 0) {
      alert("Please enter at least one friend or roommate's name");
      return;
    }

    const totalHeads = form.includeMe ? rawNames.length + 1 : rawNames.length;
    const sharePerHead = Math.round((total / totalHeads) * 100) / 100;
    const myShare = form.includeMe ? sharePerHead : 0;

    const participants = rawNames.map((name) => ({
      name,
      share: sharePerHead,
      settled: false
    }));

    try {
      setSaving(true);
      await createSplitBill({
        title: form.title,
        totalAmount: total,
        paidByMe: true,
        myShare,
        participants,
        notes: form.notes
      });

      setIsAdding(false);
      setForm({
        title: "",
        totalAmount: "",
        friendsInput: "",
        includeMe: true,
        notes: ""
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Failed to create bill split");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSettle = async (billId, participantIndex) => {
    try {
      await toggleSettleParticipant(billId, participantIndex);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Failed to update settlement status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this split record?")) return;
    try {
      await deleteSplitBill(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "Failed to delete split record");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 animate-pulse"></div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 animate-slide-down">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Roommate & Hostel Ledger &bull; Shared Expenses</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Split Bills & Shared Expenses
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Split apartment rent, dining, groceries, and group outings with flatmates and friends.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="btn-press flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Split New Bill</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-sm animate-slide-down">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-slide-up stagger-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Owed to You</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-serif text-amber-600 dark:text-amber-400">
            ₹{data.totalOwedToMe.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Pending reimbursement from unsettled friends & roommates.
          </p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-slide-up stagger-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Settled Recoveries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            ₹{data.totalSettled.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Collected and reconciled back to your available balance.
          </p>
        </div>
      </div>

      {/* Split Bills List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Active Bill Records ({data.bills.length})
        </h2>

        {data.bills.length === 0 ? (
          <div className="text-center py-12 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold font-serif text-slate-800 dark:text-slate-200">No Shared Expenses Logged</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Split a dinner, flat electricity bill, or movie outing to track who owes what.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.bills.map((bill) => {
              const pendingCount = bill.participants.filter((p) => !p.settled).length;

              return (
                <div
                  key={bill._id}
                  className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 hover:shadow-md transition-all animate-slide-up"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold font-serif text-slate-900 dark:text-white text-lg">
                          {bill.title}
                        </h3>
                        {pendingCount === 0 ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                            Fully Settled
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full">
                            {pendingCount} Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Total Bill: ₹{bill.totalAmount.toLocaleString("en-IN")} &bull; Your Share: ₹
                        {bill.myShare.toLocaleString("en-IN")} &bull;{" "}
                        {new Date(bill.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(bill._id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Delete bill record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Participants Pill List */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Individual Shares & Settlement Status:
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {bill.participants.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                            <span className="text-slate-500 dark:text-slate-400 font-serif">
                              ₹{p.share.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleSettle(bill._id, idx)}
                            className={`btn-press flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                              p.settled
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                            }`}
                          >
                            {p.settled ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Paid</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Mark Paid</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Split Bill */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
              Split a Group Bill
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Enter bill details. SpendWise will divide the bill and calculate your receivables.
            </p>

            <form onSubmit={handleCreateSplit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Bill Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner at Dawat, Wi-Fi recharge, Flat milk"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Total Bill Paid by You (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1200"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-base font-serif font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Friends & Roommates (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rohan, Priya, Amit"
                  value={form.friendsInput}
                  onChange={(e) => setForm({ ...form, friendsInput: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Separate each name with a comma.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="includeMe"
                  type="checkbox"
                  checked={form.includeMe}
                  onChange={(e) => setForm({ ...form, includeMe: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="includeMe" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Include my share in the bill split
                </label>
              </div>

              {/* Dynamic Calculation Preview */}
              {Number(form.totalAmount) > 0 && form.friendsInput.trim().length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Calculated split: </span>
                  {(() => {
                    const names = form.friendsInput.split(",").filter((n) => n.trim().length > 0);
                    const count = form.includeMe ? names.length + 1 : names.length;
                    const perHead = Math.round((Number(form.totalAmount) / Math.max(1, count)) * 100) / 100;
                    const willReceive = Math.round(perHead * names.length);
                    return `₹${perHead}/head across ${count} people. You will receive ₹${willReceive}.`;
                  })()}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-press px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {saving ? "Creating..." : "Save Bill Split"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SplitExpenses;
