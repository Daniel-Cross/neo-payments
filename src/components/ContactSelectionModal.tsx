import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GradientBackground } from './GradientBackground';
import { GradientCard } from './GradientCard';
import { GradientType } from '../constants/enums';
import { contactsService, Contact } from '../services/contactsService';
import { useWalletStore } from '../store/walletStore';
import CloseButton from './CloseButton';

interface ContactSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onContactSelected: (contact: Contact) => void;
}

export default function ContactSelectionModal({ 
  visible, 
  onClose, 
  onContactSelected 
}: ContactSelectionModalProps) {
  const { theme } = useTheme();
  const { selectedWallet } = useWalletStore();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load contacts when modal opens
  useEffect(() => {
    if (visible && selectedWallet) {
      loadContacts();
    }
  }, [visible, selectedWallet]);

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = contacts.filter(contact =>
        contact.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.contact_wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    if (!selectedWallet) return;
    
    setIsLoading(true);
    try {
      const userContacts = await contactsService.getContacts(selectedWallet.publicKey);
      setContacts(userContacts);
      setFilteredContacts(userContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    onContactSelected(contact);
    onClose();
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[styles.contactItem, { borderBottomColor: theme.text.LIGHT_GREY }]}
      onPress={() => handleContactSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.contactInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.ELECTRIC_BLUE }]}>
          <Text style={styles.avatarText}>
            {item.contact_name ? item.contact_name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: theme.text.SOFT_WHITE }]}>
            {item.contact_name || 'Unknown Contact'}
          </Text>
          <Text style={[styles.contactAddress, { color: theme.text.LIGHT_GREY }]}>
            {formatAddress(item.contact_wallet_address)}
          </Text>
        </View>
      </View>
      <Text style={[styles.selectText, { color: theme.colors.ELECTRIC_BLUE }]}>
        Select
      </Text>
    </TouchableOpacity>
  );

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
              Select Contact
            </Text>
            <CloseButton onPress={onClose} />
          </View>

          <GradientCard style={styles.searchCard}>
            <TextInput
              style={[styles.searchInput, { 
                color: theme.text.SOFT_WHITE,
                borderColor: theme.text.LIGHT_GREY,
              }]}
              placeholder="Search contacts..."
              placeholderTextColor={theme.text.LIGHT_GREY}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </GradientCard>

          <View style={styles.contactsContainer}>
            {isLoading ? (
              <GradientCard style={styles.loadingCard}>
                <Text style={[styles.loadingText, { color: theme.text.LIGHT_GREY }]}>
                  Loading contacts...
                </Text>
              </GradientCard>
            ) : filteredContacts.length > 0 ? (
              <FlatList
                data={filteredContacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.contactsList}
              />
            ) : (
              <GradientCard style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: theme.text.LIGHT_GREY }]}>
                  {searchQuery.trim() 
                    ? 'No contacts found matching your search'
                    : 'No contacts found. Add contacts to send payment requests.'
                  }
                </Text>
              </GradientCard>
            )}
          </View>
        </KeyboardAvoidingView>
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
  searchCard: {
    margin: 20,
    padding: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contactsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactAddress: {
    fontSize: 14,
  },
  selectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});