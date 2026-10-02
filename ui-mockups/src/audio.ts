import { useSyncExternalStore } from "react";

export type AlertBand = "X" | "K" | "KA" | "LASER";

const MASTER_LEVEL = 0.55;
const STORAGE_KEY = "dowe-lab-sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
let soundOn = readPreference();

const listeners = new Set<() => void>();
const alertNodes = new Set<OscillatorNode>();
const speechTimers = new Set<number>();
const utteranceKeepAlive: SpeechSynthesisUtterance[] = [];
let voices: SpeechSynthesisVoice[] = [];

function readPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 12;
    compressor.ratio.value = 5;
    master = ctx.createGain();
    master.gain.value = soundOn ? MASTER_LEVEL : 0;
    master.connect(compressor);
    compressor.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
  return ctx;
}

/** Call from a user gesture so browsers allow playback afterwards. */
export function unlockAudio(): void {
  unlocked = true;
  getContext();
}

export function isSoundOn(): boolean {
  return soundOn;
}

export function setSoundOn(next: boolean): void {
  if (next === soundOn) return;
  soundOn = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    /* preference is optional */
  }
  if (ctx && master) master.gain.setTargetAtTime(next ? MASTER_LEVEL : 0, ctx.currentTime, 0.01);
  if (!next) {
    stopAlerts();
    stopSpeech();
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribe, isSoundOn, () => true);
}

interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
  attack?: number;
  release?: number;
  alert?: boolean;
}

function tone(frequency: number, start: number, duration: number, options: ToneOptions = {}): void {
  if (!soundOn || !unlocked) return;
  const context = getContext();
  if (!context || !master) return;
  const { type = "square", gain = 0.2, slideTo, attack = 0.004, release = 0.025, alert = false } = options;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const t0 = context.currentTime + start;
  const t1 = t0 + duration;
  const rise = Math.min(attack, duration / 2);
  const fall = Math.min(release, duration / 2);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, t0);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, t1);
  envelope.gain.setValueAtTime(0.0001, t0);
  envelope.gain.linearRampToValueAtTime(gain, t0 + rise);
  envelope.gain.setValueAtTime(gain, t1 - fall);
  envelope.gain.linearRampToValueAtTime(0.0001, t1);
  oscillator.connect(envelope);
  envelope.connect(master);
  oscillator.start(t0);
  oscillator.stop(t1 + 0.02);
  if (alert) alertNodes.add(oscillator);
  oscillator.onended = () => {
    alertNodes.delete(oscillator);
    oscillator.disconnect();
    envelope.disconnect();
  };
}

/** Immediately silences any radar alert tones that are playing or queued. */
export function stopAlerts(): void {
  alertNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      /* node already finished */
    }
  });
  alertNodes.clear();
}

function refreshVoices() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) voices = window.speechSynthesis.getVoices();
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  if (!voices.length) refreshVoices();
  return (
    voices.find((voice) => /en[-_]US/i.test(voice.lang) && /Google US English|Samantha|Microsoft (Aria|Jenny|Zira|David)/i.test(voice.name)) ??
    voices.find((voice) => /en[-_]US/i.test(voice.lang)) ??
    voices.find((voice) => /^en/i.test(voice.lang))
  );
}

/** Spoken callout (optional feature, silently skipped when speech synthesis is unavailable). */
export function speak(text: string, delay = 0): void {
  if (!soundOn || !unlocked || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const run = () => {
    if (!soundOn) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 1;
    utterance.pitch = 0.95;
    utterance.volume = 0.9;
    utteranceKeepAlive.push(utterance);
    if (utteranceKeepAlive.length > 3) utteranceKeepAlive.shift();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };
  if (delay > 0) {
    const id = window.setTimeout(() => {
      speechTimers.delete(id);
      run();
    }, delay * 1000);
    speechTimers.add(id);
  } else {
    run();
  }
}

export function stopSpeech(): void {
  speechTimers.forEach((id) => window.clearTimeout(id));
  speechTimers.clear();
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export const sfx = {
  /** Hardware button tick on the radar detector. */
  click: () => tone(1900, 0, 0.035, { type: "triangle", gain: 0.1 }),
  mode: () => {
    tone(1500, 0, 0.04, { type: "square", gain: 0.08 });
    tone(1500, 0.075, 0.04, { type: "square", gain: 0.08 });
  },
  powerOn: () => [392, 523, 659, 784].forEach((frequency, index) => tone(frequency, index * 0.085, 0.16, { type: "square", gain: 0.09 })),
  powerOff: () => {
    tone(659, 0, 0.1, { type: "square", gain: 0.09 });
    tone(392, 0.12, 0.2, { type: "square", gain: 0.08 });
  },
  /** Soft touchscreen tap on the ELD. */
  tap: () => tone(640, 0, 0.05, { type: "sine", gain: 0.16, slideTo: 500 }),
  key: () => {
    tone(960, 0, 0.045, { type: "sine", gain: 0.14 });
    tone(1920, 0, 0.02, { type: "sine", gain: 0.04 });
  },
  toggle: (on: boolean) => {
    tone(on ? 660 : 520, 0, 0.05, { type: "sine", gain: 0.13 });
    tone(on ? 990 : 390, 0.06, 0.07, { type: "sine", gain: 0.12 });
  },
  check: (on: boolean) => tone(on ? 1240 : 620, 0, 0.055, { type: "triangle", gain: 0.12 }),
  confirm: () => {
    tone(880, 0, 0.09, { type: "sine", gain: 0.16 });
    tone(1320, 0.1, 0.24, { type: "sine", gain: 0.14 });
  },
  success: () => [523, 659, 784, 1047].forEach((frequency, index) => tone(frequency, index * 0.09, index === 3 ? 0.32 : 0.16, { type: "sine", gain: 0.16 })),
  error: () => {
    tone(200, 0, 0.14, { type: "sawtooth", gain: 0.12 });
    tone(165, 0.18, 0.22, { type: "sawtooth", gain: 0.12 });
  },
  warning: () =>
    [0, 0.19, 0.38].forEach((start) => {
      tone(740, start, 0.12, { type: "triangle", gain: 0.2 });
      tone(1480, start, 0.12, { type: "sine", gain: 0.05 });
    }),
  logout: () => {
    tone(784, 0, 0.1, { type: "sine", gain: 0.14 });
    tone(523, 0.12, 0.22, { type: "sine", gain: 0.12 });
  },
  launch: () => {
    tone(440, 0, 0.14, { type: "sine", gain: 0.1, slideTo: 880 });
    tone(880, 0.12, 0.2, { type: "sine", gain: 0.09, slideTo: 1320 });
  },
  /** Over-the-limit chirp from the detector's speed monitor. */
  limit: () => {
    tone(1320, 0, 0.07, { type: "square", gain: 0.1 });
    tone(1320, 0.11, 0.07, { type: "square", gain: 0.1 });
  },
  /** Route advisor chime (state line, weigh station, summit). */
  chime: () => {
    tone(1047, 0, 0.12, { type: "sine", gain: 0.14 });
    tone(1319, 0.13, 0.22, { type: "sine", gain: 0.12 });
  },
  /**
   * Band-specific detector alert. Beep rate rises with signal strength (1-7).
   * Returns the alert length in seconds so callers can time voice callouts.
   */
  radarAlert(band: AlertBand, strength: number): number {
    stopAlerts();
    const level = (Math.min(Math.max(strength, 1), 7) - 1) / 6;
    if (band === "LASER") {
      const step = 0.05;
      const pulses = 26;
      for (let i = 0; i < pulses; i += 1) {
        tone(i % 2 ? 1950 : 1480, i * step, step * 0.9, { type: "sawtooth", gain: 0.11, attack: 0.002, release: 0.008, alert: true });
      }
      return pulses * step;
    }
    const frequency = band === "X" ? 560 : band === "K" ? 840 : 1180;
    const spacing = (band === "X" ? 0.26 : band === "K" ? 0.2 : 0.15) * (1 - 0.5 * level);
    const pulses = Math.max(3, Math.round(1.3 / spacing));
    for (let i = 0; i < pulses; i += 1) {
      tone(frequency, i * spacing, spacing * 0.55, { gain: 0.15 + 0.04 * level, attack: 0.003, release: 0.012, alert: true });
      if (band === "KA") tone(frequency / 2, i * spacing, spacing * 0.55, { gain: 0.05, attack: 0.003, release: 0.012, alert: true });
    }
    return pulses * spacing;
  },
};
