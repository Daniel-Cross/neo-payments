import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { GradientCard } from './GradientCard';
import { 
  RecipientType, 
  RecipientSelectionText, 
  CardVariant, 
  TypographyVariant,
} from '../constants/enums';
import { EDGE_MARGIN } from '../constants/styles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import InputGroup from './InputGroup';
import ContactSelectionModal from './ContactSelectionModal';

export interface Contact {
  id: string;
  name: string;
  address: string;
  isFavorite: boolean;
}

interface RecipientSelectionProps {
  selectedType: RecipientType;
  onTypeChange: (type: RecipientType) => void;
  recipientAddress: string;
  onAddressChange: (address: string) => void;
  contacts: Contact[];
  favorites: Contact[];
  onContactSelect: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  isValidAddress: boolean;
  isValidatingAddress?: boolean;
  recipientBalance: number | null;
  onScanQRCode?: () => void;
}

const RecipientSelection = ({
  selectedType,
  onTypeChange,
  recipientAddress,
  onAddressChange,
  contacts,
  favorites,
  onContactSelect,
  onToggleFavorite,
  isValidAddress,
  isValidatingAddress = false,
  recipientBalance,
  onScanQRCode,
}: RecipientSelectionProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalTitle, setContactModalTitle] = useState('');

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        onAddressChange(clipboardContent.trim());
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const handleOpenContacts = () => {
    setContactModalTitle('Contacts');
    setShowContactModal(true);
  };

  const handleOpenFavorites = () => {
    setContactModalTitle('Favorites');
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };


  const renderContent = () => {
    return (
      <InputGroup
        label={RecipientSelectionText.WALLET_ADDRESS}
        value={recipientAddress}
        onChangeText={onAddressChange}
        placeholder="Enter Solana address..."
        error={recipientAddress && !isValidAddress && !isValidatingAddress ? "Invalid Solana address" : undefined}
        success={recipientAddress && isValidAddress ? "Valid Solana address" : undefined}
        isValidating={isValidatingAddress}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        showPasteButton={true}
        onPaste={handlePaste}
        showScanButton={!!onScanQRCode}
        onScan={onScanQRCode}
      />
    );
  };

  return (
    <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>
      <Typography
        variant={TypographyVariant.TITLE_MEDIUM}
        color={theme.text.SOFT_WHITE}
        style={styles.title}
      >
        {RecipientSelectionText.SELECT_RECIPIENT}
      </Typography>

      {/* Selection Buttons */}
      <View style={styles.selectionButtons}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => onTypeChange(RecipientType.WALLET_ADDRESS)}
            style={[
              styles.selectionButton,
              selectedType === RecipientType.WALLET_ADDRESS ? styles.selectedButton : styles.unselectedButton
            ]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="wallet"
              size={20}
              color={selectedType === RecipientType.WALLET_ADDRESS ? theme.text.SOFT_WHITE : theme.text.LIGHT_GREY}
            />
          </TouchableOpacity>
          <Typography
            variant={TypographyVariant.BODY_SMALL}
            color={selectedType === RecipientType.WALLET_ADDRESS ? theme.text.SOFT_WHITE : theme.text.LIGHT_GREY}
            style={styles.buttonLabel}
          >
            {RecipientSelectionText.WALLET_ADDRESS}
          </Typography>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleOpenContacts}
            style={styles.unselectedButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color={theme.text.LIGHT_GREY}
            />
          </TouchableOpacity>
          <Typography
            variant={TypographyVariant.BODY_SMALL}
            color={theme.text.LIGHT_GREY}
            style={styles.buttonLabel}
          >
            {RecipientSelectionText.CONTACTS}
          </Typography>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleOpenFavorites}
            style={styles.unselectedButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="heart"
              size={20}
              color={theme.text.LIGHT_GREY}
            />
          </TouchableOpacity>
          <Typography
            variant={TypographyVariant.BODY_SMALL}
            color={theme.text.LIGHT_GREY}
            style={styles.buttonLabel}
          >
            {RecipientSelectionText.FAVORITES}
          </Typography>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {renderContent()}
      </View>

      {/* Contact Selection Modal */}
      <ContactSelectionModal
        visible={showContactModal}
        onClose={handleCloseContactModal}
        contacts={contacts}
        favorites={favorites}
        onContactSelect={onContactSelect}
        onToggleFavorite={onToggleFavorite}
        title={contactModalTitle}
      />
    </GradientCard>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    marginBottom: EDGE_MARGIN,
  },
  title: {
    marginBottom: EDGE_MARGIN,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: EDGE_MARGIN,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  selectionButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: theme.colors.NEON_PINK,
  },
  unselectedButton: {
    height: 44,
    width: 44,
    backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
    borderWidth: 1,
    borderRadius: 22,
    borderColor: theme.colors.NEON_PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    marginTop: 8,
    textAlign: 'center',
  },
  contentArea: {
    minHeight: 120,
  },
});

export default RecipientSelection;
