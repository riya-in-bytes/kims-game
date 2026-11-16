import { useMemo, useReducer } from 'react';
import { configFor, type Difficulty } from './difficulty';
import { STARTING_LIVES, scoreRound } from './scoring';
import type { ItemPack, ModeDefinition, Rng, Round, RoundResult } from './types';

export type GameStatus = 'intro' | 'study' | 'hidden' | 'answer' | 'result';

export interface GameState {
  status: GameStatus;
  level: number;
  score: number;
  lives: number;
  round: Round | null;
  selected: string[];
  result: RoundResult | null;
}

export type GameAction =
  | { type: 'START' }
  | { type: 'HIDE' }
  | { type: 'REVEAL' }
  | { type: 'TOGGLE'; id: string }
  | { type: 'SUBMIT' }
  | { type: 'NEXT' };

const initialState: GameState = {
  status: 'intro',
  level: 1,
  score: 0,
  lives: STARTING_LIVES,
  round: null,
  selected: [],
  result: null,
};

export function createGameReducer(mode: ModeDefinition, pack: ItemPack, difficulty: Difficulty, rng: Rng) {
  const newRound = (level: number): Round => mode.buildRound(configFor(mode, level, difficulty, pack), pack, rng);

  return function reducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'START':
        return { ...initialState, status: 'study', round: newRound(1) };

      case 'HIDE':
        return state.status === 'study' ? { ...state, status: 'hidden' } : state;

      case 'REVEAL':
        return state.status === 'hidden' ? { ...state, status: 'answer' } : state;

      case 'TOGGLE': {
        if (state.status !== 'answer' || !state.round) return state;
        if (state.selected.includes(action.id)) {
          return { ...state, selected: state.selected.filter((id) => id !== action.id) };
        }
        if (state.selected.length >= state.round.config.targetCount) return state;
        return { ...state, selected: [...state.selected, action.id] };
      }

      case 'SUBMIT': {
        if (state.status !== 'answer' || !state.round) return state;
        const result = scoreRound(state.round, state.selected);
        return {
          ...state,
          status: 'result',
          result,
          score: state.score + result.points,
          lives: result.perfect ? state.lives : state.lives - 1,
        };
      }

      case 'NEXT': {
        if (state.status !== 'result' || !state.result) return state;
        if (state.lives <= 0) return { ...initialState, status: 'study', round: newRound(1) };
        const level = state.result.perfect ? state.level + 1 : state.level;
        return { ...state, status: 'study', level, round: newRound(level), selected: [], result: null };
      }
    }
  };
}

export function useGame(mode: ModeDefinition, pack: ItemPack, difficulty: Difficulty, rng: Rng = Math.random) {
  const reducer = useMemo(() => createGameReducer(mode, pack, difficulty, rng), [mode, pack, difficulty, rng]);
  return useReducer(reducer, initialState);
}
