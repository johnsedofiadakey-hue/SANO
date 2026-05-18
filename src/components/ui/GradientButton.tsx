import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, GRADIENT, GRADIENT_PINK, GRADIENT_DISABLED, spacing, radius, fontSize, fontWeight } from '../../theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'pink';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GradientButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[animatedStyle, styles.shadow]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[styles.base, style]}
        >
          <LinearGradient
            colors={disabled ? [...GRADIENT_DISABLED] : [...GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                {icon}
                <Text style={[styles.labelPrimary, textStyle]}>{label}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'pink') {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[styles.base, style]}
        >
          <LinearGradient
            colors={[...GRADIENT_PINK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                {icon}
                <Text style={[styles.labelPrimary, textStyle]}>{label}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'outline') {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={[styles.base, styles.outlineBtn, style]}
        >
          {loading ? (
            <ActivityIndicator color={colors.pur} size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.labelOutline, textStyle]}>{label}</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[styles.base, style]}
      >
        {loading ? (
          <ActivityIndicator color={colors.pur} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.labelGhost, textStyle]}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  shadow: {
    shadowColor: colors.pur,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: radius.lg,
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: colors.pur,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
    backgroundColor: 'transparent',
  },
  labelPrimary: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  labelOutline: {
    color: colors.pur,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  labelGhost: {
    color: colors.t2,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
});
