import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, GRADIENT, spacing, radius, shadows } from '../../theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientCard({
  children,
  style,
  gradientColors = GRADIENT,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientCardProps) {
  return (
    <View style={[shadows.pur, styles.shadow]}>
      <LinearGradient
        colors={[...gradientColors]}
        start={start}
        end={end}
        style={[styles.card, style]}
      >
        {/* Decorative orbs — subtle light effects */}
        <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
        <View style={[styles.orb, styles.orb2]} pointerEvents="none" />
        <View style={[styles.orb, styles.orb3]} pointerEvents="none" />
        {/* Shimmer line */}
        <View style={styles.shimmer} pointerEvents="none" />
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.xl2,
  },
  card: {
    borderRadius: radius.xl2,
    padding: spacing.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    borderRadius: radius.full,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -60,
    right: -50,
  },
  orb2: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -30,
    left: -30,
  },
  orb3: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 40,
    right: 100,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderTopLeftRadius: radius.xl2,
    borderTopRightRadius: radius.xl2,
  },
});
