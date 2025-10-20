import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant } from '../constants/enums';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface PrivacyNoticeProps {
  message: string;
  style?: any;
}

const PrivacyNotice = ({
  message,
  style,
}: PrivacyNoticeProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons 
        name="shield-check" 
        size={20} 
        color={theme.text.SUCCESS_GREEN} 
      />
      <Typography 
        variant={TypographyVariant.CAPTION} 
        color={theme.text.SUCCESS_GREEN}
        weight="600"
        style={styles.text}
      >
        {message}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  text: {
    flex: 1,
  },
});

export default PrivacyNotice;
