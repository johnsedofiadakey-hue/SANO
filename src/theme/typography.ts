import { Platform } from 'react-native';

// Inter on iOS/Android via @expo-google-fonts/inter
// Falls back to SF Pro (iOS) / Roboto (Android) gracefully
export const fontFamily = {
  regular:   Platform.select({ ios: 'Inter_400Regular', android: 'Inter_400Regular', default: 'System' }),
  medium:    Platform.select({ ios: 'Inter_500Medium',  android: 'Inter_500Medium',  default: 'System' }),
  semibold:  Platform.select({ ios: 'Inter_600SemiBold', android: 'Inter_600SemiBold', default: 'System' }),
  bold:      Platform.select({ ios: 'Inter_700Bold',    android: 'Inter_700Bold',    default: 'System' }),
  extrabold: Platform.select({ ios: 'Inter_800ExtraBold', android: 'Inter_800ExtraBold', default: 'System' }),
};

export const fontSize = {
  xs2:  10,
  xs:   11,
  sm2:  12,
  sm:   13,
  md:   15,    // bumped from 14 — more readable
  lg:   17,    // bumped from 16
  xl:   19,
  xl2:  22,
  xl3:  24,
  xl4:  30,
  xl5:  36,
  xl6:  48,
  xl7:  56,
} as const;

export const fontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

export const lineHeight = {
  tight:  1.15,
  normal: 1.45,
  relaxed: 1.65,
} as const;

export const letterSpacing = {
  tight:   -0.5,
  normal:  0,
  wide:    0.3,
  wider:   0.8,
  widest:  1.4,
} as const;

export const textStyles = {
  hero: {
    fontSize: fontSize.xl7,
    fontWeight: fontWeight.extrabold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 62,
  },
  h1: {
    fontSize: fontSize.xl5,
    fontWeight: fontWeight.extrabold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 42,
  },
  h2: {
    fontSize: fontSize.xl4,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: 36,
  },
  h3: {
    fontSize: fontSize.xl3,
    fontWeight: fontWeight.bold,
    lineHeight: 30,
  },
  h4: {
    fontSize: fontSize.xl2,
    fontWeight: fontWeight.semibold,
    lineHeight: 28,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 22,
  },
  bodyMd: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: 22,
  },
  small: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: 19,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: 16,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontSize: fontSize.sm,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    lineHeight: 18,
  },
};
