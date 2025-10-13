import { PixelRatio, StyleSheet } from "react-native";
import { TEXT } from "./colours";

const MAX_FONT_SCALING = 1;
const MIN_FONT_SIZE = 10;

export const scaleFont = (size: number) => {
  const scaledFontSize =
    size *
    (PixelRatio.getFontScale() <= MAX_FONT_SCALING
      ? PixelRatio.getFontScale()
      : MAX_FONT_SCALING);
  if (scaledFontSize < MIN_FONT_SIZE) {
    return MIN_FONT_SIZE;
  }

  return scaledFontSize;
};

const KANIT = "Kanit";
const KANIT_BOLD = "KanitBold";

export const FONT_SIZE_32 = scaleFont(32);
export const FONT_SIZE_28 = scaleFont(28);
export const FONT_SIZE_24 = scaleFont(24);
export const FONT_SIZE_18 = scaleFont(18);
export const FONT_SIZE_16 = scaleFont(16);
export const FONT_SIZE_14 = scaleFont(14);
export const FONT_SIZE_12 = scaleFont(12);

export const LINE_HEIGHT_32 = scaleFont(32);
export const LINE_HEIGHT_28 = scaleFont(28);
export const LINE_HEIGHT_24 = scaleFont(24);
export const LINE_HEIGHT_16 = scaleFont(16);
export const HEADER_TEXT = StyleSheet.create({
  font: {
    fontFamily: KANIT_BOLD,
    fontSize: FONT_SIZE_24,
    lineHeight: LINE_HEIGHT_32,
    fontWeight: "bold",
  },
});

export const SUB_HEADER_TEXT = StyleSheet.create({
  font: {
    fontFamily: KANIT_BOLD,
    fontSize: FONT_SIZE_18,
    lineHeight: LINE_HEIGHT_28,
    color: TEXT.SOFT_WHITE,
    fontWeight: "bold",
  },
});

export const BUTTON_TEXT = {
  fontFamily: KANIT,
  fontSize: FONT_SIZE_18,
  lineHeight: LINE_HEIGHT_24,
};

export const BODY_TEXT = {
  fontFamily: KANIT,
  fontSize: FONT_SIZE_16,
  lineHeight: LINE_HEIGHT_24,
};

export const HYPERLINK_TEXT = StyleSheet.create({
  font: {
    color: TEXT.SOFT_WHITE,
    fontSize: FONT_SIZE_14,
    fontFamily: KANIT_BOLD,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});

export const SMALL_TEXT = StyleSheet.create({
  font: {
    ...BODY_TEXT,
    fontFamily: KANIT,
    fontSize: FONT_SIZE_12,
    lineHeight: LINE_HEIGHT_16,
  },
});
