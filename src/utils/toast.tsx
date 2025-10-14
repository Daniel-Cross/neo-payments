import Toast, { ToastConfigParams } from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Typography } from "../components/Typography";
import { TypographyVariant } from "../constants/enums";
import { TOAST } from "../constants/colours";

export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export const toastConfig = {
  success: ({ text1, props }: ToastConfigParams<any>) => {
    const { theme } = useTheme();
    return (
      <View
        style={[
          styles.toast,
          styles.toastSuccess,
          { zIndex: props?.zIndex || 9999 },
        ]}
      >
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_WHITE}
          weight="600"
        >
          {text1}
        </Typography>
      </View>
    );
  },
  error: ({ text1, props }: ToastConfigParams<any>) => {
    const { theme } = useTheme();
    return (
      <View
        style={[
          styles.toast,
          styles.toastError,
          { zIndex: props?.zIndex || 9999 },
        ]}
      >
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_WHITE}
          weight="600"
        >
          {text1}
        </Typography>
      </View>
    );
  },
  warning: ({ text1, props }: ToastConfigParams<any>) => {
    const { theme } = useTheme();
    return (
      <View
        style={[
          styles.toast,
          styles.toastWarning,
          { zIndex: props?.zIndex || 9999 },
        ]}
      >
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_WHITE}
          weight="600"
        >
          {text1}
        </Typography>
      </View>
    );
  },
  info: ({ text1, props }: ToastConfigParams<any>) => {
    const { theme } = useTheme();
    return (
      <View
        style={[
          styles.toast,
          styles.toastInfo,
          { zIndex: props?.zIndex || 9999 },
        ]}
      >
        <Typography
          variant={TypographyVariant.BODY_MEDIUM}
          color={theme.text.LIGHT_WHITE}
          weight="600"
        >
          {text1}
        </Typography>
      </View>
    );
  },
};

interface ToastConfig {
  type: ToastType;
  text?: string;
  visibilityTime?: ToastDuration;
  props?: any;
  onHide?: () => void;
  zIndex?: number;
}

export enum ToastDuration {
  Default = 4000,
  Long = 8000,
  Indefinite = Number.MAX_SAFE_INTEGER,
}

const showToast = ({
  text,
  visibilityTime = ToastDuration.Default,
  type,
  props,
  onHide,
  zIndex,
}: ToastConfig) => {
  Toast.show({
    type,
    text1: text,
    visibilityTime,
    autoHide: visibilityTime !== ToastDuration.Indefinite,
    props: {
      ...props,
      zIndex: zIndex || 9999,
    },
    topOffset: 70,
    onShow: () => {
      switch (type) {
        case ToastType.SUCCESS:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case ToastType.ERROR:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case ToastType.WARNING:
        case ToastType.INFO:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    },
    onHide: onHide,
  });
};

// Convenience functions
export const showSuccessToast = (
  text: string,
  duration?: ToastDuration,
  zIndex?: number
) => {
  showToast({
    type: ToastType.SUCCESS,
    text,
    visibilityTime: duration,
    zIndex,
  });
};

export const showErrorToast = (
  text: string,
  duration?: ToastDuration,
  zIndex?: number
) => {
  showToast({ type: ToastType.ERROR, text, visibilityTime: duration, zIndex });
};

export const showWarningToast = (
  text: string,
  duration?: ToastDuration,
  zIndex?: number
) => {
  showToast({
    type: ToastType.WARNING,
    text,
    visibilityTime: duration,
    zIndex,
  });
};

export const showInfoToast = (
  text: string,
  duration?: ToastDuration,
  zIndex?: number
) => {
  showToast({ type: ToastType.INFO, text, visibilityTime: duration, zIndex });
};

const styles = StyleSheet.create({
  toast: {
    width: "90%",
    minHeight: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
  },
  toastSuccess: {
    backgroundColor: TOAST.SUCCESS,
  },
  toastError: {
    backgroundColor: TOAST.ERROR,
  },
  toastWarning: {
    backgroundColor: TOAST.WARNING,
  },
  toastInfo: {
    backgroundColor: TOAST.INFO,
  },
});
