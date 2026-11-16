import type { Rng } from './types';

export function shuffle<T>(input: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function sample<T>(input: readonly T[], count: number, rng: Rng = Math.random): T[] {
  return shuffle(input, rng).slice(0, count);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
