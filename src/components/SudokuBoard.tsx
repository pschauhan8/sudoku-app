import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GridData, CellData } from '../types/sudoku';
import { ThemeColors } from '../theme/colors';

interface SudokuBoardProps {
  grid: GridData;
  selectedCell: [number, number] | null;
  highlightMatchingNumbers: boolean;
  highlightRowColBlock: boolean;
  isPaused: boolean;
  colors: ThemeColors;
  onSelectCell: (row: number, col: number) => void;
  onResume: () => void;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  grid,
  selectedCell,
  highlightMatchingNumbers,
  highlightRowColBlock,
  isPaused,
  colors,
  onSelectCell,
  onResume,
}) => {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 24, 400);
  const cellSize = Math.floor(boardSize / 9);
  const actualBoardSize = cellSize * 9;

  const selectedValue =
    selectedCell && grid[selectedCell[0]][selectedCell[1]].value > 0
      ? grid[selectedCell[0]][selectedCell[1]].value
      : null;

  const renderCellContent = (cell: CellData) => {
    if (cell.value > 0) {
      const textColor = cell.isError
        ? colors.errorNumber
        : cell.isInitial
        ? colors.initialNumber
        : colors.userNumber;

      return (
        <Text
          style={[
            styles.cellText,
            {
              color: textColor,
              fontWeight: cell.isInitial ? '800' : '600',
              fontSize: cellSize * 0.55,
            },
          ]}
        >
          {cell.value}
        </Text>
      );
    }

    // Render 3x3 pencil notes if cell is empty
    if (cell.notes.length > 0) {
      return (
        <View style={styles.notesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <View key={num} style={styles.noteSlot}>
              {cell.notes.includes(num) ? (
                <Text style={[styles.noteText, { color: colors.noteText }]}>
                  {num}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.board,
          {
            width: actualBoardSize,
            height: actualBoardSize,
            borderColor: colors.gridBorderThick,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {grid.map((row, r) => (
          <View key={`row-${r}`} style={styles.row}>
            {row.map((cell, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;

              const isSameRowColBlock =
                selectedCell &&
                (selectedCell[0] === r ||
                  selectedCell[1] === c ||
                  (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                    Math.floor(selectedCell[1] / 3) === Math.floor(c / 3)));

              const isMatching =
                highlightMatchingNumbers &&
                selectedValue !== null &&
                cell.value === selectedValue;

              // Border thickness for 3x3 subgrids
              const borderRightWidth = c === 2 || c === 5 ? 2.5 : c === 8 ? 0 : 0.8;
              const borderBottomWidth = r === 2 || r === 5 ? 2.5 : r === 8 ? 0 : 0.8;

              let cellBg = colors.cardBackground;
              if (cell.isError) {
                cellBg = colors.errorCell;
              } else if (isSelected) {
                cellBg = colors.selectedCell;
              } else if (isMatching) {
                cellBg = colors.matchingCell;
              } else if (highlightRowColBlock && isSameRowColBlock) {
                cellBg = colors.highlightCell;
              }

              return (
                <TouchableOpacity
                  key={`cell-${r}-${c}`}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cellBg,
                      borderRightWidth,
                      borderBottomWidth,
                      borderRightColor:
                        c === 2 || c === 5 ? colors.gridBorderThick : colors.gridBorderThin,
                      borderBottomColor:
                        r === 2 || r === 5 ? colors.gridBorderThick : colors.gridBorderThin,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => onSelectCell(r, c)}
                >
                  {renderCellContent(cell)}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Paused Overlay */}
        {isPaused && (
          <TouchableOpacity
            style={[styles.pausedOverlay, { backgroundColor: colors.background + 'EE' }]}
            activeOpacity={0.9}
            onPress={onResume}
          >
            <View style={[styles.pausedCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="play-circle" size={48} color={colors.accent} />
              <Text style={[styles.pausedTitle, { color: colors.textPrimary }]}>
                Game Paused
              </Text>
              <Text style={[styles.pausedSubtitle, { color: colors.textSecondary }]}>
                Tap anywhere to resume
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  board: {
    borderWidth: 2.5,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontFamily: 'System',
    textAlign: 'center',
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 2,
  },
  noteSlot: {
    width: '33.33%',
    height: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    fontSize: 9,
    fontWeight: '700',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pausedCard: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  pausedTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  pausedSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
