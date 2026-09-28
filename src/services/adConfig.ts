import { Platform } from 'react-native';

/**
 * Google AdMob Ad Unit Configuration
 *
 * During development and testing, Google requires using official test ad unit IDs
 * to prevent accidental ad clicks and AdMob account suspension.
 *
 * Before releasing to Google Play Store:
 * 1. Create your app in https://admob.google.com
 * 2. Create Banner, Rewarded, and Interstitial ad units.
 * 3. Set IS_TEST_MODE to false and fill in your real unit IDs below.
 */

export const AD_CONFIG = {
  // Set to false for live Google Play Store monetization
  IS_TEST_MODE: false,

  // Test Ad Unit IDs provided by Google (Safe for testing on emulators and physical devices)
  TEST_IDS: {
    BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
    BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
    REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
    REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
    INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
    INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
  },

  // Production Ad Unit IDs (From your Google AdMob Dashboard)
  PRODUCTION_IDS: {
    BANNER_ANDROID: 'ca-app-pub-8647742552399514/2347018159',
    BANNER_IOS: 'ca-app-pub-8647742552399514/2347018159',
    REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917', // Test ID until rewarded unit created
    REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
    INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712', // Test ID until interstitial unit created
    INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
  },
};

export const getBannerAdUnitId = (): string => {
  if (AD_CONFIG.IS_TEST_MODE) {
    return Platform.OS === 'ios'
      ? AD_CONFIG.TEST_IDS.BANNER_IOS
      : AD_CONFIG.TEST_IDS.BANNER_ANDROID;
  }
  return Platform.OS === 'ios'
    ? AD_CONFIG.PRODUCTION_IDS.BANNER_IOS
    : AD_CONFIG.PRODUCTION_IDS.BANNER_ANDROID;
};

export const getRewardedAdUnitId = (): string => {
  if (AD_CONFIG.IS_TEST_MODE) {
    return Platform.OS === 'ios'
      ? AD_CONFIG.TEST_IDS.REWARDED_IOS
      : AD_CONFIG.TEST_IDS.REWARDED_ANDROID;
  }
  return Platform.OS === 'ios'
    ? AD_CONFIG.PRODUCTION_IDS.REWARDED_IOS
    : AD_CONFIG.PRODUCTION_IDS.REWARDED_ANDROID;
};

export const getInterstitialAdUnitId = (): string => {
  if (AD_CONFIG.IS_TEST_MODE) {
    return Platform.OS === 'ios'
      ? AD_CONFIG.TEST_IDS.INTERSTITIAL_IOS
      : AD_CONFIG.TEST_IDS.INTERSTITIAL_ANDROID;
  }
  return Platform.OS === 'ios'
    ? AD_CONFIG.PRODUCTION_IDS.INTERSTITIAL_IOS
    : AD_CONFIG.PRODUCTION_IDS.INTERSTITIAL_ANDROID;
};
