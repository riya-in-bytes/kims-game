import { clamp, sample, shuffle } from '../random';
import type { ModeDefinition } from '../types';

export const changedMode: ModeDefinition = {
  id: 'changed',
  title: 'What Changed?',
  tagline: 'Objects get swapped for new ones. Tap the impostors.',
  howToPlay:
    'Study the tray. While it is covered, some objects are swapped for ones that were never there. Tap the objects on the tray that are new. At higher levels the tray is also shuffled.',
  icon: '🔄',
  accent: '#F472B6',
  prompts: {
    study: 'Study the tray',
    answer: 'Tap the objects that are new',
  },
  answerSource: 'board',

  levelFor(level) {
    const itemCount = clamp(4 + level, 5, 20);
    const targetCount = clamp(1 + Math.floor((level - 1) / 3), 1, 4);
    return {
      level,
      itemCount,
      targetCount,
      distractorCount: 0,
      studyMs: clamp(Math.round(itemCount * (1300 - level * 25)), 4500, 24000),
      shuffleOnReveal: level >= 8,
      columns: itemCount > 12 ? 5 : 4,
    };
  },

  buildRound(config, pack, rng) {
    const pool = shuffle(pack.items, rng);
    const board = pool.slice(0, config.itemCount);
    const replacements = pool.slice(config.itemCount, config.itemCount + config.targetCount);
    const slots = sample(
      board.map((_, index) => index),
      config.targetCount,
      rng,
    );
    const swapped = board.map((item, index) => {
      const slot = slots.indexOf(index);
      return slot === -1 ? item : replacements[slot];
    });
    return {
      config,
      board,
      answerBoard: config.shuffleOnReveal ? shuffle(swapped, rng) : swapped,
      choices: [],
      targetIds: replacements.map((item) => item.id),
    };
  },
};
