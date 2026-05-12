import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme';

interface LabelProps {
  children: string;
  color?: string;
  style?: TextStyle;
}

export function Label({ children, color, style }: LabelProps) {
  return (
    <Text style={[styles.label, { color: color ?? colors.t3 }, style]}>
      {children.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
