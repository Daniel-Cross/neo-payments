import React from "react";
import { View, StyleSheet, Image } from "react-native";

export enum LogoSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

interface LogoProps {
  size?: LogoSize;
}

const Logo: React.FC<LogoProps> = ({ size = LogoSize.MEDIUM }) => {
  const getSizeStyles = () => {
    switch (size) {
      case LogoSize.SMALL:
        return {
          container: styles.smallContainer,
          image: styles.smallImage,
        };
      case LogoSize.LARGE:
        return {
          container: styles.largeContainer,
          image: styles.largeImage,
        };
      default:
        return {
          container: styles.mediumContainer,
          image: styles.mediumImage,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={sizeStyles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  // Small size
  smallContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  smallText: {
    fontSize: 18,
  },
  // Medium size
  mediumContainer: {
    flexDirection: "column",
  },
  mediumImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  // Large size
  largeContainer: {
    flexDirection: "column",
  },
  largeImage: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },
});

export default Logo;
