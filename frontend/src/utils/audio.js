// SpendWise Sound Effects Engine using the HTML5 Web Audio API
// 100% self-contained, zero-dependency, zero-latency luxury audio synthesizer

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play a single harmonic bell tone with exponential decay
  playTone(ctx, freq, startTime, duration = 0.6, volume = 0.2, type = "sine") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    // Smooth attack
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    // Exponential bell decay
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Login Sound: Rich 3-note golden vault chime
  playLoginSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: D5 (587.33 Hz)
      this.playTone(ctx, 587.33, now, 0.5, 0.18, "sine");
      this.playTone(ctx, 1174.66, now, 0.35, 0.06, "triangle");

      // Note 2: A5 (880.00 Hz) at +100ms
      this.playTone(ctx, 880.0, now + 0.1, 0.6, 0.2, "sine");
      this.playTone(ctx, 1760.0, now + 0.1, 0.4, 0.07, "triangle");

      // Note 3: High D6 (1174.66 Hz) at +220ms
      this.playTone(ctx, 1174.66, now + 0.22, 0.8, 0.22, "sine");
      this.playTone(ctx, 2349.32, now + 0.22, 0.5, 0.08, "triangle");
      // Subtle coin shimmer overtone
      this.playTone(ctx, 3520.0, now + 0.24, 0.4, 0.04, "sine");
    } catch (e) {
      console.warn("Audio playback not permitted or supported:", e);
    }
  }

  // Signup Sound: Ascending 4-note celebration chime with coin sparkle
  playSignupSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: C5 (523.25 Hz)
      this.playTone(ctx, 523.25, now, 0.45, 0.16, "sine");
      this.playTone(ctx, 1046.5, now, 0.3, 0.05, "triangle");

      // Note 2: E5 (659.25 Hz) at +85ms
      this.playTone(ctx, 659.25, now + 0.085, 0.5, 0.18, "sine");

      // Note 3: G5 (783.99 Hz) at +170ms
      this.playTone(ctx, 783.99, now + 0.17, 0.55, 0.2, "sine");

      // Note 4: C6 (1046.50 Hz) at +260ms - triumphant ringing chord
      this.playTone(ctx, 1046.5, now + 0.26, 0.9, 0.24, "sine");
      this.playTone(ctx, 1318.51, now + 0.28, 0.8, 0.15, "sine"); // E6 harmony
      this.playTone(ctx, 2093.0, now + 0.26, 0.6, 0.08, "triangle"); // High sparkle
    } catch (e) {
      console.warn("Audio playback not permitted or supported:", e);
    }
  }
}

export const soundFx = new SoundSynthesizer();
