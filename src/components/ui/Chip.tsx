import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  selectedColor?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Chip({
  label,
  selected = false,
  onPress,
  color = colors.pur,
  selectedColor,
}: ChipProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 180 });
  }, [selected, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.04 : 1, { damping: 12 }) }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', selectedColor ?? `${color}18`]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.bdr, color]
    ),
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, animatedStyle]}
    >
      <Text style={[styles.label, { color: selected ? color : colors.t3 }]}>
        {label}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
