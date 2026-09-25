import { Difficulty, CellData, GridData } from '../types/sudoku';

export function createEmptyMatrix(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function isSafe(grid: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
}

function shuffle<T>(array: T[], rng = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function solveBoard(grid: number[][], rng = Math.random): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
        for (const num of nums) {
          if (isSafe(grid, r, c, num)) {
            grid[r][c] = num;
            if (solveBoard(grid, rng)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function countSolutions(grid: number[][], limit = 2): number {
  let count = 0;
  const solve = (): void => {
    if (count >= limit) return;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(grid, r, c, num)) {
              grid[r][c] = num;
              solve();
              grid[r][c] = 0;
              if (count >= limit) return;
            }
          }
          return;
        }
      }
    }
    count++;
  };
  solve();
  return count;
}

export function generateLocalPuzzle(difficulty: Difficulty): {
  puzzle: number[][];
  solution: number[][];
} {
  const solution = createEmptyMatrix();

  // Fill diagonal boxes
  for (let b = 0; b < 9; b += 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        solution[b + r][b + c] = nums[idx++];
      }
    }
  }

  solveBoard(solution);

  const puzzle = solution.map((row) => [...row]);

  // Target clues by difficulty
  let targetClues = 38;
  if (difficulty === 'easy') targetClues = 40;
  else if (difficulty === 'medium') targetClues = 32;
  else if (difficulty === 'hard') targetClues = 28;
  else if (difficulty === 'expert') targetClues = 24;

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  let cluesRemaining = 81;
  for (const [r, c] of shuffledPositions) {
    if (cluesRemaining <= targetClues) break;
    const temp = puzzle[r][c];
    puzzle[r][c] = 0;

    const testCopy = puzzle.map((row) => [...row]);
    if (countSolutions(testCopy, 2) === 1) {
      cluesRemaining--;
    } else {
      puzzle[r][c] = temp;
    }
  }

  return { puzzle, solution };
}

export function convertMatrixToGridData(puzzle: number[][], solution: number[][]): GridData {
  return puzzle.map((row, r) =>
    row.map((val, c) => ({
      row: r,
      col: c,
      value: val,
      isInitial: val !== 0,
      notes: [],
      isError: false,
    })),
  );
}

export function checkBoardCompletion(grid: GridData, solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === 0 || grid[r][c].value !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}

export function getSmartHint(grid: GridData, solution: number[][]): {
  row: number;
  col: number;
  value: number;
  reason: string;
} | null {
  // Find empty cell
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === 0) {
        return {
          row: r,
          col: c,
          value: solution[r][c],
          reason: `By logical elimination, Row ${r + 1}, Column ${c + 1} is ${solution[r][c]}.`,
        };
      }
    }
  }
  return null;
}
