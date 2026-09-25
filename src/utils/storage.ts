import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, GameStatistics } from '../types/sudoku';

const ACTIVE_GAME_KEY = '@sudoku_active_game';
const STATS_KEY = '@sudoku_player_stats';
const SETTINGS_KEY = '@sudoku_player_settings';

export interface UserSettings {
  isDarkMode: boolean;
  highlightDuplicates: boolean;
  highlightMatchingNumbers: boolean;
  highlightRowColBlock: boolean;
  autoCheckMistakes: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const defaultSettings: UserSettings = {
  isDarkMode: true,
  highlightDuplicates: true,
  highlightMatchingNumbers: true,
  highlightRowColBlock: true,
  autoCheckMistakes: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const defaultStats: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTimeByDifficulty: {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  },
  currentStreak: 0,
  bestStreak: 0,
};

export async function saveActiveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save active game', err);
  }
}

export async function loadActiveGame(): Promise<GameState | null> {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_GAME_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function clearActiveGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_GAME_KEY);
  } catch (err) {
    console.error('Failed to clear active game', err);
  }
}

export async function saveStats(stats: GameStatistics): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save stats', err);
  }
}

export async function loadStats(): Promise<GameStatistics> {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    return data ? { ...defaultStats, ...JSON.parse(data) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export async function loadSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}
