import { clamp, sample, shuffle } from '../random';
import type { ModeDefinition } from '../types';

export const missingMode: ModeDefinition = {
  id: 'missing',
  title: "What's Missing?",
  tagline: 'Some objects vanish while the tray is covered. Spot which ones.',
  howToPlay:
    'Study the tray. While it is covered, one or more objects are taken away. Pick the objects that have gone from the choices below the tray. At higher levels the tray is also shuffled.',
  icon: '🫥',
  accent: '#22D3EE',
  prompts: {
    study: 'Study the tray',
    answer: 'What has been taken away?',
  },
  answerSource: 'choices',

  levelFor(level) {
    const itemCount = clamp(4 + level, 5, 20);
    const targetCount = clamp(1 + Math.floor((level - 1) / 3), 1, 4);
    return {
      level,
      itemCount,
      targetCount,
      distractorCount: clamp(3 + targetCount * 2, 5, 11),
      studyMs: clamp(Math.round(itemCount * (1300 - level * 25)), 4500, 24000),
      shuffleOnReveal: level >= 6,
      columns: itemCount > 12 ? 5 : 4,
    };
  },

  buildRound(config, pack, rng) {
    const pool = shuffle(pack.items, rng);
    const board = pool.slice(0, config.itemCount);
    const removed = sample(board, config.targetCount, rng);
    const removedIds = new Set(removed.map((item) => item.id));
    const remaining = board.filter((item) => !removedIds.has(item.id));
    const distractors = pool.slice(config.itemCount, config.itemCount + config.distractorCount);
    return {
      config,
      board,
      answerBoard: config.shuffleOnReveal ? shuffle(remaining, rng) : remaining,
      choices: shuffle([...removed, ...distractors], rng),
      targetIds: removed.map((item) => item.id),
    };
  },
};
