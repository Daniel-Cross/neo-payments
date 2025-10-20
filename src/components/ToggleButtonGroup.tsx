import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant } from '../constants/enums';

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleButtonGroupProps {
  options: ToggleOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  options,
  selectedValue,
  onValueChange,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.toggleButton,
            selectedValue === option.value && styles.toggleButtonActive,
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Typography 
            variant={TypographyVariant.CAPTION} 
            color={selectedValue === option.value ? theme.text.SOFT_WHITE : theme.text.LIGHT_GREY}
            weight="600"
          >
            {option.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.small,
    padding: 2,
    alignSelf: 'flex-start',
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50, 
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.NEON_PINK,
  },
});
