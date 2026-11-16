import type { ItemPack } from '../types';
import { emojiPack } from './emojiPack';

/** Registry of item packs. Add illustrated or photo packs here later. */
export const PACKS: Record<string, ItemPack> = {
  [emojiPack.id]: emojiPack,
};

export const DEFAULT_PACK = emojiPack;

export function getPack(id: string): ItemPack {
  return PACKS[id] ?? DEFAULT_PACK;
}
