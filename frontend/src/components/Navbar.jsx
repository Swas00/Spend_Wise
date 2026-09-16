import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
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
  Check
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { theme, toggleTheme, colorTheme, setColorTheme, availableThemes } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);

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

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/add-expense", label: "Add Expense", icon: PlusCircle },
    { to: "/expenses", label: "Expense Diary", icon: Receipt },
    { to: "/budget", label: "Budget & Savings", icon: Sliders },
    { to: "/splits", label: "Roommate Split", icon: Users },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/advisor", label: "AI Advisor", icon: Sparkles },
    { to: "/reports", label: "Reports", icon: FileSpreadsheet }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Mark */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-[1.02] shrink-0"
          >
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/10 group-hover:rotate-6 transition-transform duration-300">
              <Coins className="w-5 h-5 animate-float" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-wider uppercase font-serif text-amber-50 group-hover:text-amber-300 transition-colors">
                Spend<span className="text-amber-400">Wise</span>
              </span>
              <span className="text-[9px] tracking-widest uppercase text-amber-400/80 font-medium hidden sm:inline">
                Indian Campus Treasury &bull; Student Ledger
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 btn-press ${
                      isActive
                        ? "text-amber-300 bg-slate-800/90 shadow-inner font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
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
            </nav>
          )}

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn-press flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800/80 transition-colors border border-slate-700/60 cursor-pointer"
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
            <div className="relative">
              <button
                onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                className="btn-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-700/60 cursor-pointer"
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
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-750 border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-xl animate-scale-in">
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

            {/* Install PWA Button */}
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="btn-press hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer animate-scale-in"
                title="Install SpendWise as a Desktop / Mobile Application"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* User Profile & Auth Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700/70">
                <div
                  className="flex items-center gap-2 px-2 py-1 bg-slate-800/80 border border-amber-500/20 rounded-xl"
                  title={`Logged in as ${user?.name} (${user?.email})`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 text-xs font-bold font-serif flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                  <span className="hidden md:inline text-xs font-medium text-slate-200 truncate max-w-[100px]">
                    {user?.name?.split(" ")[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn-press hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-medium transition-all cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>

                {/* Mobile Menu Hamburger Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="btn-press xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700/70">
                <Link
                  to="/login"
                  className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/80 text-xs font-semibold transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-press flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-slate-800 space-y-1 animate-slide-down">
            <div className="grid grid-cols-2 gap-1.5 pb-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "text-amber-300 bg-slate-800 font-bold border border-amber-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            {/* Mobile Theme Palette Selector Strip */}
            <div className="pt-2.5 pb-2 border-t border-slate-800 px-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Color Palette:
              </span>
              <div className="flex items-center gap-2.5">
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

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center px-2">
              <span className="text-xs text-slate-400">
                Logged in as <strong className="text-white">{user?.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
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