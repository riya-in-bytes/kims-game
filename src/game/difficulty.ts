import { clamp } from './random';
import type { ItemPack, LevelConfig, ModeDefinition } from './types';

export type Difficulty = 'relaxed' | 'normal' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['relaxed', 'normal', 'hard'];

interface DifficultyTuning {
  label: string;
  description: string;
  studyMultiplier: number;
  distractorMultiplier: number;
  /** Levels earlier that tray shuffling kicks in. */
  shuffleEarlierBy: number;
}

export const DIFFICULTY_TUNING: Record<Difficulty, DifficultyTuning> = {
  relaxed: {
    label: 'Relaxed',
    description: 'More time to study, fewer decoys.',
    studyMultiplier: 1.5,
    distractorMultiplier: 0.6,
    shuffleEarlierBy: 0,
  },
  normal: {
    label: 'Normal',
    description: 'The standard game.',
    studyMultiplier: 1,
    distractorMultiplier: 1,
    shuffleEarlierBy: 0,
  },
  hard: {
    label: 'Hard',
    description: 'Less time, more decoys, earlier shuffling.',
    studyMultiplier: 0.7,
    distractorMultiplier: 1.4,
    shuffleEarlierBy: 2,
  },
};

/**
 * The level config a mode produces, adjusted for difficulty and capped so a
 * round never asks for more items than the pack holds.
 */
export function configFor(mode: ModeDefinition, level: number, difficulty: Difficulty, pack: ItemPack): LevelConfig {
  const base = mode.levelFor(level);
  const tuning = DIFFICULTY_TUNING[difficulty];
  // Shuffling is a function of level inside each mode; probe a higher level to bring it forward.
  const shuffleOnReveal =
    base.shuffleOnReveal || (tuning.shuffleEarlierBy > 0 && mode.levelFor(level + tuning.shuffleEarlierBy).shuffleOnReveal);
  // Room left in the pack after the board and any replacement items.
  const room = Math.max(0, pack.items.length - base.itemCount - base.targetCount);
  return {
    ...base,
    studyMs: Math.round(base.studyMs * tuning.studyMultiplier),
    distractorCount:
      base.distractorCount === 0 ? 0 : clamp(Math.round(base.distractorCount * tuning.distractorMultiplier), 1, room),
    shuffleOnReveal,
  };
}
