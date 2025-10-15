import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "./Typography";
import { GradientButton } from "./GradientButton";
import { TypographyVariant, ButtonVariant } from "../constants/enums";
import { EDGE_MARGIN } from "../constants/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState, useEffect } from "react";
import { usePaymentFlow } from "../hooks/usePaymentFlow";

interface BuySolanaModalProps {
  visible: boolean;
  onClose: () => void;
  onBuySolana: (amount: number, paymentMethod: string) => void;
}

export default function BuySolanaModal({
  visible,
  onClose,
  onBuySolana,
}: BuySolanaModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");
  
  const {
    isLoading,
    selectedProvider,
    error,
    initiatePayment,
    calculateFees,
    resetState,
  } = usePaymentFlow();

  const presetAmounts = [25, 50, 100, 250, 500];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (text: string) => {
    setCustomAmount(text);
    setSelectedAmount(null);
  };

  const handleBuy = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (amount && amount > 0) {
      const success = await initiatePayment(amount, selectedPaymentMethod);
      if (success) {
        onBuySolana(amount, selectedPaymentMethod);
      }
    }
  };

  const getFinalAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  const getFeeCalculation = () => {
    const amount = getFinalAmount();
    if (amount > 0 && selectedProvider) {
      return calculateFees(amount, selectedProvider);
    }
    return { subtotal: amount, fees: 0, total: amount };
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      resetState();
      setSelectedAmount(null);
      setCustomAmount("");
      setSelectedPaymentMethod("card");
    }
  }, [visible, resetState]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.DARK_PURPLE },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Typography
                variant={TypographyVariant.TITLE_LARGE}
                color={theme.text.SOFT_WHITE}
                style={styles.title}
              >
                Buy Solana
              </Typography>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
              Purchase SOL directly to your wallet
            </Typography>
          </View>

          {/* Amount Selection */}
          <View style={styles.section}>
            <Typography
              variant={TypographyVariant.TITLE_MEDIUM}
              color={theme.text.SOFT_WHITE}
              style={styles.sectionTitle}
            >
              Amount (USD)
            </Typography>

            {/* Preset Amounts */}
            <View style={styles.presetContainer}>
              {presetAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.presetButton,
                    selectedAmount === amount && styles.presetButtonSelected,
                  ]}
                  onPress={() => handleAmountSelect(amount)}
                >
                  <Typography
                    variant={TypographyVariant.BODY_MEDIUM}
                    color={
                      selectedAmount === amount
                        ? theme.text.SOFT_WHITE
                        : theme.text.LIGHT_GREY
                    }
                  >
                    ${amount}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount */}
            <View style={styles.customAmountContainer}>
              <Typography
                variant={TypographyVariant.BODY_MEDIUM}
                color={theme.text.SOFT_WHITE}
                style={styles.customAmountLabel}
              >
                Custom Amount
              </Typography>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: theme.background.PURPLE_LIGHTER,
                    color: theme.text.SOFT_WHITE,
                    borderColor: theme.background.PURPLE_HOVER,
                  },
                ]}
                value={customAmount}
                onChangeText={handleCustomAmountChange}
                placeholder="$0.00"
                placeholderTextColor={theme.text.LIGHT_GREY}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Typography
              variant={TypographyVariant.TITLE_MEDIUM}
              color={theme.text.SOFT_WHITE}
              style={styles.sectionTitle}
            >
              Payment Method
            </Typography>

            <View style={styles.paymentMethodContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  selectedPaymentMethod === "card" && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod("card")}
              >
                <MaterialCommunityIcons
                  name="credit-card"
                  size={24}
                  color={
                    selectedPaymentMethod === "card"
                      ? theme.text.SOFT_WHITE
                      : theme.text.LIGHT_GREY
                  }
                />
                <Typography
                  variant={TypographyVariant.BODY_MEDIUM}
                  color={
                    selectedPaymentMethod === "card"
                      ? theme.text.SOFT_WHITE
                      : theme.text.LIGHT_GREY
                  }
                  style={styles.paymentMethodText}
                >
                  Credit/Debit Card
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  selectedPaymentMethod === "bank" && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod("bank")}
              >
                <MaterialCommunityIcons
                  name="bank"
                  size={24}
                  color={
                    selectedPaymentMethod === "bank"
                      ? theme.text.SOFT_WHITE
                      : theme.text.LIGHT_GREY
                  }
                />
                <Typography
                  variant={TypographyVariant.BODY_MEDIUM}
                  color={
                    selectedPaymentMethod === "bank"
                      ? theme.text.SOFT_WHITE
                      : theme.text.LIGHT_GREY
                  }
                  style={styles.paymentMethodText}
                >
                  Bank Transfer
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          {getFinalAmount() > 0 && (
            <View style={styles.summaryContainer}>
              <Typography
                variant={TypographyVariant.TITLE_MEDIUM}
                color={theme.text.SOFT_WHITE}
                style={styles.summaryTitle}
              >
                Purchase Summary
              </Typography>
              
              {selectedProvider && (
                <View style={styles.summaryRow}>
                  <Typography
                    variant={TypographyVariant.BODY_MEDIUM}
                    color={theme.text.LIGHT_GREY}
                  >
                    Provider:
                  </Typography>
                  <Typography
                    variant={TypographyVariant.BODY_MEDIUM}
                    color={theme.text.SOFT_WHITE}
                  >
                    {selectedProvider.name}
                  </Typography>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Typography
                  variant={TypographyVariant.BODY_MEDIUM}
                  color={theme.text.LIGHT_GREY}
                >
                  Amount:
                </Typography>
                <Typography
                  variant={TypographyVariant.BODY_MEDIUM}
                  color={theme.text.SOFT_WHITE}
                >
                  ${getFeeCalculation().subtotal.toFixed(2)}
                </Typography>
              </View>
              
              {selectedProvider && getFeeCalculation().fees > 0 && (
                <View style={styles.summaryRow}>
                  <Typography
                    variant={TypographyVariant.BODY_MEDIUM}
                    color={theme.text.LIGHT_GREY}
                  >
                    Fees ({selectedProvider.fees.percentage}%):
                  </Typography>
                  <Typography
                    variant={TypographyVariant.BODY_MEDIUM}
                    color={theme.text.SOFT_WHITE}
                  >
                    ${getFeeCalculation().fees.toFixed(2)}
                  </Typography>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Typography
                  variant={TypographyVariant.BODY_MEDIUM}
                  color={theme.text.LIGHT_GREY}
                >
                  Payment Method:
                </Typography>
                <Typography
                  variant={TypographyVariant.BODY_MEDIUM}
                  color={theme.text.SOFT_WHITE}
                >
                  {selectedPaymentMethod === "card" ? "Credit/Debit Card" : "Bank Transfer"}
                </Typography>
              </View>
              
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Typography
                  variant={TypographyVariant.TITLE_MEDIUM}
                  color={theme.text.SOFT_WHITE}
                >
                  Total:
                </Typography>
                <Typography
                  variant={TypographyVariant.TITLE_MEDIUM}
                  color={theme.text.SOFT_WHITE}
                >
                  ${getFeeCalculation().total.toFixed(2)}
                </Typography>
              </View>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444" }]}>
              <Typography variant={TypographyVariant.BODY_SMALL} color="#ef4444">
                {error}
              </Typography>
            </View>
          )}

          {/* Buy Button */}
          <View style={styles.buttonContainer}>
            <GradientButton
              title={isLoading ? "Processing..." : "Continue to Payment"}
              onPress={handleBuy}
              variant={ButtonVariant.PRIMARY}
              disabled={getFinalAmount() <= 0 || isLoading}
              loading={isLoading}
              style={styles.buyButton}
            />
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.infoText}
            >
              • You'll be redirected to our secure payment partner
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.infoText}
            >
              • SOL will be added to your wallet after payment confirmation
            </Typography>
            <Typography
              variant={TypographyVariant.BODY_SMALL}
              color={theme.text.LIGHT_GREY}
              style={styles.infoText}
            >
              • Processing time: 1-5 minutes
            </Typography>
          </View>
        </ScrollView>
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
    scrollContent: {
      paddingHorizontal: EDGE_MARGIN,
      paddingBottom: 20,
    },
    header: {
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      marginBottom: 16,
    },
    presetContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20,
    },
    presetButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.background.PURPLE_HOVER,
      backgroundColor: "transparent",
    },
    presetButtonSelected: {
      backgroundColor: theme.colors.ELECTRIC_BLUE,
      borderColor: theme.colors.ELECTRIC_BLUE,
    },
    customAmountContainer: {
      marginTop: 8,
    },
    customAmountLabel: {
      marginBottom: 8,
    },
    amountInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      fontSize: 18,
      fontFamily: "monospace",
    },
    paymentMethodContainer: {
      gap: 12,
    },
    paymentMethodButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.background.PURPLE_HOVER,
      backgroundColor: "transparent",
    },
    paymentMethodSelected: {
      backgroundColor: theme.colors.ELECTRIC_BLUE,
      borderColor: theme.colors.ELECTRIC_BLUE,
    },
    paymentMethodText: {
      marginLeft: 12,
    },
    summaryContainer: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
      marginBottom: 24,
    },
    summaryTitle: {
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    summaryTotal: {
      borderTopWidth: 1,
      borderTopColor: theme.background.PURPLE_HOVER,
      paddingTop: 8,
      marginTop: 8,
    },
    buttonContainer: {
      marginBottom: 24,
    },
    buyButton: {
      width: "100%",
    },
    infoContainer: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 1,
      borderColor: theme.colors.ELECTRIC_BLUE,
    },
    infoText: {
      marginBottom: 4,
      lineHeight: 18,
    },
    errorContainer: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 16,
    },
  });
