import { useEffect } from "react";
import { Coins, CheckCircle2, Volume2, Sparkles } from "lucide-react";
import { soundFx } from "../utils/audio";

function AuthCelebration({ type = "login", userName, onComplete }) {
  const isSignup = type === "signup";
  const firstName = userName?.trim().split(" ")[0] || "User";

  useEffect(() => {
    // Play synthesized luxury chime
    if (isSignup) {
      soundFx.playSignupSound();
    } else {
      soundFx.playLoginSound();
    }

    // Auto complete after audio chime concludes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1300);

    return () => clearTimeout(timer);
  }, [isSignup, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm bg-white/95 dark:bg-slate-900/95 border border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center animate-scale-in relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Central Animated Coin Shield with Glowing Halo */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-bounce">
            <Coins className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 text-white rounded-full shadow-md animate-scale-in">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Audio Equalizer Wave Animation */}
        <div className="flex items-center justify-center gap-1.5 h-8 mb-4 px-4 py-1 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-full">
          <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mr-1 animate-pulse" />
          <span className="w-1 bg-amber-500 rounded-full animate-sound-wave-1" />
          <span className="w-1 bg-amber-400 rounded-full animate-sound-wave-2" />
          <span className="w-1 bg-amber-500 rounded-full animate-sound-wave-3" />
          <span className="w-1 bg-amber-400 rounded-full animate-sound-wave-4" />
          <span className="w-1 bg-amber-500 rounded-full animate-sound-wave-5" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-300 ml-1.5">
            {isSignup ? "Charter Sound" : "Vault Chime"}
          </span>
        </div>

        {/* Tag & Celebratory Heading */}
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isSignup ? "Account Established" : "Authorized Entry"}</span>
        </div>

        <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
          Welcome, {firstName}!
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          {isSignup
            ? "Your sovereign ledger is ready for accounting."
            : "Synchronizing your private ledger records..."}
        </p>
      </div>
    </div>
  );
}

export default AuthCelebration;
