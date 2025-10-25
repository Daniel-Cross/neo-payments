import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientBackground } from './GradientBackground';
import { GradientButton } from './GradientButton';
import { GradientCard } from './GradientCard';
import { GradientType, ButtonVariant } from '../constants/enums';
import { supabaseRequestService, CreateRequestParams } from '../services/supabaseRequestService';
import { useWalletStore } from '../store/walletStore';
import ContactSelectionModal from './ContactSelectionModal';
import { Contact } from '../services/contactsService';
import CloseButton from './CloseButton';

interface CreateRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestCreated?: (requestId: string) => void;
}

export default function CreateRequestModal({ 
  visible, 
  onClose, 
  onRequestCreated 
}: CreateRequestModalProps) {
  const { theme } = useTheme();
  const { selectedWallet } = useWalletStore();
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [expiresInHours, setExpiresInHours] = useState('24');
  const [isCreating, setIsCreating] = useState(false);
  const [showContactSelection, setShowContactSelection] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedContact(null);
      setAmount('');
      setMessage('');
      setExpiresInHours('24');
    }
  }, [visible]);

  const handleCreateRequest = async () => {
    if (!selectedWallet) {
      Alert.alert('Error', 'No wallet selected');
      return;
    }

    // Validation
    if (!selectedContact) {
      Alert.alert('Error', 'Please select a contact');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const expiresNum = parseInt(expiresInHours);
    if (isNaN(expiresNum) || expiresNum < 1 || expiresNum > 168) { // Max 1 week
      Alert.alert('Error', 'Please enter a valid expiration time (1-168 hours)');
      return;
    }

    setIsCreating(true);

    try {
      const params: CreateRequestParams = {
        amount: amountNum,
        recipient_wallet_address: selectedContact.contact_wallet_address,
        recipient_name: selectedContact.contact_name,
        message: message.trim() || undefined,
        expires_in_hours: expiresNum,
      };

      const result = await supabaseRequestService.createRequest(
        selectedWallet.publicKey,
        selectedWallet.name,
        params
      );

      if (result.success && result.request) {
        Alert.alert(
          'Request Created',
          `Payment request for ${amountNum} SOL has been sent to ${selectedContact.contact_name || 'contact'}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                onRequestCreated?.(result.request!.id);
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create request');
    } finally {
      setIsCreating(false);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <GradientBackground gradient={GradientType.PRIMARY} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.SOFT_WHITE }]}>
              Create Payment Request
            </Text>
            <CloseButton onPress={onClose} />
          </View>

          <GradientCard style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text.SOFT_WHITE }]}>
                Select Contact
              </Text>
              <TouchableOpacity
                style={[styles.contactSelector, { 
                  borderColor: theme.text.LIGHT_GREY,
                  backgroundColor: theme.background.INPUT,
                }]}
                onPress={() => setShowContactSelection(true)}
                activeOpacity={0.7}
              >
                {selectedContact ? (
                  <View style={styles.selectedContact}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.ELECTRIC_BLUE }]}>
                      <Text style={styles.avatarText}>
                        {selectedContact.contact_name ? selectedContact.contact_name.charAt(0).toUpperCase() : '?'}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: theme.text.SOFT_WHITE }]}>
                        {selectedContact.contact_name || 'Unknown Contact'}
                      </Text>
                      <Text style={[styles.contactAddress, { color: theme.text.LIGHT_GREY }]}>
                        {formatAddress(selectedContact.contact_wallet_address)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.placeholderText, { color: theme.text.LIGHT_GREY }]}>
                    Tap to select a contact
                  </Text>
                )}
                <Text style={[styles.selectorArrow, { color: theme.text.LIGHT_GREY }]}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text.SOFT_WHITE }]}>
                Amount (SOL)
              </Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text.SOFT_WHITE,
                  borderColor: theme.text.LIGHT_GREY,
                }]}
                placeholder="0.0"
                placeholderTextColor={theme.text.LIGHT_GREY}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text.SOFT_WHITE }]}>
                Message (Optional)
              </Text>
              <TextInput
                style={[styles.textArea, { 
                  color: theme.text.SOFT_WHITE,
                  borderColor: theme.text.LIGHT_GREY,
                }]}
                placeholder="Add a message for the recipient"
                placeholderTextColor={theme.text.LIGHT_GREY}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text.SOFT_WHITE }]}>
                Expires In (Hours)
              </Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text.SOFT_WHITE,
                  borderColor: theme.text.LIGHT_GREY,
                }]}
                placeholder="24"
                placeholderTextColor={theme.text.LIGHT_GREY}
                value={expiresInHours}
                onChangeText={setExpiresInHours}
                keyboardType="numeric"
              />
              <Text style={[styles.helpText, { color: theme.text.LIGHT_GREY }]}>
                Request will expire after this time (1-168 hours)
              </Text>
            </View>
          </GradientCard>

          <View style={styles.buttonContainer}>
            <GradientButton
              title={isCreating ? "Creating..." : "Create Request"}
              onPress={handleCreateRequest}
              variant={ButtonVariant.PRIMARY}
              disabled={isCreating}
              style={styles.createButton}
            />
            <GradientButton
              title="Cancel"
              onPress={onClose}
              variant={ButtonVariant.SECONDARY}
              style={styles.cancelButton}
            />
          </View>
        </KeyboardAvoidingView>

        <ContactSelectionModal
          visible={showContactSelection}
          onClose={() => setShowContactSelection(false)}
          onContactSelected={(contact) => {
            setSelectedContact(contact);
            setShowContactSelection(false);
          }}
        />
      </GradientBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formCard: {
    margin: 20,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  createButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  contactSelector: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactAddress: {
    fontSize: 12,
  },
  placeholderText: {
    fontSize: 16,
    flex: 1,
  },
  selectorArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
