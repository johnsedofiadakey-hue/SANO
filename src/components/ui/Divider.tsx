import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  vertical?: number;
}

export function Divider({ style, color, vertical }: DividerProps) {
  return (
    <View
      style={[
        styles.divider,
        { borderBottomColor: color ?? colors.bdr },
        vertical !== undefined && { marginVertical: vertical },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
});
