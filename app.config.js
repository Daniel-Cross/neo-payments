const pkgs = require("./package.json");
const BUILD_NUMBER = Math.floor(Date.now() / 1000).toString();

export default {
  expo: {
    name: "Neo",
    slug: "neo",
    owner: "daniel.cross",
    version: pkgs.version,
    orientation: "portrait",
    icon: "./assets/images/ios.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    jsEngine: "hermes",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#2B003B",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.appforge.neo",
      buildNumber: BUILD_NUMBER,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSFaceIDUsageDescription:
          "Neo uses Face ID to securely protect your wallet private keys and authenticate sensitive operations.",
        NSCameraUsageDescription:
          "Neo needs access to your camera to scan QR codes.",
      },
    },
    android: {
      package: "com.appforge.neo",
      adaptiveIcon: {
        foregroundImage: "./assets/images/android.png",
        backgroundColor: "#2B003B",
      },
      versionCode: parseInt(BUILD_NUMBER, 10),
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "CAMERA",
      ],
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      eas: {
        projectId: "ce6d91f4-c1ae-4e40-ad45-b187b5ec5d6f",
      },
    },
    plugins: [
      "expo-build-properties",
      "expo-font",
      [
        "expo-router",
        {
          root: "./app",
        },
      ],
    ],
    scheme: "neo",
  },
};
