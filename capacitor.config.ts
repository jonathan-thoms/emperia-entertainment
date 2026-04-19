import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.emperia.scanner",
  appName: "Emperia Scanner",
  webDir: "out",
  server: {
    // During development, point to the Next.js dev server on the LAN.
    // Your phone must be on the same WiFi network.
    // Comment this out and use webDir for production builds.
    url: "http://192.168.1.6:3000/scanner",
    cleartext: true,
  },
  plugins: {
    Camera: {
      // iOS camera permissions are handled in Info.plist
      // Android camera permissions are handled in AndroidManifest.xml
    },
  },
  ios: {
    scheme: "Emperia Scanner",
  },
  android: {
    // Allow mixed content for dev server
    allowMixedContent: true,
  },
};

export default config;
