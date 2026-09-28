import { Alert } from 'react-native';

export const NativeBannerAd: any = null;
export const NativeBannerAdSize: any = null;

export const isAdMobAvailable = (): boolean => false;

export const initializeAds = async (): Promise<void> => {
  // Web preview mode - no native SDK needed
};

export const showRewardedAd = (
  onRewardEarned: () => void,
  onAdClosed?: () => void,
  onError?: (err: string) => void,
): void => {
  Alert.alert(
    'Watch Sponsor Ad',
    'Web Preview: Simulating rewarded video ad for a free hint...',
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

export const showInterstitialAd = (onDone?: () => void): void => {
  onDone?.();
};
