export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CellData {
  row: number;
  col: number;
  value: number; // 0 for empty
  isInitial: boolean; // Initial clue cannot be modified
  notes: number[]; // Pencil marks (1-9)
  isError?: boolean;
}

export type GridData = CellData[][];

export interface MoveRecord {
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
  prevNotes: number[];
  newNotes: number[];
}

export interface GameState {
  grid: GridData;
  solution: number[][];
  difficulty: Difficulty;
  isDaily: boolean;
  dailyDate?: string;
  timerSeconds: number;
  mistakes: number;
  maxMistakes: number; // 3 or 0 (unlimited)
  isPaused: boolean;
  isComplete: boolean;
  history: MoveRecord[];
  future: MoveRecord[];
  hintsUsed: number;
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  bestTimeByDifficulty: Record<Difficulty, number>; // in seconds
  currentStreak: number;
  bestStreak: number;
}
