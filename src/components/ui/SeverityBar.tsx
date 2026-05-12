import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, GRADIENT, spacing, radius, fontSize, fontWeight } from '../../theme';

interface SeverityBarProps {
  label: string;
  value: number; // 0 to 1
  showPercent?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function SeverityBar({ label, value, showPercent = true }: SeverityBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(value * 100, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showPercent && (
          <Text style={styles.percent}>{Math.round(value * 100)}%</Text>
        )}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.barWrapper, barStyle]}>
          <LinearGradient
            colors={[...GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bar}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.t2,
    fontWeight: fontWeight.medium,
  },
  percent: {
    fontSize: fontSize.sm,
    color: colors.pur,
    fontWeight: fontWeight.bold,
  },
  track: {
    height: 8,
    backgroundColor: colors.bg3,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barWrapper: {
    height: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    borderRadius: radius.full,
  },
});
