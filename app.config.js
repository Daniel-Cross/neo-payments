export default {
  expo: {
    name: "Blink",
    slug: "blink",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/ios.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0A0F1E",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/android.png",
        backgroundColor: "#0A0F1E",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "2ed7c203-a8af-4b0d-966d-7b36de74068f",
      },
    },
    plugins: ["expo-build-properties", "expo-router"],
  },
};
