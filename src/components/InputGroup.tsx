import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant } from '../constants/enums';
import { BASE_MARGIN, EDGE_MARGIN } from '../constants/styles';

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

const InputGroup = ({
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
}: InputGroupProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
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

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: EDGE_MARGIN,
  },
  label: {
    marginBottom: BASE_MARGIN,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.background.SEMI_TRANSPARENT_WHITE,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.text.SOFT_WHITE,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
  },
  inputError: {
    borderColor: theme.text.ERROR_RED,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
  },
  inputSuccess: {
    borderColor: theme.text.SUCCESS_GREEN,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
  },
  errorText: {
    marginTop: BASE_MARGIN,
  },
  successText: {
    marginTop: BASE_MARGIN,
  },
});

export default InputGroup;
