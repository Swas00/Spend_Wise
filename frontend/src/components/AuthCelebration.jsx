import { useEffect, useState } from "react";
import { Coins, CheckCircle2, Volume2, Sparkles, Check, ArrowRight } from "lucide-react";
import { soundFx } from "../utils/audio";
import { useTheme } from "../context/ThemeContext";

function AuthCelebration({ type = "login", userName, onComplete }) {
  const isSignup = type === "signup";
  const firstName = userName?.trim().split(" ")[0] || "User";

  const { colorTheme, setColorTheme, updateThemePreference, availableThemes } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(colorTheme);
  const [rememberPreference, setRememberPreference] = useState(true);

  useEffect(() => {
    // Play synthesized luxury chime
    if (isSignup) {
      soundFx.playSignupSound();
    } else {
      soundFx.playLoginSound();
    }
  }, [isSignup]);

  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
    // Instant live preview
    setColorTheme(themeId);
  };

  const handleContinue = () => {
    updateThemePreference(selectedTheme, rememberPreference);
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center animate-scale-in relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Animated Coin Shield with Glowing Halo */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-bounce">
            <Coins className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full shadow-md animate-scale-in">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Audio Equalizer Wave Animation */}
        <div className="flex items-center justify-center gap-1.5 h-6 mb-3 px-3 py-0.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-full">
          <Volume2 className="w-3 h-3 text-amber-600 dark:text-amber-400 mr-1 animate-pulse" />
          <span className="w-1 bg-amber-500 rounded-full animate-sound-wave-1" />
          <span className="w-1 bg-amber-400 rounded-full animate-sound-wave-2" />
          <span className="w-1 bg-amber-500 rounded-full animate-sound-wave-3" />
          <span className="w-1 bg-amber-400 rounded-full animate-sound-wave-4" />
          <span className="w-1 bg-amber-500 rounded-full animate-sound-wave-5" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-300 ml-1.5">
            {isSignup ? "Charter Sound" : "Vault Chime"}
          </span>
        </div>

        {/* Tag & Heading */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
          <Sparkles className="w-3 h-3" />
          <span>{isSignup ? "Account Established" : "Authorized Entry"}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight text-center">
          Welcome, {firstName}!
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center max-w-xs">
          Choose a color palette for your personal campus ledger.
        </p>

        {/* 5 Theme Selection Options with Live Swatches */}
        <div className="w-full mt-4 space-y-1.5">
          {availableThemes.map((t) => {
            const isSelected = selectedTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTheme(t.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold border-amber-500/50 shadow-md ring-1 ring-amber-500/40"
                    : "border-slate-200/80 dark:border-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full bg-gradient-to-tr ${t.previewGradient} shadow-xs shrink-0 ring-2 ring-white dark:ring-slate-900`}
                  />
                  <div className="text-left">
                    <span className="text-xs font-semibold block leading-tight">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {t.category} &bull; {t.description.split(".")[0]}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Remember Preference Checkbox */}
        <div className="w-full mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <label className="flex items-center justify-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
            />
            <span className="font-medium">Remember my color preference on this device</span>
          </label>
          <p className="text-[10px] text-slate-400 text-center mt-0.5">
            {rememberPreference
              ? "Your choice will be saved as your default style."
              : "Applied only for this session without saving permanently."}
          </p>
        </div>

        {/* Continue CTA Button */}
        <div className="w-full mt-4 space-y-2">
          <button
            type="button"
            onClick={handleContinue}
            className="btn-press w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wide rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Enter Campus Treasury</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleContinue}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Skip with Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCelebration;
