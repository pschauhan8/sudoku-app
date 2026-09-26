import { Platform, Alert } from 'react-native';
import { getBannerAdUnitId, getRewardedAdUnitId, getInterstitialAdUnitId, AD_CONFIG } from './adConfig';

let mobileAdsInstance: any = null;
export let NativeBannerAd: any = null;
export let NativeBannerAdSize: any = null;
let RewardedAdClass: any = null;
let RewardedAdEventTypeEnum: any = null;
let InterstitialAdClass: any = null;
let AdEventTypeEnum: any = null;

let isNativeAdMobSupported = false;

// Attempt to load native module safely without breaking Expo Go or Web
if (Platform.OS !== 'web') {
  try {
    const gma = require('react-native-google-mobile-ads');
    mobileAdsInstance = gma.default || gma;
    NativeBannerAd = gma.BannerAd;
    NativeBannerAdSize = gma.BannerAdSize;
    RewardedAdClass = gma.RewardedAd;
    RewardedAdEventTypeEnum = gma.RewardedAdEventType;
    InterstitialAdClass = gma.InterstitialAd;
    AdEventTypeEnum = gma.AdEventType;

    // Test initialization check
    if (mobileAdsInstance && typeof mobileAdsInstance === 'function') {
      isNativeAdMobSupported = true;
    }
  } catch (e: any) {
    // Expected in Expo Go or untracked runtimes - gracefully fallback
    console.log('[AdMob] Running in Expo Go / Dev client without native GMA. Mock ads activated.', e?.message);
    isNativeAdMobSupported = false;
  }
}

export const isAdMobAvailable = (): boolean => isNativeAdMobSupported;

/**
 * Initialize Google Mobile Ads SDK
 */
let isInitialized = false;
export const initializeAds = async (): Promise<void> => {
  if (isInitialized) return;

  if (isNativeAdMobSupported && mobileAdsInstance) {
    try {
      await mobileAdsInstance().initialize();
      isInitialized = true;
      console.log('[AdMob] Google Mobile Ads initialized successfully for Play Store production.');
    } catch (err) {
      console.warn('[AdMob] Initialization failed:', err);
    }
  } else {
    isInitialized = true;
    console.log('[AdMob] Mock Ad service initialized (Expo Go / Web preview mode).');
  }
};

/**
 * Show a Rewarded Video Ad to earn rewards (e.g. Free Hints, Revive Mistakes)
 */
export const showRewardedAd = (
  onRewardEarned: () => void,
  onAdClosed?: () => void,
  onError?: (err: string) => void,
): void => {
  if (isNativeAdMobSupported && RewardedAdClass && RewardedAdEventTypeEnum) {
    try {
      const rewarded = RewardedAdClass.createForAdRequest(getRewardedAdUnitId(), {
        requestNonPersonalizedAdsOnly: false,
      });

      let earned = false;

      const unsubscribeLoaded = rewarded.addAdEventListener(
        RewardedAdEventTypeEnum.LOADED,
        () => {
          rewarded.show().catch((err: any) => {
            console.warn('[AdMob] Error showing rewarded ad:', err);
            onError?.(err?.message || 'Could not display ad');
          });
        },
      );

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventTypeEnum.EARNED_REWARD,
        () => {
          earned = true;
          onRewardEarned();
        },
      );

      const unsubscribeClosed = rewarded.addAdEventListener(
        (AdEventTypeEnum && AdEventTypeEnum.CLOSED) || 'closed',
        () => {
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();
          onAdClosed?.();
        },
      );

      const unsubscribeError = rewarded.addAdEventListener(
        (AdEventTypeEnum && AdEventTypeEnum.ERROR) || 'error',
        (error: any) => {
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();
          unsubscribeError();
          console.warn('[AdMob] Rewarded ad error:', error);
          // Fallback reward so user doesn't get blocked
          onRewardEarned();
        },
      );

      rewarded.load();
      return;
    } catch (err: any) {
      console.warn('[AdMob] Rewarded ad exception, using fallback:', err);
    }
  }

  // Graceful Fallback for Expo Go / Web / Simulator
  Alert.alert(
    'Watch Sponsor Ad',
    'Simulating 5-second rewarded video ad for a free hint...',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => onAdClosed?.(),
      },
      {
        text: 'Claim Free Hint (Simulate)',
        onPress: () => {
          onRewardEarned();
          onAdClosed?.();
        },
      },
    ],
  );
};

/**
 * Show an Interstitial Ad (e.g. after winning a game or starting new puzzle)
 */
let lastInterstitialTime = 0;
const INTERSTITIAL_COOLDOWN_MS = 60000; // Max 1 interstitial per 60s to maintain great UX

export const showInterstitialAd = (onDone?: () => void): void => {
  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
    onDone?.();
    return;
  }

  if (isNativeAdMobSupported && InterstitialAdClass && AdEventTypeEnum) {
    try {
      const interstitial = InterstitialAdClass.createForAdRequest(getInterstitialAdUnitId(), {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubscribeLoaded = interstitial.addAdEventListener(
        AdEventTypeEnum.LOADED,
        () => {
          lastInterstitialTime = Date.now();
          interstitial.show().catch(() => onDone?.());
        },
      );

      const unsubscribeClosed = interstitial.addAdEventListener(
        AdEventTypeEnum.CLOSED,
        () => {
          unsubscribeLoaded();
          unsubscribeClosed();
          onDone?.();
        },
      );

      const unsubscribeError = interstitial.addAdEventListener(
        AdEventTypeEnum.ERROR,
        () => {
          unsubscribeLoaded();
          unsubscribeClosed();
          onDone?.();
        },
      );

      interstitial.load();
      return;
    } catch (err) {
      console.warn('[AdMob] Interstitial error:', err);
    }
  }

  onDone?.();
};
