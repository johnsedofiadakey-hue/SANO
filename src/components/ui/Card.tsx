import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, radius } from '../../theme';

type CardVariant = 'white' | 'tint' | 'sand';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export function Card({ children, variant = 'white', style, noPadding }: CardProps) {
  const bgColor = {
    white: colors.white,
    tint:  colors.bg2,
    sand:  colors.bg3,
  }[variant];

  return (
    <View style={[styles.card, { backgroundColor: bgColor }, noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bdr,
    padding: spacing.lg,
  },
  noPadding: {
    padding: 0,
  },
});
