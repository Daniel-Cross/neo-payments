import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { TypographyVariant } from "../constants/enums";
import { EDGE_MARGIN, BASE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface UserInfoCardProps {
  onPress: () => void;
}

export default function UserInfoCard({ onPress }: UserInfoCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={styles.userInfo}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.userInfoHeader}>
        <Typography
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.LIGHT_GREY}
        >
          Profile
        </Typography>
        <MaterialCommunityIcons
          name="chevron-down"
          size={16}
          color={theme.text.LIGHT_GREY}
        />
      </View>
      <Typography
        variant={TypographyVariant.BODY_MEDIUM}
        color={theme.text.SOFT_WHITE}
      >
        Test Account
      </Typography>
      <Typography
        variant={TypographyVariant.BODY_MEDIUM}
        color={theme.text.SOFT_WHITE}
      >
        +46 000 00 00 00
      </Typography>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    userInfo: {
      flex: 1,
      alignItems: "flex-end",
      padding: EDGE_MARGIN,
      borderRadius: BASE_MARGIN,
      backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
      borderWidth: 1,
      borderColor: theme.colors.NEON_PINK,
      minHeight: 120,
    },
    userInfoHeader: {
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
  });
