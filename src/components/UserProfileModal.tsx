import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useUserStore } from '../store/userStore';
import { useWalletStore } from '../store/walletStore';
import { Typography } from './Typography';
import { GradientCard } from './GradientCard';
import { GradientButton } from './GradientButton';
import CloseButton from './CloseButton';
import EditProfileModal from './EditProfileModal';
import { showSuccessToast } from '../utils/toast';
import { 
  TypographyVariant, 
  CardVariant, 
  ButtonVariant, 
  ButtonSize 
} from '../constants/enums';
import { EDGE_MARGIN } from '../constants/styles';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ visible, onClose }: UserProfileModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { profile, user } = useUserStore();
  const { selectedWallet } = useWalletStore();
  const [qrSize, setQrSize] = useState(200);
  const [showEditModal, setShowEditModal] = useState(false);

  const walletAddress = selectedWallet?.publicKey || '';
  const username = profile?.username || 'anonymous';
  const displayName = profile?.display_name || 'Anonymous User';
  const phoneNumber = profile?.phone_number || user?.phone || 'Not provided';
  const email = profile?.email || user?.email || 'Not provided';

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    
    await Clipboard.setStringAsync(walletAddress);
    showSuccessToast('Wallet address copied');
  };

  const handleShareAddress = async () => {
    if (!walletAddress) return;

    try {
      await Share.share({
        message: `Send me SOL at:\n${walletAddress}`,
        title: 'My Solana Wallet Address',
      });
    } catch (error) {
      console.error('Error sharing address:', error);
    }
  };


  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Typography variant={TypographyVariant.TITLE_LARGE} color={theme.text.SOFT_WHITE}>
            Profile
          </Typography>
          <CloseButton onPress={onClose} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Card */}
          <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>

            <Typography 
              variant={TypographyVariant.HEADLINE_MEDIUM} 
              style={styles.displayName}
            >
              {displayName}
            </Typography>

            <Typography 
              variant={TypographyVariant.BODY_SMALL} 
              color={theme.text.LIGHT_GREY}
              style={styles.username}
            >
              @{username}
            </Typography>

            <GradientButton
              title="Edit Profile"
              onPress={() => setShowEditModal(true)}
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              style={styles.editButton}
              icon={<MaterialCommunityIcons name="pencil" size={16} color="white" />}
            />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons 
                    name="phone" 
                    size={20} 
                    color={theme.text.LIGHT_GREY} 
                  />
                </View>
                <View style={styles.infoContent}>
                  <Typography 
                    variant={TypographyVariant.LABEL_SMALL} 
                    color={theme.text.LIGHT_GREY}
                  >
                    Phone Number
                  </Typography>
                  <Typography 
                    variant={TypographyVariant.BODY_MEDIUM} 
                    color={theme.text.SOFT_WHITE}
                  >
                    {phoneNumber}
                  </Typography>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons 
                    name="email" 
                    size={20} 
                    color={theme.text.LIGHT_GREY} 
                  />
                </View>
                <View style={styles.infoContent}>
                  <Typography 
                    variant={TypographyVariant.LABEL_SMALL} 
                    color={theme.text.LIGHT_GREY}
                  >
                    Email
                  </Typography>
                  <Typography 
                    variant={TypographyVariant.BODY_MEDIUM} 
                    color={theme.text.SOFT_WHITE}
                  >
                    {email}
                  </Typography>
                </View>
              </View>
            </View>
          </GradientCard>

          {/* Wallet QR Code Card */}
          {selectedWallet && (
            <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>
              <View style={styles.qrHeader}>
                <MaterialCommunityIcons 
                  name="qrcode" 
                  size={24} 
                  color={theme.text.SOFT_WHITE} 
                />
                <Typography 
                  variant={TypographyVariant.TITLE_MEDIUM} 
                  style={styles.qrTitle}
                >
                  Receive SOL
                </Typography>
              </View>

              <Typography 
                variant={TypographyVariant.BODY_SMALL} 
                color={theme.text.LIGHT_GREY}
                style={styles.qrSubtitle}
              >
                Share this QR code to receive payments
              </Typography>

              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={walletAddress}
                    size={qrSize}
                    backgroundColor="white"
                    color="#1a0b2e"
                  />
                </View>
              </View>

              <View style={styles.walletInfo}>
                <Typography 
                  variant={TypographyVariant.LABEL_SMALL} 
                  color={theme.text.LIGHT_GREY}
                  style={styles.walletLabel}
                >
                  Current Wallet
                </Typography>
                <Typography 
                  variant={TypographyVariant.BODY_MEDIUM} 
                  color={theme.text.SOFT_WHITE}
                  weight="600"
                >
                  {selectedWallet.name}
                </Typography>
              </View>

              <View style={styles.addressSection}>
                <Typography 
                  variant={TypographyVariant.LABEL_SMALL} 
                  color={theme.text.LIGHT_GREY}
                  style={styles.addressLabel}
                >
                  Wallet Address
                </Typography>
                <View style={styles.addressContainer}>
                  <Typography 
                    variant={TypographyVariant.BODY_SMALL} 
                    color={theme.text.SOFT_WHITE}
                    style={styles.address} 
                    numberOfLines={2}
                  >
                    {walletAddress}
                  </Typography>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <GradientButton
                  title="Copy"
                  onPress={handleCopyAddress}
                  variant={ButtonVariant.PRIMARY}
                  size={ButtonSize.MEDIUM}
                  style={styles.actionButton}
                  icon={<MaterialCommunityIcons name="content-copy" size={18} color="white" />}
                />
                <GradientButton
                  title="Share"
                  onPress={handleShareAddress}
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.MEDIUM}
                  style={styles.actionButton}
                  icon={<MaterialCommunityIcons name="share-variant" size={18} color="white" />}
                />
              </View>
            </GradientCard>
          )}

          <View style={styles.infoNotice}>
            <MaterialCommunityIcons 
              name="information" 
              size={18} 
              color={theme.text.LIGHT_GREY} 
            />
            <Typography 
              variant={TypographyVariant.CAPTION} 
              color={theme.text.LIGHT_GREY}
              style={styles.noticeText}
            >
              Only send SOL to this address. Other tokens may be lost permanently.
            </Typography>
          </View>
        </ScrollView>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.DARK_PURPLE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EDGE_MARGIN,
    paddingTop: 60,
    paddingBottom: EDGE_MARGIN,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: EDGE_MARGIN,
    paddingBottom: 40,
  },
  card: {
    marginBottom: EDGE_MARGIN,
    padding: 24,
  },
  displayName: {
    color: theme.text.SOFT_WHITE,
    textAlign: 'center',
    marginBottom: 4,
  },
  username: {
    textAlign: 'center',
    marginBottom: 16,
  },
  editButton: {
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background.PURPLE_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  qrTitle: {
    color: theme.text.SOFT_WHITE,
  },
  qrSubtitle: {
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  walletInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  walletLabel: {
    marginBottom: 4,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressLabel: {
    marginBottom: 8,
    textAlign: 'center',
  },
  addressContainer: {
    backgroundColor: theme.background.PURPLE_ACCENT,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.background.SEMI_TRANSPARENT_WHITE,
  },
  address: {
    textAlign: 'center',
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  infoNotice: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
});

