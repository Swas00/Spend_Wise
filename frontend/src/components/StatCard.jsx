function StatCard({ title, value, subtitle, icon: Icon, color = "amber" }) {
  const colorMap = {
    amber: {
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accent: "group-hover:border-amber-500/50"
    },
    emerald: {
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accent: "group-hover:border-emerald-500/50"
    },
    blue: {
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      accent: "group-hover:border-sky-500/50"
    },
    crimson: {
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      accent: "group-hover:border-rose-500/50"
    }
  };

  const scheme = colorMap[color] || colorMap.amber;

  return (
    <div
      className={`group relative bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 ${scheme.accent} rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-md overflow-hidden`}
    >
      {/* Ambient background glow on hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
            {title}
          </span>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-serif">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-3.5 rounded-2xl border ${scheme.iconBg} shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
