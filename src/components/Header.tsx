import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Difficulty } from '../types/sudoku';
import { ThemeColors } from '../theme/colors';

interface HeaderProps {
  difficulty: Difficulty;
  isDaily: boolean;
  timerSeconds: number;
  mistakes: number;
  maxMistakes: number;
  isPaused: boolean;
  colors: ThemeColors;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onOpenDifficultySelect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  isDaily,
  timerSeconds,
  mistakes,
  maxMistakes,
  isPaused,
  colors,
  onTogglePause,
  onOpenSettings,
  onOpenDifficultySelect,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyColors: Record<Difficulty, string> = {
    easy: '#10B981',
    medium: '#3B82F6',
    hard: '#F59E0B',
    expert: '#EF4444',
  };

  return (
    <View style={styles.container}>
      {/* Top Bar: Title & Action Icons */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[styles.difficultyBadge, { borderColor: difficultyColors[difficulty] }]}
          onPress={onOpenDifficultySelect}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.difficultyText, { color: difficultyColors[difficulty] }]}
          >
            {isDaily ? 'DAILY CHALLENGE' : difficulty.toUpperCase()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={difficultyColors[difficulty]}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={onTogglePause}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={18}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface, marginLeft: 10 }]}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Row: Mistakes & Timer */}
      <View style={styles.infoRow}>
        <View style={styles.mistakesContainer}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Mistakes: </Text>
          <Text
            style={[
              styles.infoValue,
              { color: mistakes > 0 ? colors.errorNumber : colors.textPrimary },
            ]}
          >
            {mistakes}
            {maxMistakes > 0 ? `/${maxMistakes}` : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.timerContainer}
          onPress={onTogglePause}
          activeOpacity={0.8}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={isPaused ? colors.warning : colors.accent}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.timerText,
              { color: isPaused ? colors.warning : colors.textPrimary },
            ]}
          >
            {formatTime(timerSeconds)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mistakesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
