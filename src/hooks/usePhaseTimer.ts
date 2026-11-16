import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export interface PhaseTimer {
  durationMs: number;
  /** Time left when the timer was last started or paused. */
  remainingMs: number;
  paused: boolean;
  pause: () => void;
  resume: () => void;
}

interface Options {
  /** Changes whenever a new phase begins; resets the timer. Null means no timer is running. */
  phaseKey: unknown;
  durationMs: number;
  onDone: () => void;
  /** Called once per second during the final `tickWindowMs`. */
  onTick?: () => void;
  tickWindowMs?: number;
  /** Pause automatically when the app leaves the foreground. */
  pauseInBackground?: boolean;
}

interface Snapshot {
  phaseKey: unknown;
  durationMs: number;
  remainingMs: number;
  paused: boolean;
}

/**
 * A countdown that can be paused and resumed. It is the single source of
 * truth for remaining time, so the on-screen bar and the timeout agree.
 */
export function usePhaseTimer({
  phaseKey,
  durationMs,
  onDone,
  onTick,
  tickWindowMs = 3000,
  pauseInBackground = false,
}: Options): PhaseTimer {
  const [snap, setSnap] = useState<Snapshot>({ phaseKey, durationMs, remainingMs: durationMs, paused: false });

  // A new phase starts a fresh countdown (state adjusted during render, not in an effect).
  let current = snap;
  if (snap.phaseKey !== phaseKey || snap.durationMs !== durationMs) {
    current = { phaseKey, durationMs, remainingMs: durationMs, paused: false };
    setSnap(current);
  }

  const startedAt = useRef(0);
  const onDoneRef = useRef(onDone);
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onDoneRef.current = onDone;
    onTickRef.current = onTick;
  });

  const active = phaseKey !== null && phaseKey !== undefined;
  const { remainingMs, paused } = current;

  // Schedule the finish and the final-seconds ticks whenever the countdown (re)starts.
  useEffect(() => {
    if (!active || paused) return undefined;
    startedAt.current = Date.now();
    const timeouts = [setTimeout(() => onDoneRef.current(), remainingMs)];
    for (let at = 1000; at <= tickWindowMs; at += 1000) {
      if (remainingMs - at > 0) timeouts.push(setTimeout(() => onTickRef.current?.(), remainingMs - at));
    }
    return () => timeouts.forEach(clearTimeout);
  }, [active, phaseKey, paused, remainingMs, tickWindowMs]);

  const pause = useCallback(() => {
    setSnap((s) => {
      if (s.paused || s.phaseKey === null || s.phaseKey === undefined) return s;
      const left = Math.max(0, s.remainingMs - (Date.now() - startedAt.current));
      return { ...s, paused: true, remainingMs: left };
    });
  }, []);

  const resume = useCallback(() => {
    setSnap((s) => (s.paused ? { ...s, paused: false } : s));
  }, []);

  useEffect(() => {
    if (!pauseInBackground) return undefined;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') pause();
    });
    return () => subscription.remove();
  }, [pauseInBackground, pause]);

  return { durationMs, remainingMs, paused, pause, resume };
}
