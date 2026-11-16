import type { Round, RoundResult } from './types';

export const STARTING_LIVES = 3;

export function scoreRound(round: Round, selected: readonly string[]): RoundResult {
  const targets = new Set(round.targetIds);
  const picked = new Set(selected);
  const hits = selected.filter((id) => targets.has(id));
  const falsePicks = selected.filter((id) => !targets.has(id));
  const missed = round.targetIds.filter((id) => !picked.has(id));
  const perfect = hits.length === targets.size && falsePicks.length === 0;
  const { level } = round.config;
  const points = Math.max(
    0,
    hits.length * 10 * level + (perfect ? 50 * level : 0) - falsePicks.length * 5 * level,
  );
  return { hits, falsePicks, missed, perfect, points };
}
