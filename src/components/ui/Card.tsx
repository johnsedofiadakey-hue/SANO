import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, radius, shadows } from '../../theme';

type CardVariant = 'white' | 'tint' | 'sand' | 'glass';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  elevated?: boolean;
}

export function Card({ children, variant = 'white', style, noPadding, elevated = false }: CardProps) {
  const bgColor = {
    white: colors.white,
    tint:  colors.bg2,
    sand:  colors.bg3,
    glass: 'rgba(255,255,255,0.85)',
  }[variant];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bgColor },
        elevated && shadows.sm,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.bdr,
    padding: spacing.lg,
  },
  noPadding: {
    padding: 0,
  },
});
