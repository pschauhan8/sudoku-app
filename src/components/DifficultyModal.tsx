import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Difficulty } from '../types/sudoku';
import { ThemeColors } from '../theme/colors';

interface DifficultyModalProps {
  visible: boolean;
  currentDifficulty: Difficulty;
  colors: ThemeColors;
  onClose: () => void;
  onSelect: (difficulty: Difficulty, isDaily?: boolean) => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  visible,
  currentDifficulty,
  colors,
  onClose,
  onSelect,
}) => {
  const options: {
    diff: Difficulty;
    title: string;
    description: string;
    clues: string;
    color: string;
  }[] = [
    {
      diff: 'easy',
      title: 'Easy',
      description: 'Ideal for beginners and quick brain exercises',
      clues: '~40 clues',
      color: '#10B981',
    },
    {
      diff: 'medium',
      title: 'Medium',
      description: 'Balanced challenge requiring classic tactics',
      clues: '~32 clues',
      color: '#3B82F6',
    },
    {
      diff: 'hard',
      title: 'Hard',
      description: 'Requires candidate deductions and advanced logic',
      clues: '~28 clues',
      color: '#F59E0B',
    },
    {
      diff: 'expert',
      title: 'Expert',
      description: 'Extreme test for seasoned Sudoku masters',
      clues: '~24 clues',
      color: '#EF4444',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Select Difficulty
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Daily Challenge Option */}
          <TouchableOpacity
            style={[
              styles.dailyOption,
              {
                backgroundColor: colors.cardBackground,
                borderColor: '#8B5CF6',
              },
            ]}
            onPress={() => onSelect('medium', true)}
            activeOpacity={0.7}
          >
            <View style={[styles.dailyIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="calendar" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                Daily Challenge
              </Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                Unique shared puzzle for today with global streak
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.surfaceHighlight }]} />

          {/* Standard Difficulties */}
          {options.map((opt) => {
            const isSelected = currentDifficulty === opt.diff;
            return (
              <TouchableOpacity
                key={opt.diff}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: isSelected ? opt.color : colors.gridBorderThin,
                  },
                ]}
                onPress={() => onSelect(opt.diff, false)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.difficultyIndicator,
                    { backgroundColor: opt.color },
                  ]}
                />
                <View style={styles.optionContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                      {opt.title}
                    </Text>
                    <Text style={[styles.cluesTag, { color: colors.textMuted }]}>
                      {opt.clues}
                    </Text>
                  </View>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    {opt.description}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={opt.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  dailyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  dailyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 8,
  },
  difficultyIndicator: {
    width: 6,
    height: 36,
    borderRadius: 3,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cluesTag: {
    fontSize: 12,
    marginRight: 8,
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
