import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, GRADIENT, spacing, radius } from '../../theme';

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
    <LinearGradient
      colors={[...gradientColors]}
      start={start}
      end={end}
      style={[styles.card, style]}
    >
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} pointerEvents="none" />
      <View style={[styles.circle, styles.circle2]} pointerEvents="none" />
      <View style={[styles.circle, styles.circle3]} pointerEvents="none" />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    width: 160,
    height: 160,
    top: -40,
    right: -40,
  },
  circle2: {
    width: 100,
    height: 100,
    bottom: -20,
    left: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 30,
    right: 80,
  },
});
