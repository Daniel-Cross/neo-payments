import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useUserStore } from "../store/userStore";
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
  const { profile, user } = useUserStore();

  const username = profile?.username || 'anonymous';
  const displayName = profile?.display_name || 'Anonymous User';
  const phoneNumber = profile?.phone_number || user?.phone || 'Not provided';

  return (
    <TouchableOpacity
      style={styles.userInfo}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
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
      </View>
      <Typography
        variant={TypographyVariant.BODY_MEDIUM}
        color={theme.text.SOFT_WHITE}
      >
        {displayName}
      </Typography>
      <Typography
        variant={TypographyVariant.BODY_SMALL}
        color={theme.text.LIGHT_GREY}
      >
        {phoneNumber}
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
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    userInfoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    userIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background.PURPLE_ACCENT,
      borderWidth: 2,
      borderColor: theme.colors.NEON_PINK,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
