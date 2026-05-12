import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const fontSize = {
  xs2:  10,
  xs:   11,
  sm2:  12,
  sm:   13,
  md:   14,
  lg:   16,
  xl:   18,
  xl2:  20,
  xl3:  22,
  xl4:  28,
  xl5:  34,
  xl6:  48,
  xl7:  54,
} as const;

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  extrabold:'800' as const,
};

export const textStyles = {
  hero: {
    fontSize: fontSize.xl7,
    fontWeight: fontWeight.extrabold,
    lineHeight: 60,
  },
  h1: {
    fontSize: fontSize.xl5,
    fontWeight: fontWeight.extrabold,
    lineHeight: 42,
  },
  h2: {
    fontSize: fontSize.xl4,
    fontWeight: fontWeight.bold,
    lineHeight: 34,
  },
  h3: {
    fontSize: fontSize.xl3,
    fontWeight: fontWeight.bold,
    lineHeight: 28,
  },
  h4: {
    fontSize: fontSize.xl2,
    fontWeight: fontWeight.semibold,
    lineHeight: 26,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 22,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  bodyMd: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  small: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: 18,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: 16,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};
