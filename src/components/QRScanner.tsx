import { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { GradientButton } from './GradientButton';
import { TypographyVariant, ButtonVariant, ButtonSize } from '../constants/enums';
import { extractWalletAddress } from '../utils/deepLinkHandler';

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScanner({ visible, onClose, onScan }: QRScannerProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      requestCameraPermission();
      setScanned(false);
    }
  }, [visible]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Extract wallet address from the scanned data (could be deep link or raw address)
    const walletAddress = extractWalletAddress(data);
    
    if (walletAddress) {
      onScan(walletAddress);
    } else {
      // If no valid wallet address found, pass the raw data
      onScan(data);
    }
    
    onClose();
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  if (!visible) return null;

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.container}>
          <Typography variant={TypographyVariant.BODY_MEDIUM} style={styles.messageText}>
            Requesting camera permission...
          </Typography>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <MaterialCommunityIcons name="camera-off" size={64} color={theme.text.SOFT_WHITE} />
            <Typography variant={TypographyVariant.HEADLINE_MEDIUM} style={styles.permissionTitle}>
              Camera Access Required
            </Typography>
            <Typography variant={TypographyVariant.BODY_MEDIUM} style={styles.permissionMessage}>
              Please grant camera permission to scan QR codes
            </Typography>
            <View style={styles.buttonGroup}>
              <GradientButton
                title="Request Permission"
                onPress={requestCameraPermission}
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.MEDIUM}
                style={styles.permissionButton}
              />
              <GradientButton
                title="Cancel"
                onPress={handleClose}
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.MEDIUM}
                style={styles.permissionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant={TypographyVariant.HEADLINE_MEDIUM} style={styles.title}>
            Scan QR Code
          </Typography>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={28} color={theme.text.SOFT_WHITE} />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </View>

        <View style={styles.instructions}>
          <MaterialCommunityIcons name="qrcode-scan" size={32} color={theme.text.SOFT_WHITE} />
          <Typography variant={TypographyVariant.BODY_MEDIUM} style={styles.instructionText}>
            Position the QR code within the frame
          </Typography>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: theme.text.SOFT_WHITE,
  },
  closeButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: theme.text.SOFT_WHITE,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  instructions: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  instructionText: {
    color: theme.text.SOFT_WHITE,
    textAlign: 'center',
  },
  messageText: {
    color: theme.text.SOFT_WHITE,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  permissionTitle: {
    color: theme.text.SOFT_WHITE,
    textAlign: 'center',
  },
  permissionMessage: {
    color: theme.text.SOFT_WHITE,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  permissionButton: {
    width: '100%',
  },
});

