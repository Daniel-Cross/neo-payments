import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { EDGE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState, useEffect } from "react";
import { authService } from "../services/supabase";
import { showSuccessToast, showErrorToast } from "../utils/toast";

interface PhoneVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerificationComplete: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}

export default function PhoneVerificationModal({
  visible,
  onClose,
  onVerificationComplete,
  initialPhoneNumber = "",
}: PhoneVerificationModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");
    
    // Add country code if not present (assuming US +1)
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`;
    } else if (digits.startsWith("+")) {
      return phone;
    }
    
    return `+1${digits}`;
  };

  // Validate phone number format
  const isValidPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await authService.sendOTP(formattedPhone);

      if (result.success) {
        setStep("verification");
        setCountdown(60); // 60 second countdown
        showSuccessToast("Verification code sent!");
      } else {
        setError(result.error || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await authService.verifyOTP(formattedPhone, verificationCode.trim());

      if (result.success) {
        showSuccessToast("Phone number verified successfully!");
        onVerificationComplete(formattedPhone);
        handleClose();
      } else {
        setError(result.error || "Invalid verification code");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await authService.sendOTP(formattedPhone);

      if (result.success) {
        setCountdown(60);
        showSuccessToast("Verification code resent!");
      } else {
        setError(result.error || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset state when modal closes
  const handleClose = () => {
    setPhoneNumber(initialPhoneNumber);
    setVerificationCode("");
    setStep("phone");
    setError(null);
    setIsLoading(false);
    setCountdown(0);
    onClose();
  };

  // Go back to phone input
  const handleBackToPhone = () => {
    setStep("phone");
    setVerificationCode("");
    setError(null);
    setCountdown(0);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.DARK_PURPLE },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Typography
              variant={TypographyVariant.TITLE_LARGE}
              color={theme.text.SOFT_WHITE}
              style={styles.title}
            >
              {step === "phone" ? "Verify Phone Number" : "Enter Verification Code"}
            </Typography>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.text.SOFT_WHITE}
              />
            </TouchableOpacity>
          </View>
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.LIGHT_GREY}
            style={styles.subtitle}
          >
            {step === "phone"
              ? "We'll send you a verification code via SMS"
              : `Enter the 6-digit code sent to ${formatPhoneNumber(phoneNumber)}`}
          </Typography>
        </View>

        <View style={styles.content}>
          {step === "phone" ? (
            <>
              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Typography
                  variant={TypographyVariant.BODY_LARGE}
                  color={theme.text.SOFT_WHITE}
                  style={styles.inputLabel}
                >
                  Phone Number
                </Typography>
                <View style={styles.phoneInputContainer}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={20}
                    color={theme.text.LIGHT_GREY}
                    style={styles.phoneIcon}
                  />
                  <TextInput
                    style={[
                      styles.phoneInput,
                      {
                        backgroundColor: theme.background.PURPLE_LIGHTER,
                        color: theme.text.SOFT_WHITE,
                        borderColor: theme.background.PURPLE_HOVER,
                      },
                    ]}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (error) setError(null);
                    }}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor={theme.text.LIGHT_GREY}
                    keyboardType="phone-pad"
                    autoFocus
                  />
                </View>
              </View>

              {/* Error Display */}
              {error && (
                <View style={styles.errorContainer}>
                  <Typography
                    variant={TypographyVariant.BODY_SMALL}
                    color={theme.text.ERROR_RED}
                    style={styles.errorText}
                  >
                    {error}
                  </Typography>
                </View>
              )}

              {/* Send Code Button */}
              <View style={styles.buttonContainer}>
                <GradientButton
                  title={isLoading ? "Sending..." : "Send Verification Code"}
                  onPress={handleSendOTP}
                  variant={ButtonVariant.PRIMARY}
                  disabled={!isValidPhoneNumber(phoneNumber) || isLoading}
                  loading={isLoading}
                  style={styles.sendButton}
                />
              </View>
            </>
          ) : (
            <>
              {/* Verification Code Input */}
              <View style={styles.inputContainer}>
                <Typography
                  variant={TypographyVariant.BODY_LARGE}
                  color={theme.text.SOFT_WHITE}
                  style={styles.inputLabel}
                >
                  Verification Code
                </Typography>
                <View style={styles.codeInputContainer}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={20}
                    color={theme.text.LIGHT_GREY}
                    style={styles.codeIcon}
                  />
                  <TextInput
                    style={[
                      styles.codeInput,
                      {
                        backgroundColor: theme.background.PURPLE_LIGHTER,
                        color: theme.text.SOFT_WHITE,
                        borderColor: theme.background.PURPLE_HOVER,
                      },
                    ]}
                    value={verificationCode}
                    onChangeText={(text) => {
                      setVerificationCode(text);
                      if (error) setError(null);
                    }}
                    placeholder="123456"
                    placeholderTextColor={theme.text.LIGHT_GREY}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              </View>

              {/* Error Display */}
              {error && (
                <View style={styles.errorContainer}>
                  <Typography
                    variant={TypographyVariant.BODY_SMALL}
                    color={theme.text.ERROR_RED}
                    style={styles.errorText}
                  >
                    {error}
                  </Typography>
                </View>
              )}

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <Typography
                  variant={TypographyVariant.BODY_SMALL}
                  color={theme.text.LIGHT_GREY}
                  style={styles.resendText}
                >
                  Didn't receive the code?{" "}
                </Typography>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                >
                  <Typography
                    variant={TypographyVariant.BODY_SMALL}
                    color={
                      countdown > 0 || isLoading
                        ? theme.text.LIGHT_GREY
                        : theme.colors.ELECTRIC_BLUE
                    }
                    style={styles.resendButton}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Back"
                  onPress={handleBackToPhone}
                  variant={ButtonVariant.SECONDARY}
                  style={styles.backButton}
                />
                <GradientButton
                  title={isLoading ? "Verifying..." : "Verify Code"}
                  onPress={handleVerifyOTP}
                  variant={ButtonVariant.PRIMARY}
                  disabled={verificationCode.length !== 6 || isLoading}
                  loading={isLoading}
                  style={styles.verifyButton}
                />
              </View>
            </>
          )}

          {/* Info */}
          <View style={styles.infoContainer}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={theme.colors.ELECTRIC_BLUE}
              style={styles.infoIcon}
            />
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.infoText}
            >
              Your phone number is encrypted and secure. We'll only use it for account verification.
            </Typography>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
    },
    header: {
      paddingHorizontal: EDGE_MARGIN,
      marginBottom: 32,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    title: {
      flex: 1,
      textAlign: "left",
    },
    closeButton: {
      padding: 8,
      marginLeft: 16,
    },
    subtitle: {
      textAlign: "center",
      lineHeight: 20,
    },
    content: {
      flex: 1,
      paddingHorizontal: EDGE_MARGIN,
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputLabel: {
      marginBottom: 12,
    },
    phoneInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      backgroundColor: theme.background.PURPLE_LIGHTER,
      borderColor: theme.background.PURPLE_HOVER,
      paddingHorizontal: 16,
    },
    phoneIcon: {
      marginRight: 12,
    },
    phoneInput: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
    },
    codeInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      backgroundColor: theme.background.PURPLE_LIGHTER,
      borderColor: theme.background.PURPLE_HOVER,
      paddingHorizontal: 16,
    },
    codeIcon: {
      marginRight: 12,
    },
    codeInput: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 18,
      fontFamily: "monospace",
      textAlign: "center",
      letterSpacing: 4,
    },
    errorContainer: {
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "rgba(255, 115, 125, 0.1)",
      borderWidth: 1,
      borderColor: theme.text.ERROR_RED,
    },
    errorText: {
      textAlign: "center",
      lineHeight: 18,
    },
    resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    resendText: {
      textAlign: "center",
    },
    resendButton: {
      textDecorationLine: "underline",
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    sendButton: {
      flex: 1,
    },
    backButton: {
      flex: 1,
    },
    verifyButton: {
      flex: 1,
    },
    infoContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 1,
      borderColor: theme.colors.ELECTRIC_BLUE,
    },
    infoIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      lineHeight: 18,
    },
  });

