import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Difficulty } from '../types/sudoku';
import { ThemeColors } from '../theme/colors';

interface VictoryModalProps {
  visible: boolean;
  difficulty: Difficulty;
  timeSeconds: number;
  bestTimeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  colors: ThemeColors;
  onPlayAgain: () => void;
  onReviewBoard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  difficulty,
  timeSeconds,
  bestTimeSeconds,
  mistakes,
  hintsUsed,
  colors,
  onPlayAgain,
  onReviewBoard,
}) => {
  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isNewBest = bestTimeSeconds === 0 || timeSeconds < bestTimeSeconds;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          {/* Trophy Badge */}
          <View style={styles.trophyWrapper}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={54} color="#F59E0B" />
            </View>
            {isNewBest && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>NEW BEST!</Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Puzzle Solved!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Masterful deduction! You completed the {difficulty.toUpperCase()} puzzle.
          </Text>

          {/* Stats Summary Table */}
          <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatTime(timeSeconds)}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.surfaceHighlight }]} />

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Difficulty</Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {difficulty.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.surfaceHighlight }]} />

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Mistakes</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {mistakes}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.surfaceHighlight }]} />

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hints Used</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {hintsUsed}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={onPlayAgain}
            activeOpacity={0.8}
          >
            <Ionicons name="reload" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Play Another Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.gridBorderThin }]}
            onPress={onReviewBoard}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              Review Solved Board
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  trophyWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  trophyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  statsCard: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  statDivider: {
    height: 1,
    width: '100%',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
