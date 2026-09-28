import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemeColors } from '../theme/colors';

interface AdBannerProps {
  colors: ThemeColors;
}

export const AdBanner: React.FC<AdBannerProps> = ({ colors }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.gridBorderThin,
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <Text style={styles.badgeText}>Ad</Text>
      </View>
      <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
        Google AdMob • Active on Android Device / Play Store
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
    paddingVertical: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
