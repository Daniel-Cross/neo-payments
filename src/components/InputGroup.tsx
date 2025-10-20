import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant } from '../constants/enums';

interface InputGroupProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  success?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  style?: any;
  inputStyle?: any;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  success,
  multiline = false,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
}) => {
  const { theme } = useTheme();
  
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);
  const hasValue = Boolean(value);

  return (
    <View style={[styles.container, style]}>
      <Typography 
        variant={TypographyVariant.LABEL_MEDIUM} 
        color={theme.text.LIGHT_GREY}
        weight="600"
        style={styles.label}
      >
        {label}
      </Typography>
      
      <TextInput
        style={[
          styles.input,
          hasValue && hasError && styles.inputError,
          hasValue && hasSuccess && styles.inputSuccess,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.text.LIGHT_GREY}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      
      {hasValue && hasError && (
        <Typography 
          variant={TypographyVariant.CAPTION} 
          color={theme.text.ERROR_RED}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
      
      {hasValue && hasSuccess && (
        <Typography 
          variant={TypographyVariant.CAPTION} 
          color={theme.text.SUCCESS_GREEN}
          style={styles.successText}
        >
          {success}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  inputSuccess: {
    borderColor: '#51CF66',
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
  },
  errorText: {
    marginTop: 4,
  },
  successText: {
    marginTop: 4,
  },
});
