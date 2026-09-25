import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../theme/colors';

interface KeypadProps {
  isNotesMode: boolean;
  canUndo: boolean;
  digitCounts: Record<number, number>; // How many of each digit are currently on the board
  colors: ThemeColors;
  onNumberPress: (num: number) => void;
  onUndo: () => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  isNotesMode,
  canUndo,
  digitCounts,
  colors,
  onNumberPress,
  onUndo,
  onErase,
  onToggleNotes,
  onHint,
}) => {
  return (
    <View style={styles.container}>
      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={onUndo}
          disabled={!canUndo}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-undo-outline"
            size={22}
            color={canUndo ? colors.textPrimary : colors.textMuted}
          />
          <Text
            style={[
              styles.actionLabel,
              { color: canUndo ? colors.textPrimary : colors.textMuted },
            ]}
          >
            Undo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={onErase}
          activeOpacity={0.7}
        >
          <Ionicons name="backspace-outline" size={22} color={colors.textPrimary} />
          <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
            Erase
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isNotesMode ? colors.buttonActive : colors.surface,
            },
          ]}
          onPress={onToggleNotes}
          activeOpacity={0.7}
        >
          <Ionicons
            name="pencil-outline"
            size={22}
            color={isNotesMode ? '#FFFFFF' : colors.textPrimary}
          />
          <View style={styles.notesLabelContainer}>
            <Text
              style={[
                styles.actionLabel,
                { color: isNotesMode ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              Notes
            </Text>
            <View
              style={[
                styles.notesIndicator,
                { backgroundColor: isNotesMode ? '#10B981' : colors.textMuted },
              ]}
            >
              <Text style={styles.notesIndicatorText}>
                {isNotesMode ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={onHint}
          activeOpacity={0.7}
        >
          <Ionicons name="bulb-outline" size={22} color={colors.warning} />
          <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
            Hint
          </Text>
        </TouchableOpacity>
      </View>

      {/* Number Buttons (1-9) */}
      <View style={styles.numberRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const placedCount = digitCounts[num] || 0;
          const isComplete = placedCount >= 9;
          const remaining = Math.max(0, 9 - placedCount);

          return (
            <TouchableOpacity
              key={`num-${num}`}
              style={[
                styles.numberButton,
                {
                  backgroundColor: isComplete ? colors.surfaceHighlight : colors.surface,
                  borderColor: colors.gridBorderThin,
                  opacity: isComplete ? 0.35 : 1,
                },
              ]}
              onPress={() => onNumberPress(num)}
              disabled={isComplete}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.numberText,
                  { color: isComplete ? colors.textMuted : colors.accent },
                ]}
              >
                {num}
              </Text>
              <Text style={[styles.countBadge, { color: colors.textMuted }]}>
                {remaining > 0 ? remaining : '✓'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  notesLabelContainer: {
    alignItems: 'center',
  },
  notesIndicator: {
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  notesIndicatorText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberButton: {
    flex: 1,
    height: 54,
    marginHorizontal: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  numberText: {
    fontSize: 22,
    fontWeight: '700',
  },
  countBadge: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: -2,
  },
});
