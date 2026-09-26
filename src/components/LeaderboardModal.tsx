import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Difficulty } from '../types/sudoku';
import { ThemeColors } from '../theme/colors';
import { fetchLeaderboardScores, LeaderboardEntry } from '../services/api';

interface LeaderboardModalProps {
  visible: boolean;
  colors: ThemeColors;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  visible,
  colors,
  onClose,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  const loadScores = async (diff: Difficulty) => {
    setLoading(true);
    try {
      const data = await fetchLeaderboardScores(diff);
      setScores(data);
    } catch {
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadScores(selectedDifficulty);
    }
  }, [visible, selectedDifficulty]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: '#F59E0B', text: '🏆' };
    if (rank === 2) return { bg: '#94A3B8', text: '🥈' };
    if (rank === 3) return { bg: '#B45309', text: '🥉' };
    return { bg: colors.surfaceHighlight, text: `#${rank}` };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="trophy" size={24} color="#F59E0B" style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Global Leaderboard
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Difficulty Tabs */}
          <View style={[styles.tabBar, { backgroundColor: colors.cardBackground }]}>
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff;
              return (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.tabButton,
                    isSelected && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => setSelectedDifficulty(diff)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Scores List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Fetching Top Players...
              </Text>
            </View>
          ) : scores.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="medal-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No Records Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Be the first player to complete a {selectedDifficulty} puzzle and claim rank #1!
              </Text>
            </View>
          ) : (
            <FlatList
              data={scores}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => {
                const badge = getRankBadge(item.rank);
                return (
                  <View
                    style={[
                      styles.scoreItem,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.gridBorderThin,
                      },
                    ]}
                  >
                    <View style={styles.rankCol}>
                      <View style={[styles.rankCircle, { backgroundColor: badge.bg }]}>
                        <Text style={styles.rankText}>{badge.text}</Text>
                      </View>
                    </View>

                    <View style={styles.playerCol}>
                      <Text style={[styles.playerName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.username}
                      </Text>
                      <Text style={[styles.playerSub, { color: colors.textMuted }]}>
                        {item.mistakes} mistakes • {item.hintsUsed} hints
                      </Text>
                    </View>

                    <View style={styles.timeCol}>
                      <Text style={[styles.timeText, { color: colors.accent }]}>
                        {formatTime(item.timeSeconds)}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* Refresh Button */}
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: colors.surfaceHighlight }]}
            onPress={() => loadScores(selectedDifficulty)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.refreshText, { color: colors.textPrimary }]}>
              Refresh Leaderboard
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
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    height: '82%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  rankCol: {
    marginRight: 12,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  playerCol: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  playerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  timeCol: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
