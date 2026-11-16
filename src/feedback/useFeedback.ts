import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { useSettings } from '@/settings/SettingsProvider';

const SOURCES = {
  tick: require('../../assets/sounds/tick.wav'),
  select: require('../../assets/sounds/select.wav'),
  success: require('../../assets/sounds/success.wav'),
  error: require('../../assets/sounds/error.wav'),
} as const;

type SoundName = keyof typeof SOURCES;

// One player per clip for the lifetime of the app; created lazily on first use.
let players: Record<SoundName, AudioPlayer> | null = null;

function getPlayers() {
  if (!players) {
    setAudioModeAsync({ interruptionMode: 'mixWithOthers', playsInSilentMode: false }).catch(() => {});
    players = {
      tick: createAudioPlayer(SOURCES.tick),
      select: createAudioPlayer(SOURCES.select),
      success: createAudioPlayer(SOURCES.success),
      error: createAudioPlayer(SOURCES.error),
    };
  }
  return players;
}

function play(name: SoundName) {
  try {
    const player = getPlayers()[name];
    player.seekTo(0);
    player.play();
  } catch {
    // Sound is decoration; never let it break the game.
  }
}

export interface Feedback {
  /** Button press. */
  tap: (strength?: 'light' | 'medium') => void;
  /** Choosing a tile. */
  select: () => void;
  /** Countdown tick near the end of the study phase. */
  tick: () => void;
  success: () => void;
  error: () => void;
}

/** Haptics and sound effects, respecting the player's settings. */
export function useFeedback(): Feedback {
  const { settings } = useSettings();
  const { haptics, sound } = settings;

  return useMemo<Feedback>(
    () => ({
      tap: (strength = 'light') => {
        if (haptics) {
          Haptics.impactAsync(
            strength === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
          );
        }
      },
      select: () => {
        if (haptics) Haptics.selectionAsync();
        if (sound) play('select');
      },
      tick: () => {
        if (sound) play('tick');
      },
      success: () => {
        if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (sound) play('success');
      },
      error: () => {
        if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (sound) play('error');
      },
    }),
    [haptics, sound],
  );
}
