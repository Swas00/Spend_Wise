import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  Sliders,
  Users,
  CalendarDays,
  Sparkles,
  FileSpreadsheet,
  Coins,
  Download,
  Sun,
  Moon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Palette,
  Check,
  ChevronDown,
  PieChart,
  Plus,
  KeyRound
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { theme, toggleTheme, colorTheme, setColorTheme, availableThemes } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [installPrompt, setInstallPrompt] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);



  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Primary core navigation items (always visible on desktop/laptop)
  const coreNavItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/expenses", label: "Expenses", icon: Receipt },
    { to: "/budget", label: "Budget", icon: Sliders },
    { to: "/splits", label: "Splits", icon: Users }
  ];

  // Secondary tools (shown in More dropdown on laptops/desktops, inline on wide screens)
  const secondaryNavItems = [
    { to: "/calendar", label: "Calendar", icon: CalendarDays, desc: "Daily logs & zero-spend days" },
    { to: "/advisor", label: "AI Advisor", icon: Sparkles, desc: "Student tips & pocket money pacing" },
    { to: "/reports", label: "Reports", icon: FileSpreadsheet, desc: "Parent statements & CSV export" },
    { to: "/categories", label: "Categories", icon: PieChart, desc: "11 campus spending breakdown" },
    { to: "/forgot-password", label: "Reset Password", icon: KeyRound, desc: "Recover or change account password" }
  ];

  // Check if any secondary route is currently active
  const isSecondaryActive = secondaryNavItems.some((item) => location.pathname === item.to);

  // All items for mobile navigation drawer
  const allMobileNavItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, desc: "Campus financial overview" },
    { to: "/expenses", label: "Expenses", icon: Receipt, desc: "Full transaction diary" },
    { to: "/budget", label: "Budget & Savings", icon: Sliders, desc: "Monthly limits & goals" },
    { to: "/splits", label: "Roommate Split", icon: Users, desc: "Flatmates & shared tabs" },
    { to: "/calendar", label: "Calendar", icon: CalendarDays, desc: "Daily timeline view" },
    { to: "/advisor", label: "AI Advisor", icon: Sparkles, desc: "Campus financial advice" },
    { to: "/reports", label: "Reports", icon: FileSpreadsheet, desc: "Parent-ready statements" },
    { to: "/categories", label: "Categories", icon: PieChart, desc: "Campus spending breakdown" },
    { to: "/forgot-password", label: "Reset Password", icon: KeyRound, desc: "Account recovery & password change" }
  ];

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="bg-slate-900/95 text-slate-100 border-b border-amber-500/20 sticky top-0 z-50 shadow-md backdrop-blur-md transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Brand Mark */}
          <NavLink
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group transition-transform duration-300 hover:scale-[1.02] shrink-0"
          >
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/10 group-hover:rotate-6 transition-transform duration-300 shrink-0">
              <Coins className="w-5 h-5 animate-float" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-wider uppercase font-serif text-amber-50 group-hover:text-amber-300 transition-colors leading-tight">
                Spend<span className="text-amber-400">Wise</span>
              </span>
              <span className="text-[9px] tracking-widest uppercase text-amber-400/80 font-medium hidden 2xl:inline leading-none mt-0.5">
                Indian Campus Treasury &bull; Student Ledger
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {/* Core Items */}
              {coreNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 btn-press whitespace-nowrap ${
                      isActive
                        ? "text-amber-300 bg-slate-800/90 shadow-inner font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                          isActive ? "scale-110 text-amber-400" : ""
                        }`}
                      />
                      <span>{label}</span>

                      {/* Animated bottom bar for active route */}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-scale-in" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Secondary Items - Displayed inline on 2xl screens */}
              <div className="hidden 2xl:flex items-center gap-1.5">
                {secondaryNavItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 btn-press whitespace-nowrap ${
                        isActive
                          ? "text-amber-300 bg-slate-800/90 shadow-inner font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                            isActive ? "scale-110 text-amber-400" : ""
                          }`}
                        />
                        <span>{label}</span>

                        {isActive && (
                          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-scale-in" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* "More" Dropdown Popover on screens under 2xl */}
              <div className="relative 2xl:hidden">
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`relative flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 btn-press cursor-pointer whitespace-nowrap ${
                    isSecondaryActive
                      ? "text-amber-300 bg-slate-800/90 shadow-inner font-semibold border border-amber-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                  title="More campus tools"
                  aria-expanded={moreMenuOpen}
                >
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isSecondaryActive ? "text-amber-400" : ""}`} />
                  <span>More</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 shrink-0 ${
                      moreMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                  {isSecondaryActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>

                {moreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMoreMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-scale-in">
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Campus Financial Tools
                        </p>
                      </div>
                      <div className="space-y-1">
                        {secondaryNavItems.map(({ to, label, icon: Icon, desc }) => {
                          const isActive = location.pathname === to;
                          return (
                            <NavLink
                              key={to}
                              to={to}
                              onClick={() => setMoreMenuOpen(false)}
                              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                                isActive
                                  ? "bg-slate-800/90 text-amber-300 font-semibold border border-amber-500/30"
                                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  isActive
                                    ? "bg-amber-400/20 text-amber-400"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs leading-tight font-medium">
                                  {label}
                                </span>
                                <span className="text-[10px] text-slate-400 leading-tight">
                                  {desc}
                                </span>
                              </div>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>
          )}

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick "Add Expense" CTA Button for Authenticated Users */}
            {isAuthenticated && (
              <Link
                to="/add-expense"
                className="btn-press flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm hover:shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                title="Record new expense or allowance"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </Link>
            )}

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn-press flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 transition-colors border border-slate-700/60 cursor-pointer shrink-0"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 animate-scale-in" />
              ) : (
                <Moon className="w-4 h-4 text-amber-300 animate-scale-in" />
              )}
            </button>

            {/* Theme Palette Picker Popover */}
            <div className="relative shrink-0">
              <button
                onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                className="btn-press flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-700/60 cursor-pointer"
                title="Change Theme Palette"
                aria-label="Change Theme Palette"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </button>

              {paletteMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPaletteMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-xl animate-scale-in">
                    <div className="px-2.5 py-2 border-b border-slate-800 mb-1.5">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        Theme Palette
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Choose your campus style
                      </p>
                    </div>

                    <div className="space-y-1">
                      {availableThemes.map((t) => {
                        const isActive = colorTheme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              setColorTheme(t.id);
                              setPaletteMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                              isActive
                                ? "bg-slate-800/90 text-white font-semibold border border-amber-500/40 shadow-xs"
                                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.previewGradient} shadow-xs shrink-0`}
                              />
                              <div>
                                <span className="text-xs block leading-tight">{t.name}</span>
                                <span className="text-[10px] text-slate-400 block leading-tight">
                                  {t.category}
                                </span>
                              </div>
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Install PWA Button (Desktop/Mobile) */}
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="btn-press hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 text-amber-300 hover:text-white hover:bg-slate-700/80 border border-amber-500/30 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                title="Install SpendWise as an App"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Install</span>
              </button>
            )}

            {/* User Profile & Auth Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-700/70 shrink-0">
                {/* User Avatar Badge */}
                <div
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 border border-amber-500/20 rounded-xl shrink-0"
                  title={`Logged in as ${user?.name} (${user?.email})`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 text-xs font-bold font-serif flex items-center justify-center shadow-xs shrink-0">
                    {initials}
                  </div>
                  <span className="hidden xl:inline text-xs font-medium text-slate-200 truncate max-w-[85px]">
                    {user?.name?.split(" ")[0]}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="btn-press hidden sm:flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-medium transition-all cursor-pointer shrink-0"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>

                {/* Mobile Menu Hamburger Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="btn-press lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 cursor-pointer shrink-0"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-700/70 shrink-0">
                <Link
                  to="/login"
                  className="btn-press flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800/80 text-xs font-semibold transition-all shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-press flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Full Navigation Drawer */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800/80 space-y-2.5 animate-slide-down">
            {/* Quick Action in Mobile Menu */}
            <div className="px-1">
              <Link
                to="/add-expense"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-press flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Expense / Pocket Money</span>
              </Link>
            </div>

            {/* Grid of All Features */}
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {allMobileNavItems.map(({ to, label, icon: Icon, desc }) => {
                const isActive = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "text-amber-300 bg-slate-800/90 font-bold border border-amber-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate leading-tight">{label}</span>
                      <span className="text-[9px] text-slate-400 truncate leading-tight">{desc}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Mobile Theme Palette Selector Strip */}
            <div className="pt-2.5 border-t border-slate-800 px-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Color Palette:
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {availableThemes.map((t) => {
                  const isActive = colorTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setColorTheme(t.id)}
                      className={`relative p-1 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-110"
                          : "opacity-75 hover:opacity-100"
                      }`}
                      title={t.name}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${t.previewGradient} flex items-center justify-center shadow-xs`}
                      >
                        {isActive && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Details & Sign Out */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center px-2">
              <span className="text-xs text-slate-400 truncate max-w-[200px]">
                Logged in as <strong className="text-white">{user?.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn-press flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
