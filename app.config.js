const pkgs = require("./package.json");
const BUILD_NUMBER = Math.floor(Date.now() / 1000).toString();

export default {
  expo: {
    name: "Blink",
    slug: "blink",
    version: pkgs.version,
    orientation: "portrait",
    icon: "./assets/ios.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    jsEngine: "hermes",

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0A0F1E",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.daniel.cross.blink",
      buildNumber: BUILD_NUMBER,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSFaceIDUsageDescription:
          "Blink uses Face ID to securely protect your wallet private keys and authenticate sensitive operations.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/android.png",
        backgroundColor: "#0A0F1E",
        versionCode: parseInt(BUILD_NUMBER, 10),
        package: "com.daniel.cross.blink",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ["USE_BIOMETRIC", "USE_FINGERPRINT"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "2ed7c203-a8af-4b0d-966d-7b36de74068f",
      },
    },
    plugins: [
      "expo-build-properties",
      [
        "expo-router",
        {
          root: "./app",
        },
      ],
    ],
    scheme: "blink",
  },
};
