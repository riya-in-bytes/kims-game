import { useEffect } from 'react';
import type { Round } from '@/game/types';
import { usePhaseTimer } from './usePhaseTimer';

/** How long the "tray covered" beat lasts between study and answer. */
export const COVER_MS = 900;

interface Options {
  status: string;
  round: Round | null;
  /** Study time is up (or skipped): cover the tray. */
  onHide: () => void;
  /** Cover animation finished: show the answer phase. */
  onReveal: () => void;
  onTick?: () => void;
}

/**
 * Drives the study → covered → answer phases shared by solo and pass-and-play.
 * The study countdown pauses when the app is backgrounded or the player pauses.
 */
export function useRoundTimers({ status, round, onHide, onReveal, onTick }: Options) {
  const studying = status === 'study' && round !== null;
  const timer = usePhaseTimer({
    phaseKey: studying ? round : null,
    durationMs: round?.config.studyMs ?? 0,
    onDone: onHide,
    onTick,
    pauseInBackground: true,
  });

  useEffect(() => {
    if (status !== 'hidden') return undefined;
    const timeout = setTimeout(onReveal, COVER_MS);
    return () => clearTimeout(timeout);
    // onReveal is a stable dispatch wrapper in callers; the beat restarts only on status change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return timer;
}
