import { Difficulty } from '../types/sudoku';
import { generateLocalPuzzle } from '../utils/sudokuEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_STORAGE_KEY = '@sudoku_api_base_url';
export const DEFAULT_API_URL = 'https://h1ys7dt7ae.execute-api.us-east-1.amazonaws.com';

export async function getApiBaseUrl(): Promise<string> {
  try {
    const customUrl = await AsyncStorage.getItem(API_STORAGE_KEY);
    return customUrl || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export async function setApiBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_STORAGE_KEY, url);
}

export interface GeneratedPuzzleResponse {
  id: string;
  difficulty: Difficulty;
  puzzle: number[][];
  solution: number[][];
  initialClues: number;
}

export async function fetchPuzzle(difficulty: Difficulty): Promise<GeneratedPuzzleResponse> {
  const baseUrl = await getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/api/sudoku/generate?difficulty=${difficulty}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch {
    // Offline or server unreachable - seamlessly use client-side generator
  }

  // Fallback to local offline generation
  const local = generateLocalPuzzle(difficulty);
  return {
    id: `local-${Date.now()}`,
    difficulty,
    puzzle: local.puzzle,
    solution: local.solution,
    initialClues: local.puzzle.flat().filter((v) => v !== 0).length,
  };
}

export async function fetchDailyPuzzle(date?: string): Promise<{
  date: string;
  difficulty: Difficulty;
  puzzle: number[][];
  solution: number[][];
  initialClues: number;
}> {
  const baseUrl = await getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = date
      ? `${baseUrl}/api/sudoku/daily?date=${date}`
      : `${baseUrl}/api/sudoku/daily`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback to local
  }

  const todayStr = date || new Date().toISOString().split('T')[0];
  const local = generateLocalPuzzle('medium');
  return {
    date: todayStr,
    difficulty: 'medium',
    puzzle: local.puzzle,
    solution: local.solution,
    initialClues: local.puzzle.flat().filter((v) => v !== 0).length,
  };
}

export async function fetchRemoteHint(
  board: number[][],
  solution?: number[][],
): Promise<{ row: number; col: number; value: number; explanation: string } | null> {
  const baseUrl = await getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/sudoku/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, solution }),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback handled by caller
  }
  return null;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  userId: string;
  username: string;
  difficulty: string;
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  completedAt: string;
}

const USER_ID_KEY = '@sudoku_user_id';
const USERNAME_KEY = '@sudoku_username';

export async function getOrCreateUser(): Promise<{ userId: string; username: string }> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    let username = await AsyncStorage.getItem(USERNAME_KEY);

    if (!userId) {
      userId = 'u_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    if (!username) {
      username = 'Player #' + Math.floor(1000 + Math.random() * 9000);
      await AsyncStorage.setItem(USERNAME_KEY, username);
    }
    return { userId, username };
  } catch {
    return { userId: 'local_user', username: 'Player' };
  }
}

export async function setPlayerUsername(name: string): Promise<void> {
  await AsyncStorage.setItem(USERNAME_KEY, name.trim());
}

export async function submitScoreToLeaderboard(params: {
  difficulty: string;
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
}): Promise<boolean> {
  const baseUrl = await getApiBaseUrl();
  const user = await getOrCreateUser();

  try {
    const res = await fetch(`${baseUrl}/api/leaderboard/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,
        username: user.username,
        difficulty: params.difficulty,
        timeSeconds: params.timeSeconds,
        mistakes: params.mistakes,
        hintsUsed: params.hintsUsed,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLeaderboardScores(
  difficulty: string,
  limit = 25,
): Promise<LeaderboardEntry[]> {
  const baseUrl = await getApiBaseUrl();
  try {
    const res = await fetch(
      `${baseUrl}/api/leaderboard?difficulty=${encodeURIComponent(difficulty)}&limit=${limit}`,
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Return empty list if offline
  }
  return [];
}

export async function syncCloudProfile(data: {
  stats?: Record<string, any>;
  activeGame?: Record<string, any>;
}): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const user = await getOrCreateUser();

  try {
    await fetch(`${baseUrl}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,
        username: user.username,
        stats: data.stats,
        activeGame: data.activeGame,
      }),
    });
  } catch {
    // Offline sync will retry next time
  }
}

