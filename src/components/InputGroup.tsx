import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant } from '../constants/enums';
import { BASE_MARGIN, EDGE_MARGIN } from '../constants/styles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface InputGroupProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  success?: string;
  isValidating?: boolean;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  style?: any;
  inputStyle?: any;
  showPasteButton?: boolean;
  onPaste?: () => void;
  showScanButton?: boolean;
  onScan?: () => void;
}

const InputGroup = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  success,
  isValidating = false,
  multiline = false,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
  showPasteButton = false,
  onPaste,
  showScanButton = false,
  onScan,
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
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            hasValue && hasError && styles.inputError,
            hasValue && hasSuccess && styles.inputSuccess,
            showPasteButton && styles.inputWithButton,
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
        
        {showScanButton && onScan && (
          <TouchableOpacity
            onPress={onScan}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={20}
              color={theme.text.SOFT_WHITE}
            />
          </TouchableOpacity>
        )}
        
        {showPasteButton && onPaste && (
          <TouchableOpacity
            onPress={onPaste}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="content-paste"
              size={20}
              color={theme.text.SOFT_WHITE}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {hasValue && isValidating && (
        <View style={styles.validatingContainer}>
          <ActivityIndicator size="small" color={theme.text.LIGHT_GREY} />
          <Typography 
            variant={TypographyVariant.CAPTION} 
            color={theme.text.LIGHT_GREY}
            style={styles.validatingText}
          >
            Validating...
          </Typography>
        </View>
      )}
      
      {hasValue && hasError && !isValidating && (
        <Typography 
          variant={TypographyVariant.CAPTION} 
          color={theme.text.ERROR_RED}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
      
      {hasValue && hasSuccess && !isValidating && (
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.background.SEMI_TRANSPARENT_WHITE,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.text.SOFT_WHITE,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
  },
  inputWithButton: {
    marginRight: 0,
  },
  actionButton: {
    height: 44,
    width: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.NEON_PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputError: {
    borderColor: theme.text.ERROR_RED,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
  },
  inputSuccess: {
    borderColor: theme.text.SUCCESS_GREEN,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
  },
  validatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: BASE_MARGIN / 2,
  },
  validatingText: {
    marginLeft: BASE_MARGIN / 2,
  },
  errorText: {
    marginTop: BASE_MARGIN,
  },
  successText: {
    marginTop: BASE_MARGIN,
  },
});

export default InputGroup;
