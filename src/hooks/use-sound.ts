import { useCallback, useEffect, useState } from "react";

const MUTE_KEY = "ilearn-muted";

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.06) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

export type SoundKind = "click" | "success" | "notify";

export function useSound() {
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    try { setMuted(localStorage.getItem(MUTE_KEY) === "1"); } catch { /* ignore */ }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const play = useCallback((kind: SoundKind) => {
    if (muted) return;
    if (kind === "click") tone(720, 0.07, "triangle", 0.04);
    else if (kind === "notify") { tone(880, 0.12, "sine", 0.05); setTimeout(() => tone(1100, 0.14, "sine", 0.05), 90); }
    else if (kind === "success") {
      tone(660, 0.12, "triangle", 0.06);
      setTimeout(() => tone(880, 0.12, "triangle", 0.06), 110);
      setTimeout(() => tone(1175, 0.22, "triangle", 0.06), 220);
    }
  }, [muted]);

  return { muted, toggleMute, play };
}