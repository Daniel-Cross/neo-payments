import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useUserStore } from '../store/userStore';
import { profileService } from '../services/supabase';
import { Typography } from './Typography';
import { GradientCard } from './GradientCard';
import { GradientButton } from './GradientButton';
import InputGroup from './InputGroup';
import CloseButton from './CloseButton';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import {
  TypographyVariant,
  CardVariant,
  ButtonVariant,
  ButtonSize,
  InputMode,
} from '../constants/enums';
import { EDGE_MARGIN } from '../constants/styles';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { profile, user, updateUserProfile } = useUserStore();

  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || user?.phone || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [displayNameError, setDisplayNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Debounce timer for username checking
  const [usernameCheckTimer, setUsernameCheckTimer] = useState<NodeJS.Timeout | null>(null);

  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setUsernameError('Username cannot be empty');
      setUsernameSuccess('');
      return false;
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameSuccess('');
      return false;
    }
    if (value.length > 30) {
      setUsernameError('Username must be less than 30 characters');
      setUsernameSuccess('');
      return false;
    }
    // Username can only contain letters, numbers, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      setUsernameSuccess('');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const checkUsernameAvailability = async (value: string) => {
    if (!validateUsername(value)) {
      return;
    }

    // Don't check if it's the same as current username
    if (value.toLowerCase() === profile?.username?.toLowerCase()) {
      setUsernameSuccess('Current username');
      setUsernameError('');
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');
    setUsernameSuccess('');

    try {
      const result = await profileService.checkUsernameAvailability(value, user?.id);
      
      if (result.success && result.available) {
        setUsernameSuccess('Username is available');
        setUsernameError('');
      } else if (!result.available) {
        setUsernameError('Username is already taken');
        setUsernameSuccess('');
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    
    // Clear previous timer
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer);
    }

    // Basic validation first
    if (!validateUsername(value)) {
      return;
    }

    // Debounce the availability check
    const timer = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500); // Check after 500ms of no typing
    
    setUsernameCheckTimer(timer);
  };

  const validateDisplayName = (value: string): boolean => {
    if (!value.trim()) {
      setDisplayNameError('Display name cannot be empty');
      return false;
    }
    if (value.length < 2) {
      setDisplayNameError('Display name must be at least 2 characters');
      return false;
    }
    if (value.length > 50) {
      setDisplayNameError('Display name must be less than 50 characters');
      return false;
    }
    setDisplayNameError('');
    return true;
  };

  const validatePhoneNumber = (value: string): boolean => {
    if (!value.trim()) {
      setPhoneError('Phone number cannot be empty');
      return false;
    }
    // Basic phone validation - adjust regex based on your requirements
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email cannot be empty');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSave = async () => {
    // Validate all fields
    const isUsernameValid = validateUsername(username);
    const isDisplayNameValid = validateDisplayName(displayName);
    const isPhoneValid = validatePhoneNumber(phoneNumber);
    const isEmailValid = validateEmail(email);

    if (!isUsernameValid || !isDisplayNameValid || !isPhoneValid || !isEmailValid) {
      showErrorToast('Please fix the errors before saving');
      return;
    }

    // Check if username has error or is being checked
    if (usernameError || isCheckingUsername) {
      showErrorToast('Please wait for username validation to complete');
      return;
    }

    // Check if anything changed
    const hasChanges =
      username !== (profile?.username || '') ||
      displayName !== (profile?.display_name || '') ||
      phoneNumber !== (profile?.phone_number || '') ||
      email !== (profile?.email || user?.email || '');

    if (!hasChanges) {
      showErrorToast('No changes to save');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare updates object
      const updates: any = {};
      
      if (username !== profile?.username) {
        updates.username = username;
      }
      if (displayName !== profile?.display_name) {
        updates.display_name = displayName;
      }
      if (phoneNumber !== profile?.phone_number) {
        updates.phone_number = phoneNumber;
      }
      if (email !== (profile?.email || user?.email)) {
        updates.email = email;
      }

      const success = await updateUserProfile(updates);

      if (!success) {
        setIsLoading(false);
        return;
      }

      showSuccessToast('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear any pending timers
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer);
    }
    
    // Reset to original values
    setUsername(profile?.username || '');
    setDisplayName(profile?.display_name || '');
    setPhoneNumber(profile?.phone_number || '');
    setEmail(profile?.email || user?.email || '');
    setUsernameError('');
    setUsernameSuccess('');
    setDisplayNameError('');
    setPhoneError('');
    setEmailError('');
    setIsCheckingUsername(false);
    onClose();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimer) {
        clearTimeout(usernameCheckTimer);
      }
    };
  }, [usernameCheckTimer]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Typography variant={TypographyVariant.TITLE_LARGE} color={theme.text.SOFT_WHITE}>
            Edit Profile
          </Typography>
          <CloseButton onPress={handleCancel} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>
            <View style={styles.infoSection}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={theme.text.LIGHT_GREY}
              />
              <Typography
                variant={TypographyVariant.BODY_SMALL}
                color={theme.text.LIGHT_GREY}
                style={styles.infoText}
              >
                Update your profile information. Changes will be saved immediately.
              </Typography>
            </View>
          </GradientCard>

          <GradientCard variant={CardVariant.ELEVATED} style={styles.card}>
            <Typography
              variant={TypographyVariant.TITLE_MEDIUM}
              color={theme.text.SOFT_WHITE}
              style={styles.sectionTitle}
            >
              Personal Information
            </Typography>

            <InputGroup
              label="Username"
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="Enter your username"
              mode={InputMode.TEXT}
              error={usernameError}
              success={usernameSuccess}
              isValidating={isCheckingUsername}
              autoCapitalize="none"
              leftIcon={
                <MaterialCommunityIcons
                  name="at"
                  size={20}
                  color={theme.text.LIGHT_GREY}
                />
              }
            />

            <InputGroup
              label="Display Name"
              value={displayName}
              onChangeText={(value) => {
                setDisplayName(value);
                if (displayNameError) validateDisplayName(value);
              }}
              placeholder="Enter your display name"
              mode={InputMode.TEXT}
              error={displayNameError}
              leftIcon={
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={theme.text.LIGHT_GREY}
                />
              }
            />

            <InputGroup
              label="Phone Number"
              value={phoneNumber}
              onChangeText={(value) => {
                setPhoneNumber(value);
                if (phoneError) validatePhoneNumber(value);
              }}
              placeholder="+1 (555) 123-4567"
              mode={InputMode.PHONE}
              error={phoneError}
              leftIcon={
                <MaterialCommunityIcons
                  name="phone"
                  size={20}
                  color={theme.text.LIGHT_GREY}
                />
              }
            />

            <InputGroup
              label="Email Address"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) validateEmail(value);
              }}
              placeholder="your.email@example.com"
              mode={InputMode.EMAIL}
              error={emailError}
              leftIcon={
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color={theme.text.LIGHT_GREY}
                />
              }
            />

            <View style={styles.helperText}>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color={theme.text.LIGHT_GREY}
              />
              <Typography
                variant={TypographyVariant.CAPTION}
                color={theme.text.LIGHT_GREY}
                style={styles.helperTextContent}
              >
                Changes will be synced with Supabase. Email changes may require verification.
              </Typography>
            </View>
          </GradientCard>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="Cancel"
              onPress={handleCancel}
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.LARGE}
              style={styles.button}
            />
            <GradientButton
              title={isLoading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.LARGE}
              style={styles.button}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
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
      padding: 20,
    },
    sectionTitle: {
      marginBottom: 20,
    },
    infoSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    infoText: {
      flex: 1,
      lineHeight: 20,
    },
    helperText: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginTop: 8,
      paddingHorizontal: 4,
    },
    helperTextContent: {
      flex: 1,
      lineHeight: 18,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    button: {
      flex: 1,
    },
  });

