# Sudoku Master: Play Store Mobile App

Cross-platform Sudoku mobile application built with React Native and Expo, designed and optimized for Google Play Store release.

## ✨ Features

- **Google Play Store Ready**: Android package `com.pritam.sudokumaster`, adaptive icons, portrait lock, and EAS configuration.
- **Classic Gameplay**:
  - Responsive 9x9 grid with bold 3x3 block dividers.
  - Multi-tier highlighting: selected cell, crosshair row/col/block, matching numbers, and conflict errors.
  - 3x3 pencil marks (notes mode).
  - Multi-level Undo & Erase.
  - Smart hint system with logical deductions.
  - 3-mistakes rule (optional) with restart/game over dialogues.
  - Live timer with cheat-proof pause overlay.
- **Offline-First Resilience**: Full client-side puzzle generator and AsyncStorage local game session persistence.
- **Design**: Sleek Obsidian dark mode and crisp paper light mode.

---

## 📱 Running Locally

```bash
npm install
npx expo start
```
- Scan QR code using **Expo Go** on your Android device.
- Or press **`w`** to preview directly in your PC browser.

---

## 📦 Building for Google Play Store

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Build installable APK for device testing:
   ```bash
   eas build -p android --profile preview
   ```
4. Build signed Android App Bundle (`.aab`) for Google Play Store:
   ```bash
   eas build -p android --profile production
   ```
5. Upload `.aab` to [Google Play Console](https://play.google.com/console).
