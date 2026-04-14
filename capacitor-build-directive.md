# Neon Ticketing: Capacitor Mobile Build

## Architecture Strategy (Hybrid Web App)
We are using Capacitor to wrap our Next.js web application into native iOS and Android apps.
- **Do not** build a separate React Native codebase. 
- The Capacitor app will serve the Next.js `/scanner` route.

## Required Capacitor Plugins
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`
- `@capacitor/camera` (Crucial for QR scanning)

## Native Camera Permissions (CRITICAL)
When configuring the native projects, you must write the native permission requests:
1. **iOS (`ios/App/App/Info.plist`):** Add `NSCameraUsageDescription` with the text: "Camera access is required to scan event QR tickets."
2. **Android (`android/app/src/main/AndroidManifest.xml`):** Add `<uses-permission android:name="android.permission.CAMERA" />`.

## Scanner UI Constraints
- The UI on the `/scanner` route must be strictly mobile-first.
- Prevent the screen from going to sleep while the scanner component is active.
- Use a robust QR scanning library compatible with Next.js and mobile browsers (e.g., `html5-qrcode` or `@yudiel/react-qr-scanner`).
- Provide huge, color-coded visual feedback (Full screen GREEN for valid, RED for invalid) because staff will be looking at screens quickly in dark environments.