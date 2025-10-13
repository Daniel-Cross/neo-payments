import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

interface HeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const Header = ({ showBackButton = true, onBackPress }: HeaderProps) => {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    showBackButton && (
      <TouchableOpacity
        style={[styles.backButton, { top: height * 0.06 }]}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back-outline"
          size={30}
          color={theme.text.SOFT_WHITE}
        />
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    left: 10,
    padding: 8,
    zIndex: 1,
  },
});

export default Header;
