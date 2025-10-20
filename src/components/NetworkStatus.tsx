import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { TypographyVariant, NetworkCongestion } from '../constants/enums';

interface NetworkStatusProps {
  networkCongestion: NetworkCongestion;
  estimatedTime: string;
  feeInSOL: number;
  countdown: number;
  isRefreshing: boolean;
  style?: any;
}

const NetworkStatus = ({
  networkCongestion,
  estimatedTime,
  feeInSOL,
  countdown,
  isRefreshing,
  style,
}: NetworkStatusProps) => {
  const { theme } = useTheme();

  const getCongestionColor = (congestion: NetworkCongestion) => {
    switch (congestion) {
      case NetworkCongestion.HIGH:
        return theme.text.ERROR_RED;
      case NetworkCongestion.MEDIUM:
        return theme.text.WARNING_ORANGE;
      case NetworkCongestion.LOW:
      default:
        return theme.text.SUCCESS_GREEN;
    }
  };


  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Typography
          variant={TypographyVariant.LABEL_MEDIUM}
          color={theme.text.LIGHT_GREY}
          weight='600'
          style={styles.title}
        >
          Network Status
        </Typography>
      </View>

      <View style={styles.networkInfo}>
        <View style={styles.congestionContainer}>
          <View
            style={[
              styles.congestionIndicator,
              { backgroundColor: getCongestionColor(networkCongestion) },
            ]}
          />
          <Typography
            variant={TypographyVariant.CAPTION}
            color={theme.text.LIGHT_GREY}
            style={styles.congestionText}
          >
            Network: {networkCongestion.toUpperCase()}
          </Typography>
        </View>

        <Typography
          variant={TypographyVariant.CAPTION}
          color={theme.text.SUCCESS_GREEN}
          style={styles.estimatedTime}
        >
          ⚡ Estimated: {estimatedTime}
        </Typography>

        <Typography variant={TypographyVariant.CAPTION} color={theme.text.LIGHT_GREY}>
          Fee: {feeInSOL.toFixed(6)} SOL
        </Typography>

        <View style={styles.refreshContainer}>
          {isRefreshing ? (
            <Typography variant={TypographyVariant.CAPTION} color={theme.text.LIGHT_GREY}>
              Getting latest gas fees...
            </Typography>
          ) : (
            <Typography variant={TypographyVariant.CAPTION} color={theme.text.DARK_GREY}>
              Next refresh in {countdown}s
            </Typography>
          )}
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
  },
  networkInfo: {
    gap: 8,
  },
  congestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  congestionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  congestionText: {
    flex: 1,
  },
  estimatedTime: {
    fontWeight: '600',
  },
  refreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default NetworkStatus;
