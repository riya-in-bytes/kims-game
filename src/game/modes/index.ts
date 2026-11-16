import type { ModeDefinition, ModeId } from '../types';
import { changedMode } from './changed';
import { missingMode } from './missing';
import { recallMode } from './recall';

export const MODES: readonly ModeDefinition[] = [recallMode, missingMode, changedMode];

export function getMode(id: string | undefined): ModeDefinition | undefined {
  return MODES.find((mode) => mode.id === id);
}

export function isModeId(id: string | undefined): id is ModeId {
  return getMode(id) !== undefined;
}
