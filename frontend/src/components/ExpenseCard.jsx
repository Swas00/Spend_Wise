import { Pencil, Trash2, Calendar } from "lucide-react";
import { STUDENT_CATEGORIES } from "../utils/studentCategories";

function ExpenseCard({ expense, onDelete, onEdit }) {
  const catKey = expense.category === "Travel" ? "Transport" : expense.category;
  const meta = STUDENT_CATEGORIES[catKey] || STUDENT_CATEGORIES.Other;

  const formattedDate = expense.date
    ? new Date(expense.date).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "";

  return (
    <div className="group relative bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xs">
      {/* Decorative vertical ledger indicator */}
      <div className={`absolute left-0 top-3 bottom-3 w-1.5 ${meta.barColor} rounded-r transition-colors duration-300`} />

      <div className="pl-2 space-y-1.5 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-amber-950 dark:group-hover:text-amber-400 transition-colors">
            ₹{Number(expense.amount).toLocaleString("en-IN")}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md border font-medium tracking-wide ${meta.bgLight} ${meta.textColor} ${meta.borderColor}`}
          >
            <span>{meta.emoji}</span>
            <span>{meta.label || expense.category}</span>
          </span>

          {expense.paymentMethod && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {expense.paymentMethod}
            </span>
          )}
        </div>

        {expense.description && (
          <p className="text-slate-600 dark:text-slate-300 text-sm font-normal">
            {expense.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center pl-2">
        {onEdit && (
          <button
            onClick={() => onEdit(expense)}
            aria-label="Edit expense"
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 hover:text-amber-800 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(expense._id)}
            aria-label="Delete expense"
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 hover:border-rose-300 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ExpenseCard;
