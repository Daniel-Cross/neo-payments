import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

interface CloseButtonProps {
  onPress: () => void;
  size?: number;
  style?: any;
}

const CloseButton = ({ onPress, size = 24, style }: CloseButtonProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.closeButton, style]}>
      <MaterialCommunityIcons 
        name="close" 
        size={size} 
        color={theme.text.SOFT_WHITE} 
      />
    </TouchableOpacity>
  );
};

export default CloseButton;

const createStyles = (theme: any) => StyleSheet.create({
  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
