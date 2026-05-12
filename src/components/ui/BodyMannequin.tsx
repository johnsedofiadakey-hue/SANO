import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Ellipse,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export type BodyZone =
  | 'face'
  | 'neck'
  | 'chest'
  | 'arms'
  | 'belly'
  | 'legs'
  | 'scalp';

interface BodyZoneConfig {
  label: string;
  description: string;
}

export const BODY_ZONES: Record<BodyZone, BodyZoneConfig> = {
  face:  { label: 'Face',  description: 'Cheeks, forehead, chin, nose' },
  neck:  { label: 'Neck',  description: 'Front and sides of neck' },
  chest: { label: 'Chest', description: 'Chest and décolletage' },
  arms:  { label: 'Arms',  description: 'Upper arms and forearms' },
  belly: { label: 'Belly', description: 'Abdomen and stomach' },
  legs:  { label: 'Legs',  description: 'Thighs and lower legs' },
  scalp: { label: 'Scalp', description: 'Scalp and hairline' },
};

interface BodyMannequinProps {
  selected: BodyZone | null;
  onSelect: (zone: BodyZone) => void;
}

const FILL_IDLE = '#EDE8FF';
const FILL_ACTIVE = '#7C3AED';
const STROKE_IDLE = '#D4C6FF';

export function BodyMannequin({ selected, onSelect }: BodyMannequinProps) {
  const zoneColor = (zone: BodyZone) =>
    selected === zone ? FILL_ACTIVE : FILL_IDLE;
  const zoneStroke = (zone: BodyZone) =>
    selected === zone ? '#5B21B6' : STROKE_IDLE;

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 200 420" width={180} height={380}>
        <Defs>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7C3AED" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#EC4899" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* SCALP */}
        <TouchableOpacity onPress={() => onSelect('scalp')}>
          <Ellipse
            cx="100" cy="42" rx="30" ry="8"
            fill={zoneColor('scalp')}
            stroke={zoneStroke('scalp')}
            strokeWidth="1.5"
          />
        </TouchableOpacity>

        {/* FACE */}
        <TouchableOpacity onPress={() => onSelect('face')}>
          <Ellipse
            cx="100" cy="65" rx="26" ry="30"
            fill={zoneColor('face')}
            stroke={zoneStroke('face')}
            strokeWidth="1.5"
          />
        </TouchableOpacity>

        {/* NECK */}
        <TouchableOpacity onPress={() => onSelect('neck')}>
          <Path
            d="M90 93 L110 93 L112 118 L88 118 Z"
            fill={zoneColor('neck')}
            stroke={zoneStroke('neck')}
            strokeWidth="1.5"
          />
        </TouchableOpacity>

        {/* CHEST */}
        <TouchableOpacity onPress={() => onSelect('chest')}>
          <Path
            d="M72 118 L128 118 L134 175 L66 175 Z"
            fill={zoneColor('chest')}
            stroke={zoneStroke('chest')}
            strokeWidth="1.5"
          />
        </TouchableOpacity>

        {/* ARMS */}
        <TouchableOpacity onPress={() => onSelect('arms')}>
          <Path
            d="M66 120 L48 120 L40 200 L58 200 L66 175 Z"
            fill={zoneColor('arms')}
            stroke={zoneStroke('arms')}
            strokeWidth="1.5"
          />
          <Path
            d="M134 120 L152 120 L160 200 L142 200 L134 175 Z"
            fill={zoneColor('arms')}
            stroke={zoneStroke('arms')}
            strokeWidth="1.5"
          />
        </TouchableOpacity>

        {/* BELLY */}
        <TouchableOpacity onPress={() => onSelect('belly')}>
          <Path
            d="M66 175 L134 175 L130 230 L70 230 Z"
            fill={zoneColor('belly')}
            stroke={zoneStroke('belly')}
            strokeWidth="1.5"
          />
        </TouchableOpacity>

        {/* LEGS */}
        <TouchableOpacity onPress={() => onSelect('legs')}>
          <Path
            d="M70 230 L100 230 L98 380 L72 380 Z"
            fill={zoneColor('legs')}
            stroke={zoneStroke('legs')}
            strokeWidth="1.5"
          />
          <Path
            d="M100 230 L130 230 L128 380 L102 380 Z"
            fill={zoneColor('legs')}
            stroke={zoneStroke('legs')}
            strokeWidth="1.5"
          />
        </TouchableOpacity>

        {/* Glow overlay for selected */}
        {selected === 'face' && (
          <Ellipse cx="100" cy="65" rx="26" ry="30" fill="url(#glowGrad)" opacity="0.5" />
        )}
      </Svg>

      {/* Zone labels */}
      <View style={styles.labels}>
        {(Object.keys(BODY_ZONES) as BodyZone[]).map(zone => (
          <TouchableOpacity
            key={zone}
            onPress={() => onSelect(zone)}
            style={[styles.label, selected === zone && styles.labelActive]}
          >
            <Text style={[styles.labelText, selected === zone && styles.labelTextActive]}>
              {BODY_ZONES[zone].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  label: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: colors.bdr,
    backgroundColor: colors.bg2,
  },
  labelActive: {
    borderColor: colors.pur,
    backgroundColor: colors.purMid,
  },
  labelText: {
    fontSize: fontSize.sm,
    color: colors.t3,
    fontWeight: fontWeight.medium,
  },
  labelTextActive: {
    color: colors.pur,
    fontWeight: fontWeight.bold,
  },
});
