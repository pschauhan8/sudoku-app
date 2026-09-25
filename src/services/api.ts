import { Difficulty } from '../types/sudoku';
import { generateLocalPuzzle } from '../utils/sudokuEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_STORAGE_KEY = '@sudoku_api_base_url';
export const DEFAULT_API_URL = 'http://10.0.2.2:3000'; // Standard Android emulator localhost alias or AWS endpoint

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
