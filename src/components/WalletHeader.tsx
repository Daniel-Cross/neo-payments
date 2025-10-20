import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant } from '../constants/enums';

interface WalletHeaderProps {
  title: string;
  showDisconnect?: boolean;
  onDisconnect?: () => void;
}

const WalletHeader = ({ 
  title, 
  showDisconnect = false, 
  onDisconnect 
}: WalletHeaderProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.header}>
      <Typography
        variant={TypographyVariant.DISPLAY_SMALL}
        color={theme.text.SOFT_WHITE}
      >
        {title}
      </Typography>
      
      {showDisconnect && onDisconnect && (
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={onDisconnect}
        >
          <Typography
            variant={TypographyVariant.TITLE_MEDIUM}
            color={theme.text.ERROR_RED}
            weight="600"
          >
            Disconnect
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    disconnectButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.text.ERROR_RED,
    },
  });

export default WalletHeader;
