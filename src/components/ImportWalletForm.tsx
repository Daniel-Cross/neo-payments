import { View, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientCard } from './GradientCard';
import { GradientButton } from './GradientButton';
import { Typography } from './Typography';
import { 
  CardVariant, 
  ButtonVariant, 
  ButtonSize, 
  TypographyVariant 
} from '../constants/enums';

interface ImportWalletFormProps {
  privateKeyInput: string;
  onPrivateKeyChange: (text: string) => void;
  onImport: () => void;
  onCancel: () => void;
  isLoading: boolean;
  secureStorageAvailable: boolean;
}

const ImportWalletForm = ({
  privateKeyInput,
  onPrivateKeyChange,
  onImport,
  onCancel,
  isLoading,
  secureStorageAvailable,
}: ImportWalletFormProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <GradientCard variant={CardVariant.OUTLINED} style={styles.importForm}>
      <Typography
        variant={TypographyVariant.LABEL_MEDIUM}
        color={theme.text.SOFT_WHITE}
      >
        Enter Private Key
      </Typography>
      
      <TextInput
        style={[
          styles.privateKeyInput,
          {
            backgroundColor: theme.background.PURPLE_ACCENT,
            borderColor: theme.background.SEMI_TRANSPARENT_WHITE,
            color: theme.text.SOFT_WHITE,
          },
        ]}
        value={privateKeyInput}
        onChangeText={onPrivateKeyChange}
        placeholder="Enter your private key here..."
        placeholderTextColor={theme.text.LIGHT_GREY}
        multiline
        secureTextEntry
      />
      
      <View style={styles.importActions}>
        <GradientButton
          title="Cancel"
          onPress={onCancel}
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.MEDIUM}
          style={styles.importActionButton}
        />
        <GradientButton
          title="Import"
          onPress={onImport}
          variant={ButtonVariant.PRIMARY}
          size={ButtonSize.MEDIUM}
          disabled={isLoading || !secureStorageAvailable}
          loading={isLoading}
          style={styles.importActionButton}
        />
      </View>
    </GradientCard>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    importForm: {
      margin: 20,
    },
    privateKeyInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      fontFamily: 'monospace',
      minHeight: 80,
      textAlignVertical: 'top',
      marginTop: 12,
      marginBottom: 16,
    },
    importActions: {
      flexDirection: 'row',
      gap: 12,
    },
    importActionButton: {
      flex: 1,
    },
  });

export default ImportWalletForm;
