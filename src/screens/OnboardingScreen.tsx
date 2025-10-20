import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "../components/Typography";
import { GradientButton } from "../components/GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { EDGE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState, useEffect } from "react";
import { useUserStore } from "../store/userStore";
import PhoneVerificationModal from "../components/PhoneVerificationModal";
import { showSuccessToast, showErrorToast } from "../utils/toast";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
    isAuthenticated,
    isLoading,
    profile,
    phoneVerified,
    initializeAuth,
    verifyPhoneNumber,
    createUserProfile,
  } = useUserStore();

  const [currentStep, setCurrentStep] = useState<"welcome" | "phone" | "profile" | "complete">("welcome");
  const [displayName, setDisplayName] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check if user is already authenticated and has profile
  useEffect(() => {
    if (isAuthenticated && profile && phoneVerified) {
      setCurrentStep("complete");
    } else if (isAuthenticated && phoneVerified) {
      setCurrentStep("profile");
    } else if (isAuthenticated) {
      setCurrentStep("phone");
    }
  }, [isAuthenticated, profile, phoneVerified]);

  const handleGetStarted = () => {
    setCurrentStep("phone");
  };

  const handlePhoneVerification = () => {
    setShowPhoneModal(true);
  };

  const handlePhoneVerified = async (verifiedPhoneNumber: string) => {
    setPhoneNumber(verifiedPhoneNumber);
    const success = await verifyPhoneNumber(verifiedPhoneNumber);
    
    if (success) {
      setCurrentStep("profile");
    }
  };

  const handleCreateProfile = async () => {
    if (!displayName.trim()) {
      showErrorToast("Please enter a display name");
      return;
    }

    const success = await createUserProfile(phoneNumber, displayName.trim());
    
    if (success) {
      setCurrentStep("complete");
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="wallet"
          size={80}
          color={theme.colors.ELECTRIC_BLUE}
        />
      </View>
      
      <Typography
        variant={TypographyVariant.HEADLINE_MEDIUM}
        color={theme.text.SOFT_WHITE}
        style={styles.title}
      >
        Welcome to Neo Payments
      </Typography>
      
      <Typography
        variant={TypographyVariant.BODY_LARGE}
        color={theme.text.LIGHT_GREY}
        style={styles.subtitle}
      >
        Your secure Solana wallet for seamless payments and transactions
      </Typography>

      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons
            name="shield-check"
            size={24}
            color={theme.colors.ELECTRIC_BLUE}
          />
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.SOFT_WHITE}
            style={styles.featureText}
          >
            Secure & Encrypted
          </Typography>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={24}
            color={theme.colors.ELECTRIC_BLUE}
          />
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.SOFT_WHITE}
            style={styles.featureText}
          >
            Fast Transactions
          </Typography>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialCommunityIcons
            name="credit-card"
            size={24}
            color={theme.colors.ELECTRIC_BLUE}
          />
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.SOFT_WHITE}
            style={styles.featureText}
          >
            Buy SOL Instantly
          </Typography>
        </View>
      </View>

      <GradientButton
        title="Get Started"
        onPress={handleGetStarted}
        variant={ButtonVariant.PRIMARY}
        style={styles.primaryButton}
      />
    </View>
  );

  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="phone-check"
          size={80}
          color={theme.colors.ELECTRIC_BLUE}
        />
      </View>
      
      <Typography
        variant={TypographyVariant.HEADLINE_MEDIUM}
        color={theme.text.SOFT_WHITE}
        style={styles.title}
      >
        Verify Your Phone
      </Typography>
      
      <Typography
        variant={TypographyVariant.BODY_LARGE}
        color={theme.text.LIGHT_GREY}
        style={styles.subtitle}
      >
        We'll send you a verification code to secure your account
      </Typography>

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
          Your phone number is encrypted and used only for account security
        </Typography>
      </View>

      <GradientButton
        title="Verify Phone Number"
        onPress={handlePhoneVerification}
        variant={ButtonVariant.PRIMARY}
        style={styles.primaryButton}
        icon={
          <MaterialCommunityIcons
            name="phone"
            size={20}
            color={theme.text.SOFT_WHITE}
          />
        }
      />
    </View>
  );

  const renderProfileStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="account-circle"
          size={80}
          color={theme.colors.ELECTRIC_BLUE}
        />
      </View>
      
      <Typography
        variant={TypographyVariant.HEADLINE_MEDIUM}
        color={theme.text.SOFT_WHITE}
        style={styles.title}
      >
        Create Your Profile
      </Typography>
      
      <Typography
        variant={TypographyVariant.BODY_LARGE}
        color={theme.text.LIGHT_GREY}
        style={styles.subtitle}
      >
        Choose a display name for your wallet
      </Typography>

      <View style={styles.inputContainer}>
        <Typography
          variant={TypographyVariant.BODY_LARGE}
          color={theme.text.SOFT_WHITE}
          style={styles.inputLabel}
        >
          Display Name
        </Typography>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.background.PURPLE_LIGHTER,
              color: theme.text.SOFT_WHITE,
              borderColor: theme.background.PURPLE_HOVER,
            },
          ]}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your display name"
          placeholderTextColor={theme.text.LIGHT_GREY}
          autoFocus
        />
      </View>

      <GradientButton
        title="Create Profile"
        onPress={handleCreateProfile}
        variant={ButtonVariant.PRIMARY}
        disabled={!displayName.trim() || isLoading}
        loading={isLoading}
        style={styles.primaryButton}
      />
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="check-circle"
          size={80}
          color={theme.text.SUCCESS_GREEN}
        />
      </View>
      
      <Typography
        variant={TypographyVariant.HEADLINE_MEDIUM}
        color={theme.text.SOFT_WHITE}
        style={styles.title}
      >
        You're All Set!
      </Typography>
      
      <Typography
        variant={TypographyVariant.BODY_LARGE}
        color={theme.text.LIGHT_GREY}
        style={styles.subtitle}
      >
        Your Neo Payments wallet is ready to use
      </Typography>

      <View style={styles.completionInfo}>
        <View style={styles.completionItem}>
          <MaterialCommunityIcons
            name="phone-check"
            size={20}
            color={theme.text.SUCCESS_GREEN}
          />
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.SOFT_WHITE}
            style={styles.completionText}
          >
            Phone verified: {phoneNumber}
          </Typography>
        </View>
        
        {profile && (
          <View style={styles.completionItem}>
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={theme.text.SUCCESS_GREEN}
            />
            <Typography
              variant={TypographyVariant.BODY_MEDIUM}
              color={theme.text.SOFT_WHITE}
              style={styles.completionText}
            >
              Profile: {profile.display_name}
            </Typography>
          </View>
        )}
      </View>

      <GradientButton
        title="Start Using Neo Payments"
        onPress={handleComplete}
        variant={ButtonVariant.PRIMARY}
        style={styles.primaryButton}
        icon={
          <MaterialCommunityIcons
            name="rocket-launch"
            size={20}
            color={theme.text.SOFT_WHITE}
          />
        }
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.DARK_PURPLE }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === "welcome" && renderWelcomeStep()}
        {currentStep === "phone" && renderPhoneStep()}
        {currentStep === "profile" && renderProfileStep()}
        {currentStep === "complete" && renderCompleteStep()}
      </ScrollView>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerificationComplete={handlePhoneVerified}
        initialPhoneNumber={phoneNumber}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: EDGE_MARGIN,
      paddingTop: 80,
      paddingBottom: 40,
    },
    stepContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    iconContainer: {
      marginBottom: 32,
    },
    title: {
      textAlign: "center",
      marginBottom: 16,
    },
    subtitle: {
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
    },
    featuresContainer: {
      width: "100%",
      marginBottom: 48,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    featureText: {
      marginLeft: 16,
    },
    infoContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 1,
      borderColor: theme.colors.ELECTRIC_BLUE,
      marginBottom: 32,
    },
    infoIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      lineHeight: 18,
    },
    inputContainer: {
      width: "100%",
      marginBottom: 32,
    },
    inputLabel: {
      marginBottom: 12,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
    },
    completionInfo: {
      width: "100%",
      marginBottom: 48,
    },
    completionItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    completionText: {
      marginLeft: 16,
    },
    primaryButton: {
      width: "100%",
    },
  });