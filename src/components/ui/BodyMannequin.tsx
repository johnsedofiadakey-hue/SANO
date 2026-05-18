import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse, Defs, LinearGradient as SvgLinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme';
import { ZONE_PROFILES, getZonesForGender } from '../../data/zoneProfiles';
import type { BodyZone } from '../../data/zoneProfiles';

export type { BodyZone };
export { ZONE_PROFILES as BODY_ZONES };

interface BodyMannequinProps {
  selected: BodyZone | null;
  onSelect: (zone: BodyZone) => void;
  gender?: 'male' | 'female' | 'other' | null;
}

const FILL_IDLE = colors.bg3;
const FILL_ACTIVE = colors.purGlow;
const STROKE_IDLE = colors.bdrMid;
const STROKE_ACTIVE = colors.purStr;

function MaleFrontSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 420" width={160} height={340}>
      <Defs>
        <SvgLinearGradient id="glowM" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.purGlow} stopOpacity="0.4" />
          <Stop offset="1" stopColor={colors.pink} stopOpacity="0.4" />
        </SvgLinearGradient>
      </Defs>

      {/* SCALP */}
      <G onPress={() => onSelect('scalp')}>
        <Ellipse cx="100" cy="36" rx="28" ry="7" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
      </G>

      {/* FACE */}
      <G onPress={() => onSelect('face')}>
        <Ellipse cx="100" cy="60" rx="24" ry="27" fill={f('face')} stroke={s('face')} strokeWidth="1.5" />
      </G>

      {/* BEARD zone — lower face/jaw */}
      <G onPress={() => onSelect('beard')}>
        <Path
          d="M80 75 Q100 95 120 75 L118 90 Q100 105 82 90 Z"
          fill={f('beard')} stroke={s('beard')} strokeWidth="1.5"
        />
      </G>

      {/* NECK */}
      <G onPress={() => onSelect('neck')}>
        <Path d="M91 87 L109 87 L111 112 L89 112 Z" fill={f('neck')} stroke={s('neck')} strokeWidth="1.5" />
      </G>

      {/* CHEST — broad male shoulders */}
      <G onPress={() => onSelect('chest')}>
        <Path d="M62 112 L138 112 L140 170 L60 170 Z" fill={f('chest')} stroke={s('chest')} strokeWidth="1.5" />
      </G>

      {/* LEFT ARM */}
      <G onPress={() => onSelect('arms')}>
        <Path d="M62 114 L44 116 L36 195 L54 193 L62 170 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
        {/* RIGHT ARM */}
        <Path d="M138 114 L156 116 L164 195 L146 193 L138 170 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
      </G>

      {/* BELLY */}
      <G onPress={() => onSelect('belly')}>
        <Path d="M60 170 L140 170 L136 225 L64 225 Z" fill={f('belly')} stroke={s('belly')} strokeWidth="1.5" />
      </G>

      {/* LEGS */}
      <G onPress={() => onSelect('legs')}>
        <Path d="M64 225 L98 225 L96 390 L66 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
        <Path d="M102 225 L136 225 L134 390 L104 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
      </G>

      {selected && <G><Ellipse cx="100" cy="60" rx="24" ry="27" fill="url(#glowM)" opacity="0.3" /></G>}
    </Svg>
  );
}

function MaleBackSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 420" width={160} height={340}>
      {/* SCALP back */}
      <G onPress={() => onSelect('scalp')}>
        <Ellipse cx="100" cy="36" rx="28" ry="7" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
        <Ellipse cx="100" cy="60" rx="24" ry="27" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
      </G>

      {/* NECK back */}
      <G onPress={() => onSelect('neck')}>
        <Path d="M91 87 L109 87 L111 112 L89 112 Z" fill={f('neck')} stroke={s('neck')} strokeWidth="1.5" />
      </G>

      {/* BACK — main zone */}
      <G onPress={() => onSelect('back')}>
        <Path d="M62 112 L138 112 L140 225 L60 225 Z" fill={f('back')} stroke={s('back')} strokeWidth="2" />
        <SvgText x="100" y="175" textAnchor="middle" fontSize="11" fill={selected === 'back' ? colors.white : colors.t3} fontWeight="bold">BACK</SvgText>
      </G>

      {/* ARMS back */}
      <G onPress={() => onSelect('arms')}>
        <Path d="M62 114 L44 116 L36 195 L54 193 L62 170 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
        <Path d="M138 114 L156 116 L164 195 L146 193 L138 170 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
      </G>

      {/* LEGS back */}
      <G onPress={() => onSelect('legs')}>
        <Path d="M64 225 L98 225 L96 390 L66 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
        <Path d="M102 225 L136 225 L134 390 L104 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

function FemaleFrontSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 420" width={160} height={340}>
      <Defs>
        <SvgLinearGradient id="glowF" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.purGlow} stopOpacity="0.4" />
          <Stop offset="1" stopColor={colors.pink} stopOpacity="0.4" />
        </SvgLinearGradient>
      </Defs>

      {/* SCALP */}
      <G onPress={() => onSelect('scalp')}>
        <Ellipse cx="100" cy="34" rx="26" ry="9" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
      </G>

      {/* FACE — slightly rounder */}
      <G onPress={() => onSelect('face')}>
        <Ellipse cx="100" cy="60" rx="23" ry="28" fill={f('face')} stroke={s('face')} strokeWidth="1.5" />
      </G>

      {/* NECK */}
      <G onPress={() => onSelect('neck')}>
        <Path d="M92 87 L108 87 L110 112 L90 112 Z" fill={f('neck')} stroke={s('neck')} strokeWidth="1.5" />
      </G>

      {/* CHEST — female with breast contour, slightly narrower shoulders */}
      <G onPress={() => onSelect('chest')}>
        <Path
          d="M68 112 L132 112 L134 155 Q118 170 100 170 Q82 170 66 155 Z"
          fill={f('chest')} stroke={s('chest')} strokeWidth="1.5"
        />
        {/* Subtle breast contour lines */}
        <Path d="M82 138 Q90 155 100 155 Q110 155 118 138" fill="none" stroke={selected === 'chest' ? colors.purStr : `${STROKE_IDLE}88`} strokeWidth="1" />
      </G>

      {/* ARMS — slightly slimmer */}
      <G onPress={() => onSelect('arms')}>
        <Path d="M68 114 L50 116 L42 192 L58 190 L66 158 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
        <Path d="M132 114 L150 116 L158 192 L142 190 L134 158 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
      </G>

      {/* BELLY — wider hips */}
      <G onPress={() => onSelect('belly')}>
        <Path d="M66 155 Q100 170 134 155 L138 225 L62 225 Z" fill={f('belly')} stroke={s('belly')} strokeWidth="1.5" />
      </G>

      {/* LEGS — slightly closer together */}
      <G onPress={() => onSelect('legs')}>
        <Path d="M62 225 L97 225 L95 390 L67 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
        <Path d="M103 225 L138 225 L133 390 L105 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
      </G>

      {selected && <G><Ellipse cx="100" cy="60" rx="23" ry="28" fill="url(#glowF)" opacity="0.3" /></G>}
    </Svg>
  );
}

function FemaleBackSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 420" width={160} height={340}>
      <G onPress={() => onSelect('scalp')}>
        <Ellipse cx="100" cy="34" rx="26" ry="9" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
        <Ellipse cx="100" cy="60" rx="23" ry="28" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
      </G>
      <G onPress={() => onSelect('neck')}>
        <Path d="M92 87 L108 87 L110 112 L90 112 Z" fill={f('neck')} stroke={s('neck')} strokeWidth="1.5" />
      </G>
      <G onPress={() => onSelect('back')}>
        <Path d="M68 112 L132 112 L138 225 L62 225 Z" fill={f('back')} stroke={s('back')} strokeWidth="2" />
      </G>
      <G onPress={() => onSelect('arms')}>
        <Path d="M68 114 L50 116 L42 192 L58 190 L66 158 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
        <Path d="M132 114 L150 116 L158 192 L142 190 L134 158 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
      </G>
      <G onPress={() => onSelect('legs')}>
        <Path d="M62 225 L97 225 L95 390 L67 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
        <Path d="M103 225 L138 225 L133 390 L105 390 Z" fill={f('legs')} stroke={s('legs')} strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

export function BodyMannequin({ selected, onSelect, gender }: BodyMannequinProps) {
  const [showBack, setShowBack] = useState(false);
  const availableZones = getZonesForGender(gender ?? null);

  const handleSelect = (zone: BodyZone) => {
    if (availableZones.includes(zone)) onSelect(zone);
  };

  const renderFront = () => {
    if (gender === 'female') return <FemaleFrontSvg selected={selected} onSelect={handleSelect} />;
    return <MaleFrontSvg selected={selected} onSelect={handleSelect} />;
  };

  const renderBack = () => {
    if (gender === 'female') return <FemaleBackSvg selected={selected} onSelect={handleSelect} />;
    return <MaleBackSvg selected={selected} onSelect={handleSelect} />;
  };

  return (
    <View style={styles.container}>
      {/* Front / Back toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, !showBack && styles.toggleBtnActive]}
          onPress={() => setShowBack(false)}
        >
          <Text style={[styles.toggleText, !showBack && styles.toggleTextActive]}>Front</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showBack && styles.toggleBtnActive]}
          onPress={() => setShowBack(true)}
        >
          <Text style={[styles.toggleText, showBack && styles.toggleTextActive]}>Back</Text>
        </TouchableOpacity>
      </View>

      {showBack ? renderBack() : renderFront()}

      {/* Zone chips */}
      <View style={styles.labels}>
        {availableZones
          .filter(z => showBack ? ['scalp', 'neck', 'back', 'arms', 'legs'].includes(z) : !['back'].includes(z))
          .map(zone => (
            <TouchableOpacity
              key={zone}
              onPress={() => handleSelect(zone)}
              style={[styles.label, selected === zone && styles.labelActive]}
            >
              <Text style={[styles.labelText, selected === zone && styles.labelTextActive]}>
                {ZONE_PROFILES[zone].label}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg2,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  toggleBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radius.full },
  toggleBtnActive: { backgroundColor: colors.pur },
  toggleText: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },
  toggleTextActive: { color: colors.white, fontWeight: fontWeight.bold },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  label: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1.5,
    borderColor: colors.bdr, backgroundColor: colors.bg2,
  },
  labelActive: { borderColor: colors.pur, backgroundColor: colors.purMid },
  labelText: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },
  labelTextActive: { color: colors.pur, fontWeight: fontWeight.bold },
});
