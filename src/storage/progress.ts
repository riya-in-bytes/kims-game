import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from '@/game/difficulty';
import type { ModeId, RoundResult } from '@/game/types';

const KEY_V1 = 'kims-game:progress:v1';
const KEY = 'kims-game:progress:v2';

export interface ModeProgress {
  bestScore: number;
  bestLevel: number;
  gamesPlayed: number;
  roundsPlayed: number;
  perfectRounds: number;
  /** Correct picks across all rounds ("items remembered"). */
  itemsHit: number;
  /** Items the player was asked to find across all rounds. */
  itemsTargeted: number;
  falsePicks: number;
  /** Perfect rounds in a row, carried across games. */
  currentStreak: number;
  longestStreak: number;
}

export type DifficultyProgress = Partial<Record<ModeId, ModeProgress>>;
export type Progress = Partial<Record<Difficulty, DifficultyProgress>>;

export const EMPTY_PROGRESS: ModeProgress = {
  bestScore: 0,
  bestLevel: 0,
  gamesPlayed: 0,
  roundsPlayed: 0,
  perfectRounds: 0,
  itemsHit: 0,
  itemsTargeted: 0,
  falsePicks: 0,
  currentStreak: 0,
  longestStreak: 0,
};

/** Share of picks that were right, counting both misses and wrong picks against you. */
export function accuracy(progress: ModeProgress): number | null {
  const attempts = progress.itemsTargeted + progress.falsePicks;
  return attempts > 0 ? progress.itemsHit / attempts : null;
}

/** Folds one finished round into a mode's progress. Pure, so it is easy to test. */
export function applyRound(
  current: ModeProgress,
  round: { result: RoundResult; score: number; level: number; gameOver: boolean },
): ModeProgress {
  const { result } = round;
  const currentStreak = result.perfect ? current.currentStreak + 1 : 0;
  return {
    bestScore: Math.max(current.bestScore, round.score),
    bestLevel: Math.max(current.bestLevel, round.level),
    gamesPlayed: current.gamesPlayed + (round.gameOver ? 1 : 0),
    roundsPlayed: current.roundsPlayed + 1,
    perfectRounds: current.perfectRounds + (result.perfect ? 1 : 0),
    itemsHit: current.itemsHit + result.hits.length,
    itemsTargeted: current.itemsTargeted + result.hits.length + result.missed.length,
    falsePicks: current.falsePicks + result.falsePicks.length,
    currentStreak,
    longestStreak: Math.max(current.longestStreak, currentStreak),
  };
}

/** v1 stored one table of bests per mode; it becomes the Normal difficulty in v2. */
function migrateV1(raw: string): Progress {
  const v1 = JSON.parse(raw) as Partial<Record<ModeId, Partial<ModeProgress>>>;
  const normal: DifficultyProgress = {};
  for (const [mode, value] of Object.entries(v1) as [ModeId, Partial<ModeProgress>][]) {
    normal[mode] = { ...EMPTY_PROGRESS, ...value };
  }
  return { normal };
}

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Progress;
    const legacy = await AsyncStorage.getItem(KEY_V1);
    if (!legacy) return {};
    const migrated = migrateV1(legacy);
    await AsyncStorage.setItem(KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
}

export function progressFor(progress: Progress, difficulty: Difficulty, mode: ModeId): ModeProgress {
  return { ...EMPTY_PROGRESS, ...progress[difficulty]?.[mode] };
}

// Saves are chained so two quick rounds can never read-modify-write over each other.
let queue: Promise<unknown> = Promise.resolve();

export function recordRound(
  difficulty: Difficulty,
  mode: ModeId,
  round: { result: RoundResult; score: number; level: number; gameOver: boolean },
): Promise<Progress> {
  const task = queue.then(async () => {
    const progress = await loadProgress();
    const next: Progress = {
      ...progress,
      [difficulty]: {
        ...progress[difficulty],
        [mode]: applyRound(progressFor(progress, difficulty, mode), round),
      },
    };
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage failures should never break play; the in-memory value still returns.
    }
    return next;
  });
  queue = task.catch(() => {});
  return task;
}

export async function resetProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEY, KEY_V1]);
  } catch {
    // Nothing else to do; the next load will show whatever remains.
  }
}
