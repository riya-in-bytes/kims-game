import { clamp, shuffle } from '../random';
import type { ModeDefinition } from '../types';

export const recallMode: ModeDefinition = {
  id: 'recall',
  title: 'Total Recall',
  tagline: 'Memorise the tray, then pick out everything that was on it.',
  howToPlay:
    'A tray of objects appears for a few seconds. When it is covered, a larger tray of objects is shown. Pick out exactly the ones you saw.',
  icon: '🧠',
  accent: '#7C5CFF',
  prompts: {
    study: 'Memorise these objects',
    answer: 'Which objects were on the tray?',
  },
  answerSource: 'choices',

  levelFor(level) {
    const itemCount = clamp(3 + level, 4, 14);
    return {
      level,
      itemCount,
      targetCount: itemCount,
      distractorCount: itemCount,
      studyMs: clamp(Math.round(itemCount * (1450 - level * 35)), 4000, 20000),
      shuffleOnReveal: true,
      columns: itemCount > 8 ? 4 : 3,
    };
  },

  buildRound(config, pack, rng) {
    const pool = shuffle(pack.items, rng);
    const board = pool.slice(0, config.itemCount);
    const distractors = pool.slice(config.itemCount, config.itemCount + config.distractorCount);
    return {
      config,
      board,
      answerBoard: [],
      choices: shuffle([...board, ...distractors], rng),
      targetIds: board.map((item) => item.id),
    };
  },
};
