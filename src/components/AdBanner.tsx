import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { ThemeColors } from '../theme/colors';
import { isAdMobAvailable, NativeBannerAd, NativeBannerAdSize } from '../services/adService';
import { getBannerAdUnitId } from '../services/adConfig';

interface AdBannerProps {
  colors: ThemeColors;
}

export const AdBanner: React.FC<AdBannerProps> = ({ colors }) => {
  const [adFailed, setAdFailed] = useState(false);
  const isAvailable = isAdMobAvailable() && !adFailed;
  const unitId = getBannerAdUnitId();

  if (isAvailable && NativeBannerAd && NativeBannerAdSize) {
    return (
      <View style={[styles.container, { backgroundColor: colors.cardBackground, borderTopColor: colors.gridBorderThin }]}>
        <NativeBannerAd
          unitId={unitId}
          size={NativeBannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdFailedToLoad={(error: any) => {
            console.log('[AdMob] Banner failed to load, activating fallback banner:', error);
            setAdFailed(true);
          }}
        />
      </View>
    );
  }

  // Preview / Development Mode banner (Expo Go, Web, or offline preview)
  return (
    <View style={[styles.container, styles.placeholderContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.gridBorderThin }]}>
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <Text style={styles.badgeText}>Ad</Text>
      </View>
      <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
        Google AdMob • Monetization Ready
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
    paddingVertical: 4,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
