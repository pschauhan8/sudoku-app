import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { Header } from '../components/Header';
import { SudokuBoard } from '../components/SudokuBoard';
import { Keypad } from '../components/Keypad';
import { DifficultyModal } from '../components/DifficultyModal';
import { VictoryModal } from '../components/VictoryModal';
import { SettingsModal } from '../components/SettingsModal';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { Difficulty, GridData, MoveRecord, GameState, GameStatistics } from '../types/sudoku';
import { themes } from '../theme/colors';
import {
  saveActiveGame,
  loadActiveGame,
  clearActiveGame,
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
  UserSettings,
  defaultSettings,
  defaultStats,
  loadLastDifficulty,
  saveLastDifficulty,
} from '../utils/storage';
import {
  convertMatrixToGridData,
  checkBoardCompletion,
  getSmartHint,
} from '../utils/sudokuEngine';
import {
  fetchPuzzle,
  fetchDailyPuzzle,
  submitScoreToLeaderboard,
  syncCloudProfile,
} from '../services/api';
import { AdBanner } from '../components/AdBanner';
import { initializeAds, showRewardedAd, showInterstitialAd } from '../services/adService';

export const GameScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [stats, setStats] = useState<GameStatistics>(defaultStats);

  // Game state
  const [grid, setGrid] = useState<GridData>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isDaily, setIsDaily] = useState<boolean>(false);
  const [dailyDate, setDailyDate] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [maxMistakes] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Modals
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  const colors = settings.isDarkMode ? themes.dark : themes.light;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize: load settings, stats, and saved game or generate fresh
  useEffect(() => {
    async function init() {
      initializeAds().catch(() => {});
      const storedSettings = await loadSettings();
      setSettings(storedSettings);
      const storedStats = await loadStats();
      setStats(storedStats);

      const savedGame = await loadActiveGame();
      if (savedGame && !savedGame.isComplete && savedGame.grid?.length === 9) {
        setGrid(savedGame.grid);
        setSolution(savedGame.solution);
        setDifficulty(savedGame.difficulty);
        setIsDaily(savedGame.isDaily || false);
        setDailyDate(savedGame.dailyDate || '');
        setTimerSeconds(savedGame.timerSeconds || 0);
        setMistakes(savedGame.mistakes || 0);
        setHistory(savedGame.history || []);
        setHintsUsed(savedGame.hintsUsed || 0);
        setLoading(false);
      } else {
        const initialDiff = await loadLastDifficulty();
        await startNewGame(initialDiff, false);
      }
    }
    init();
  }, []);

  // Timer interval
  useEffect(() => {
    if (!loading && !isPaused && !isComplete) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isPaused, isComplete]);

  // Persist game state on changes
  useEffect(() => {
    if (!loading && grid.length === 9 && solution.length === 9) {
      const stateToSave: GameState = {
        grid,
        solution,
        difficulty,
        isDaily,
        dailyDate,
        timerSeconds,
        mistakes,
        maxMistakes,
        isPaused,
        isComplete,
        history,
        future: [],
        hintsUsed,
      };
      saveActiveGame(stateToSave);
    }
  }, [grid, timerSeconds, mistakes, history, isComplete, isPaused]);

  // Start fresh game
  const startNewGame = async (diff: Difficulty, daily = false) => {
    setLoading(true);
    setShowDifficultyModal(false);
    setShowVictoryModal(false);
    setSelectedCell(null);
    setHistory([]);
    setMistakes(0);
    setTimerSeconds(0);
    setIsPaused(false);
    setIsComplete(false);
    setHintsUsed(0);
    setDifficulty(diff);
    setIsDaily(daily);

    if (!daily) {
      saveLastDifficulty(diff).catch(() => {});
    }

    try {
      if (daily) {
        const dailyData = await fetchDailyPuzzle();
        setDailyDate(dailyData.date);
        setSolution(dailyData.solution);
        setGrid(convertMatrixToGridData(dailyData.puzzle, dailyData.solution));
      } else {
        const puzzleData = await fetchPuzzle(diff);
        setSolution(puzzleData.solution);
        setGrid(convertMatrixToGridData(puzzleData.puzzle, puzzleData.solution));
      }
    } catch {
      Alert.alert('Error', 'Failed to generate new game. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Restart current board from initial clues
  const restartCurrentGame = () => {
    if (grid.length !== 9) return;
    const resetGrid: GridData = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        value: cell.isInitial ? cell.value : 0,
        notes: [],
        isError: false,
      })),
    );
    setGrid(resetGrid);
    setTimerSeconds(0);
    setMistakes(0);
    setHistory([]);
    setSelectedCell(null);
    setIsPaused(false);
    setIsComplete(false);
  };

  // Handle cell selection
  const handleSelectCell = (row: number, col: number) => {
    if (isPaused) {
      setIsPaused(false);
      return;
    }
    setSelectedCell([row, col]);
  };

  // Handle number input (1-9)
  const handleNumberPress = (num: number) => {
    if (!selectedCell || isPaused || isComplete) return;
    const [r, c] = selectedCell;
    const targetCell = grid[r][c];

    // Cannot edit initial clues
    if (targetCell.isInitial) return;

    if (isNotesMode) {
      // Toggle note
      const currentNotes = [...targetCell.notes];
      const noteIdx = currentNotes.indexOf(num);
      if (noteIdx > -1) {
        currentNotes.splice(noteIdx, 1);
      } else {
        currentNotes.push(num);
        currentNotes.sort((a, b) => a - b);
      }

      const prevNotes = [...targetCell.notes];
      const newGrid = grid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return { ...cell, notes: currentNotes };
          }
          return cell;
        }),
      );

      setHistory((prev) => [
        ...prev,
        {
          row: r,
          col: c,
          prevValue: targetCell.value,
          newValue: targetCell.value,
          prevNotes,
          newNotes: currentNotes,
        },
      ]);
      setGrid(newGrid);
    } else {
      // Place number
      const isCorrect = num === solution[r][c];
      const prevValue = targetCell.value;
      const prevNotes = [...targetCell.notes];

      let newMistakes = mistakes;
      if (!isCorrect && settings.autoCheckMistakes) {
        newMistakes = mistakes + 1;
        setMistakes(newMistakes);

        if (maxMistakes > 0 && newMistakes >= maxMistakes) {
          Alert.alert(
            'Game Over',
            `You made ${maxMistakes} mistakes! Watch a sponsor video to erase a mistake and continue, or restart.`,
            [
              {
                text: 'Watch Video to Revive',
                onPress: () => {
                  showRewardedAd(() => {
                    setMistakes(maxMistakes - 1);
                  });
                },
              },
              { text: 'Restart Board', onPress: restartCurrentGame },
              { text: 'New Game', onPress: () => setShowDifficultyModal(true) },
            ],
          );
        }
      }

      const newGrid = grid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return {
              ...cell,
              value: num,
              notes: [],
              isError: settings.autoCheckMistakes && !isCorrect,
            };
          }
          // Remove this number from notes in same row, column, and 3x3 block
          if (
            isCorrect &&
            cell.notes.includes(num) &&
            (rowIdx === r ||
              colIdx === c ||
              (Math.floor(rowIdx / 3) === Math.floor(r / 3) &&
                Math.floor(colIdx / 3) === Math.floor(c / 3)))
          ) {
            return {
              ...cell,
              notes: cell.notes.filter((n) => n !== num),
            };
          }
          return cell;
        }),
      );

      setHistory((prev) => [
        ...prev,
        {
          row: r,
          col: c,
          prevValue,
          newValue: num,
          prevNotes,
          newNotes: [],
        },
      ]);
      setGrid(newGrid);

      // Check win condition
      if (checkBoardCompletion(newGrid, solution)) {
        setIsComplete(true);
        handleWin();
      }
    }
  };

  // Handle victory completion
  const handleWin = async () => {
    setShowVictoryModal(true);
    await clearActiveGame();
    showInterstitialAd();

    // Update stats
    const currentBest = stats.bestTimeByDifficulty[difficulty] || 0;
    const newBest = currentBest === 0 || timerSeconds < currentBest ? timerSeconds : currentBest;

    const newStats: GameStatistics = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: stats.gamesWon + 1,
      currentStreak: stats.currentStreak + 1,
      bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1),
      bestTimeByDifficulty: {
        ...stats.bestTimeByDifficulty,
        [difficulty]: newBest,
      },
    };
    setStats(newStats);
    await saveStats(newStats);

    // Sync stats and submit completion score to live DynamoDB
    submitScoreToLeaderboard({
      difficulty,
      timeSeconds: timerSeconds,
      mistakes,
      hintsUsed,
    }).catch(() => {});

    syncCloudProfile({ stats: newStats }).catch(() => {});
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0 || isPaused || isComplete) return;
    const lastMove = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    const newGrid = grid.map((row, r) =>
      row.map((cell, c) => {
        if (r === lastMove.row && c === lastMove.col) {
          const isCorrect = lastMove.prevValue === solution[r][c];
          return {
            ...cell,
            value: lastMove.prevValue,
            notes: lastMove.prevNotes,
            isError:
              lastMove.prevValue > 0 && settings.autoCheckMistakes && !isCorrect,
          };
        }
        return cell;
      }),
    );

    setGrid(newGrid);
    setHistory(newHistory);
    setSelectedCell([lastMove.row, lastMove.col]);
  };

  // Erase selected cell
  const handleErase = () => {
    if (!selectedCell || isPaused || isComplete) return;
    const [r, c] = selectedCell;
    const targetCell = grid[r][c];
    if (targetCell.isInitial) return;

    if (targetCell.value === 0 && targetCell.notes.length === 0) return;

    const prevValue = targetCell.value;
    const prevNotes = [...targetCell.notes];

    const newGrid = grid.map((row, rowIdx) =>
      row.map((cell, colIdx) => {
        if (rowIdx === r && colIdx === c) {
          return {
            ...cell,
            value: 0,
            notes: [],
            isError: false,
          };
        }
        return cell;
      }),
    );

    setHistory((prev) => [
      ...prev,
      {
        row: r,
        col: c,
        prevValue,
        newValue: 0,
        prevNotes,
        newNotes: [],
      },
    ]);
    setGrid(newGrid);
  };

  // Hint application helper
  const applySmartHint = (targetRow: number, targetCol: number) => {
    const correctVal = solution[targetRow][targetCol];
    const newGrid = grid.map((row, r) =>
      row.map((cell, c) => {
        if (r === targetRow && c === targetCol) {
          return {
            ...cell,
            value: correctVal,
            notes: [],
            isError: false,
          };
        }
        return cell;
      }),
    );

    setSelectedCell([targetRow, targetCol]);
    setGrid(newGrid);
    setHintsUsed((prev) => prev + 1);

    if (checkBoardCompletion(newGrid, solution)) {
      setIsComplete(true);
      handleWin();
    }
  };

  // Hint logic with Rewarded Ads after 3 free hints
  const handleHint = () => {
    if (isPaused || isComplete) return;

    // If a cell is currently selected and empty, reveal it!
    let targetRow = -1;
    let targetCol = -1;

    if (selectedCell && grid[selectedCell[0]][selectedCell[1]].value === 0) {
      targetRow = selectedCell[0];
      targetCol = selectedCell[1];
    } else {
      const hint = getSmartHint(grid, solution);
      if (hint) {
        targetRow = hint.row;
        targetCol = hint.col;
      }
    }

    if (targetRow === -1 || targetCol === -1) {
      Alert.alert('No empty cell', 'The board is already filled or no hint needed.');
      return;
    }

    // First 3 hints per puzzle are free. Further hints unlock via rewarded ad.
    if (hintsUsed >= 3) {
      Alert.alert(
        'Out of Free Hints',
        'You have used all 3 free hints! Watch a short sponsor video to unlock an extra hint?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Watch Video (+1 Hint)',
            onPress: () => {
              showRewardedAd(() => {
                applySmartHint(targetRow, targetCol);
              });
            },
          },
        ],
      );
      return;
    }

    applySmartHint(targetRow, targetCol);
  };

  // Count placed instances of each digit (1-9)
  const digitCounts: Record<number, number> = {};
  for (let num = 1; num <= 9; num++) digitCounts[num] = 0;
  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value >= 1 && cell.value <= 9 && !cell.isError) {
        digitCounts[cell.value] = (digitCounts[cell.value] || 0) + 1;
      }
    });
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
          Generating Sudoku Masterpiece...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={settings.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />

      <Header
        difficulty={difficulty}
        isDaily={isDaily}
        timerSeconds={timerSeconds}
        mistakes={mistakes}
        maxMistakes={maxMistakes}
        isPaused={isPaused}
        colors={colors}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onOpenSettings={() => {
          setIsPaused(true);
          setShowSettingsModal(true);
        }}
        onOpenDifficultySelect={() => {
          setIsPaused(true);
          setShowDifficultyModal(true);
        }}
        onOpenLeaderboard={() => {
          setIsPaused(true);
          setShowLeaderboardModal(true);
        }}
      />

      <SudokuBoard
        grid={grid}
        selectedCell={selectedCell}
        highlightMatchingNumbers={settings.highlightMatchingNumbers}
        highlightRowColBlock={settings.highlightRowColBlock}
        isPaused={isPaused}
        colors={colors}
        onSelectCell={handleSelectCell}
        onResume={() => setIsPaused(false)}
      />

      <Keypad
        isNotesMode={isNotesMode}
        canUndo={history.length > 0}
        digitCounts={digitCounts}
        colors={colors}
        onNumberPress={handleNumberPress}
        onUndo={handleUndo}
        onErase={handleErase}
        onToggleNotes={() => setIsNotesMode((prev) => !prev)}
        onHint={handleHint}
      />

      {/* Google AdMob Banner Ad */}
      <AdBanner colors={colors} />

      {/* Modals */}
      <LeaderboardModal
        visible={showLeaderboardModal}
        colors={colors}
        onClose={() => {
          setShowLeaderboardModal(false);
          setIsPaused(false);
        }}
      />

      <DifficultyModal
        visible={showDifficultyModal}
        currentDifficulty={difficulty}
        colors={colors}
        onClose={() => {
          setShowDifficultyModal(false);
          setIsPaused(false);
        }}
        onSelect={(diff, daily) => startNewGame(diff, daily)}
      />

      <VictoryModal
        visible={showVictoryModal}
        difficulty={difficulty}
        timeSeconds={timerSeconds}
        bestTimeSeconds={stats.bestTimeByDifficulty[difficulty] || 0}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
        colors={colors}
        onPlayAgain={() => setShowDifficultyModal(true)}
        onReviewBoard={() => setShowVictoryModal(false)}
      />

      <SettingsModal
        visible={showSettingsModal}
        settings={settings}
        colors={colors}
        onClose={() => {
          setShowSettingsModal(false);
          setIsPaused(false);
        }}
        onUpdateSettings={async (newSet) => {
          const updated = { ...settings, ...newSet };
          setSettings(updated);
          await saveSettings(updated);
        }}
        onResetGame={restartCurrentGame}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 36) : 0,
    paddingBottom: Platform.OS === 'android' ? 12 : 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 36) : 0,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});
