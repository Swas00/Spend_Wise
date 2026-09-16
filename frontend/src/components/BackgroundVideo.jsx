import { useRef, useState, useEffect } from "react";
import { Play, Pause, Film } from "lucide-react";

function BackgroundVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayback = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <>
      {/* Fixed Ambient Video Background Container */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* HTML5 Video Element with enhanced brightness and opacity */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50 sm:opacity-60 dark:opacity-45 scale-105 filter contrast-130 brightness-115 saturate-135 transition-all duration-700"
        >
          <source src="/background-coins.webm" type="video/webm" />
        </video>

        {/* Theme-Adaptive Ambient Overlay for High Text Readability & Golden Gleam */}
        <div className="absolute inset-0 bg-[#f8fafc]/55 dark:bg-slate-950/75 backdrop-blur-[0.5px] transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/[0.03] to-slate-950/[0.08] dark:from-slate-950/70 dark:via-transparent dark:to-slate-950/90 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating Ambient Video Control Button */}
      <div
        className="fixed bottom-5 right-5 z-40"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={togglePlayback}
          className="btn-press flex items-center gap-2 px-3.5 py-2 bg-slate-900/85 hover:bg-slate-900 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-full shadow-lg backdrop-blur-md text-xs font-semibold transition-all cursor-pointer group"
          title={isPlaying ? "Pause background animation" : "Play background animation"}
          aria-label="Toggle background animation"
        >
          <Film className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Play className="w-3.5 h-3.5 text-amber-300" />
          )}
          {showTooltip && (
            <span className="hidden sm:inline animate-fade-in text-[11px] uppercase tracking-wider pl-0.5">
              {isPlaying ? "Ambient Video" : "Paused"}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

export default BackgroundVideo;
