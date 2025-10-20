import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant, InputMode, Currency } from '../constants/enums';

interface TransactionSummaryProps {
  inputMode: InputMode;
  selectedCurrency: Currency;
  numAmount: number;
  solAmount: number;
  estimatedFee: number;
  totalCost: number;
  balance: number;
  solToCurrency: (sol: number) => number;
  style?: any;
}

const TransactionSummary = ({
  inputMode,
  selectedCurrency,
  numAmount,
  solAmount,
  estimatedFee,
  totalCost,
  balance,
  solToCurrency,
  style,
}: TransactionSummaryProps) => {
  const { theme } = useTheme();

  const hasInsufficientBalance = totalCost > balance;

  return (
    <View style={[styles.container, style]}>
      <Typography 
        variant={TypographyVariant.BODY_MEDIUM} 
        color={theme.text.SOFT_WHITE}
        weight="600"
        style={styles.title}
      >
        Transaction Summary
      </Typography>
      
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
          {inputMode === InputMode.CURRENCY 
            ? `${numAmount.toFixed(2)} ${selectedCurrency} (${solAmount.toFixed(6)} SOL)`
            : `${solAmount.toFixed(6)} SOL (${solToCurrency(solAmount).toFixed(2)} ${selectedCurrency})`
          }
        </Typography>
      </View>
      
      <View style={styles.summaryRow}>
        <Typography 
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_GREY}
        >
          Network Fee:
        </Typography>
        <Typography 
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.SOFT_WHITE}
        >
          {estimatedFee.toFixed(6)} SOL ({solToCurrency(estimatedFee).toFixed(2)} {selectedCurrency})
        </Typography>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Typography 
          variant={TypographyVariant.BODY_MEDIUM} 
          color={theme.text.SOFT_WHITE}
          weight="600"
        >
          Total:
        </Typography>
        <Typography 
          variant={TypographyVariant.BODY_MEDIUM} 
          color={theme.text.SOFT_WHITE}
          weight="600"
        >
          {totalCost.toFixed(6)} SOL ({solToCurrency(totalCost).toFixed(2)} {selectedCurrency})
        </Typography>
      </View>
      
      {hasInsufficientBalance && (
        <Typography 
          variant={TypographyVariant.CAPTION} 
          color={theme.text.ERROR_RED}
          style={styles.insufficientText}
        >
          Insufficient balance
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    marginTop: 4,
  },
  insufficientText: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TransactionSummary;
