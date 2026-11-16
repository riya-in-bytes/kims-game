import { useMemo, useReducer } from 'react';
import { configFor, type Difficulty } from './difficulty';
import { scoreRound } from './scoring';
import type { ItemPack, ModeDefinition, Rng, Round, RoundResult } from './types';

/** Rounds in a pass-and-play match; round n is played at level n. */
export const MATCH_ROUNDS = 5;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export type MatchPhase = 'handoff' | 'study' | 'hidden' | 'answer' | 'result' | 'final';

export interface Player {
  name: string;
  score: number;
  perfectRounds: number;
}

export interface MatchState {
  phase: MatchPhase;
  players: Player[];
  /** 0-based index of the current round. */
  roundIndex: number;
  /** Index of the player whose turn it is. */
  turn: number;
  /** Everyone plays the same tray within a round. */
  round: Round;
  selected: string[];
  result: RoundResult | null;
}

export type MatchAction =
  | { type: 'BEGIN_TURN' }
  | { type: 'HIDE' }
  | { type: 'REVEAL' }
  | { type: 'TOGGLE'; id: string }
  | { type: 'SUBMIT' }
  | { type: 'NEXT' }
  | { type: 'REMATCH' };

export function createMatchReducer(mode: ModeDefinition, pack: ItemPack, difficulty: Difficulty, rng: Rng) {
  const buildRound = (roundIndex: number) =>
    mode.buildRound(configFor(mode, roundIndex + 1, difficulty, pack), pack, rng);

  const init = (names: readonly string[]): MatchState => ({
    phase: 'handoff',
    players: names.map((name) => ({ name, score: 0, perfectRounds: 0 })),
    roundIndex: 0,
    turn: 0,
    round: buildRound(0),
    selected: [],
    result: null,
  });

  function reducer(state: MatchState, action: MatchAction): MatchState {
    switch (action.type) {
      case 'BEGIN_TURN':
        return state.phase === 'handoff' ? { ...state, phase: 'study', selected: [], result: null } : state;

      case 'HIDE':
        return state.phase === 'study' ? { ...state, phase: 'hidden' } : state;

      case 'REVEAL':
        return state.phase === 'hidden' ? { ...state, phase: 'answer' } : state;

      case 'TOGGLE': {
        if (state.phase !== 'answer') return state;
        if (state.selected.includes(action.id)) {
          return { ...state, selected: state.selected.filter((id) => id !== action.id) };
        }
        if (state.selected.length >= state.round.config.targetCount) return state;
        return { ...state, selected: [...state.selected, action.id] };
      }

      case 'SUBMIT': {
        if (state.phase !== 'answer') return state;
        const result = scoreRound(state.round, state.selected);
        const players = state.players.map((player, index) =>
          index === state.turn
            ? {
                ...player,
                score: player.score + result.points,
                perfectRounds: player.perfectRounds + (result.perfect ? 1 : 0),
              }
            : player,
        );
        return { ...state, phase: 'result', result, players };
      }

      case 'NEXT': {
        if (state.phase !== 'result') return state;
        const nextTurn = state.turn + 1;
        if (nextTurn < state.players.length) {
          return { ...state, phase: 'handoff', turn: nextTurn, selected: [], result: null };
        }
        const nextRound = state.roundIndex + 1;
        if (nextRound >= MATCH_ROUNDS) return { ...state, phase: 'final' };
        return {
          ...state,
          phase: 'handoff',
          roundIndex: nextRound,
          turn: 0,
          round: buildRound(nextRound),
          selected: [],
          result: null,
        };
      }

      case 'REMATCH':
        return init(state.players.map((player) => player.name));
    }
  }

  return { reducer, init };
}

export function useMatch(
  mode: ModeDefinition,
  pack: ItemPack,
  difficulty: Difficulty,
  names: readonly string[],
  rng: Rng = Math.random,
) {
  // The match is fixed once started; changing settings mid-match should not rebuild it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { reducer, init } = useMemo(() => createMatchReducer(mode, pack, difficulty, rng), []);
  return useReducer(reducer, names, init);
}

/** Players ordered by score, highest first; ties keep turn order. */
export function standings(players: readonly Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score);
}
