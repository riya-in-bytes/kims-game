import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from '@/game/difficulty';

const KEY = 'kims-game:settings:v1';

export interface Settings {
  haptics: boolean;
  sound: boolean;
  difficulty: Difficulty;
}

export const DEFAULT_SETTINGS: Settings = {
  haptics: true,
  sound: true,
  difficulty: 'normal',
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // A failed save only loses the preference; the app keeps working.
  }
}
