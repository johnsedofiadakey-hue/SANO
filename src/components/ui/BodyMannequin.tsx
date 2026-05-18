import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';
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

const FILL_IDLE     = colors.bg3;
const FILL_ACTIVE   = colors.purGlow;
const STROKE_IDLE   = colors.bdrMid;
const STROKE_ACTIVE = colors.purStr;
const DETAIL        = colors.t3 + '70';
const HAIR_M        = '#3D2E5E';
const HAIR_F        = '#2C1F4A';

// ─────────────────────────────────────────────────────────────────────────────
// MALE FRONT
// ─────────────────────────────────────────────────────────────────────────────
function MaleFrontSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 460" width={160} height={368}>
      <Defs>
        <SvgLinearGradient id="glowMF" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.purGlow} stopOpacity="0.3" />
          <Stop offset="1" stopColor={colors.pink} stopOpacity="0.3" />
        </SvgLinearGradient>
      </Defs>

      {/* ── 1. LEGS ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        {/* Left leg */}
        <Path
          d="M 68 242
             C 64 242 61 248 60 256
             C 58 270 57 290 57 310
             C 56 330 56 350 57 368
             C 57 378 58 388 60 396
             C 61 402 63 406 66 408
             C 70 410 74 410 77 408
             C 80 406 82 402 83 396
             C 84 386 84 374 83 360
             C 82 344 82 328 82 312
             C 83 296 83 278 82 262
             C 82 254 80 248 77 244
             C 75 242 72 242 68 242 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Right leg */}
        <Path
          d="M 132 242
             C 128 242 125 242 123 244
             C 120 248 118 254 118 262
             C 117 278 117 296 118 312
             C 118 328 118 344 117 360
             C 116 374 116 386 117 396
             C 118 402 120 406 123 408
             C 126 410 130 410 134 408
             C 137 406 139 402 140 396
             C 142 388 143 378 143 368
             C 144 350 144 330 143 310
             C 143 290 142 270 140 256
             C 139 248 136 242 132 242 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Quad detail lines — left thigh */}
        <Path d="M 64 265 C 66 280 67 295 67 310" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 76 262 C 77 278 77 295 77 312" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Quad detail lines — right thigh */}
        <Path d="M 124 262 C 123 278 123 295 123 312" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 136 265 C 134 280 133 295 133 310" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Kneecap left */}
        <Path d="M 61 318 C 61 312 64 308 70 308 C 76 308 79 312 79 318 C 79 324 76 328 70 328 C 64 328 61 324 61 318 Z" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Kneecap right */}
        <Path d="M 121 318 C 121 312 124 308 130 308 C 136 308 139 312 139 318 C 139 324 136 328 130 328 C 124 328 121 324 121 318 Z" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Calf gastrocnemius — left */}
        <Path d="M 59 338 C 57 350 58 362 61 372" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Calf gastrocnemius — right */}
        <Path d="M 141 338 C 143 350 142 362 139 372" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
      </G>

      {/* ── 2. FEET ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        {/* Left foot */}
        <Path
          d="M 60 406 C 59 412 58 418 57 422 C 55 428 52 432 54 436 C 56 440 62 440 68 440 C 74 440 80 440 84 438 C 88 436 90 432 88 426 C 86 420 84 414 83 408 C 80 410 74 410 68 408 C 65 408 62 407 60 406 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Right foot */}
        <Path
          d="M 140 406 C 138 407 135 408 132 408 C 126 410 120 410 117 408 C 116 414 114 420 112 426 C 110 432 112 436 116 438 C 120 440 126 440 132 440 C 138 440 144 440 146 436 C 148 432 145 428 143 422 C 142 418 141 412 140 406 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
      </G>

      {/* ── 3. BELLY / LOWER TORSO ──────────────────────────────────── */}
      <G onPress={() => onSelect('belly')}>
        <Path
          d="M 71 182
             C 69 192 68 202 68 212
             C 67 222 67 232 68 242
             L 132 242
             C 133 232 133 222 132 212
             C 132 202 131 192 129 182
             C 120 186 110 188 100 188
             C 90 188 80 186 71 182 Z"
          fill={f('belly')} stroke={s('belly')} strokeWidth="1.5"
        />
        {/* Abs grid — 3 rows × 2 cols */}
        {/* Vertical center line */}
        <Path d="M 100 152 L 100 186" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Row 1 horizontal */}
        <Path d="M 88 158 C 92 160 96 161 100 161 C 104 161 108 160 112 158" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Row 2 horizontal */}
        <Path d="M 87 170 C 91 172 95 173 100 173 C 105 173 109 172 113 170" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Row 3 horizontal */}
        <Path d="M 87 181 C 91 183 95 184 100 184 C 105 184 109 183 113 181" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Left pec outline arc */}
        <Path d="M 88 148 C 86 154 87 160 90 163 C 94 166 100 166 100 166" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Right pec outline arc */}
        <Path d="M 112 148 C 114 154 113 160 110 163 C 106 166 100 166 100 166" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Oblique diagonal lines */}
        <Path d="M 72 188 C 74 196 76 204 77 212" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        <Path d="M 128 188 C 126 196 124 204 123 212" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        {/* Navel dot */}
        <Circle cx="100" cy="195" r="2" fill="none" stroke={DETAIL} strokeWidth="1.1" opacity="0.5" />
        {/* Hip V-line (adonis belt) */}
        <Path d="M 78 218 C 84 222 92 226 100 226 C 108 226 116 222 122 218" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.4" />
        <Path d="M 84 224 L 100 234 L 116 224" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
      </G>

      {/* ── 4. CHEST / UPPER TORSO ──────────────────────────────────── */}
      <G onPress={() => onSelect('chest')}>
        <Path
          d="M 100 112
             C 112 112 122 112 130 114
             C 140 116 148 120 152 124
             C 156 128 158 134 158 140
             C 158 148 154 156 148 162
             C 142 168 134 172 126 176
             C 118 180 110 182 100 182
             C 90 182 82 180 74 176
             C 66 172 58 168 52 162
             C 46 156 42 148 42 140
             C 42 134 44 128 48 124
             C 52 120 60 116 70 114
             C 78 112 88 112 100 112 Z"
          fill={f('chest')} stroke={s('chest')} strokeWidth="1.5"
        />
        {/* Clavicle arcs */}
        <Path d="M 100 120 C 108 118 118 118 128 122 C 136 125 144 130 148 136" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.5" />
        <Path d="M 100 120 C 92 118 82 118 72 122 C 64 125 56 130 52 136" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.5" />
        {/* Sternum center line */}
        <Path d="M 100 124 L 100 152" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Neck sternocleidomastoid lines */}
        <Path d="M 91 100 C 88 106 86 112 87 118 C 88 122 92 124 96 124" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.4" />
        <Path d="M 109 100 C 112 106 114 112 113 118 C 112 122 108 124 104 124" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.4" />
      </G>

      {/* ── 5. ARMS ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('arms')}>
        {/* Left arm */}
        <Path
          d="M 48 124
             C 44 128 40 134 37 142
             C 34 150 32 160 32 170
             C 31 182 32 194 34 204
             C 36 212 40 218 44 220
             C 48 222 52 220 55 216
             C 58 212 60 206 61 198
             C 62 188 62 178 62 168
             C 62 158 62 148 62 140
             C 62 132 60 126 56 122
             C 54 120 51 122 48 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        {/* Right arm */}
        <Path
          d="M 152 124
             C 149 122 146 120 144 122
             C 140 126 138 132 138 140
             C 138 148 138 158 138 168
             C 138 178 138 188 139 198
             C 140 206 142 212 145 216
             C 148 220 152 222 156 220
             C 160 218 164 212 166 204
             C 168 194 169 182 168 170
             C 168 160 166 150 163 142
             C 160 134 156 128 152 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        {/* Bicep contour — left */}
        <Path d="M 36 158 C 34 166 34 174 36 182" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Bicep contour — right */}
        <Path d="M 164 158 C 166 166 166 174 164 182" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Forearm muscle — left */}
        <Path d="M 37 196 C 38 202 40 208 42 212" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        {/* Forearm muscle — right */}
        <Path d="M 163 196 C 162 202 160 208 158 212" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
      </G>

      {/* ── 6. HANDS ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('arms')}>
        {/* Left hand */}
        <Path
          d="M 40 218
             C 38 224 36 230 35 236
             C 34 242 34 248 36 252
             C 38 256 42 258 46 256
             C 48 254 50 250 51 244
             C 52 238 52 232 52 226
             C 52 222 50 220 48 220
             C 45 220 42 218 40 218 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        {/* Right hand */}
        <Path
          d="M 160 218
             C 158 218 155 220 152 220
             C 150 220 148 222 148 226
             C 148 232 148 238 149 244
             C 150 250 152 254 154 256
             C 158 258 162 256 164 252
             C 166 248 166 242 165 236
             C 164 230 162 224 160 218 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
      </G>

      {/* ── 7. NECK ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('neck')}>
        <Path
          d="M 88 88
             C 88 90 88 94 88 98
             C 88 102 88 106 88 110
             C 88 112 90 114 92 115
             C 94 116 97 116 100 116
             C 103 116 106 116 108 115
             C 110 114 112 112 112 110
             C 112 106 112 102 112 98
             C 112 94 112 90 112 88
             C 108 92 104 94 100 94
             C 96 94 92 92 88 88 Z"
          fill={f('neck')} stroke={s('neck')} strokeWidth="1.5"
        />
      </G>

      {/* ── 8. HEAD BASE ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('face')}>
        <Path
          d="M 100 12
             C 120 10 134 22 134 40
             C 134 56 128 66 122 74
             C 116 82 108 88 100 90
             C 92 88 84 82 78 74
             C 72 66 66 56 66 40
             C 66 22 80 10 100 12 Z"
          fill={f('face')} stroke={s('face')} strokeWidth="1.5"
        />
        {/* Left ear */}
        <Path d="M 66 42 C 62 38 60 44 60 50 C 60 56 62 60 66 58" fill={f('face')} stroke={s('face')} strokeWidth="1.5" />
        {/* Right ear */}
        <Path d="M 134 42 C 138 38 140 44 140 50 C 140 56 138 60 134 58" fill={f('face')} stroke={s('face')} strokeWidth="1.5" />
        {/* Nose bridge */}
        <Path d="M 97 38 L 96 52" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.35" />
        <Path d="M 103 38 L 104 52" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.35" />
        {/* Eyebrow arcs */}
        <Path d="M 80 38 C 84 34 90 34 94 37" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        <Path d="M 106 37 C 110 34 116 34 120 38" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        {/* Jawline curve */}
        <Path d="M 74 64 C 80 76 90 84 100 86 C 110 84 120 76 126 64" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.3" />
      </G>

      {/* ── 9. BEARD OVERLAY ────────────────────────────────────────── */}
      <G onPress={() => onSelect('beard')}>
        <Path
          d="M 74 64
             C 74 70 76 76 78 80
             C 82 86 88 90 92 90
             C 94 90 97 90 100 90
             C 103 90 106 90 108 90
             C 112 90 118 86 122 80
             C 124 76 126 70 126 64
             C 120 68 110 72 100 72
             C 90 72 80 68 74 64 Z"
          fill={selected === 'beard' ? FILL_ACTIVE : 'transparent'}
          stroke={s('beard')} strokeWidth="1.5"
          opacity={selected === 'beard' ? 0.85 : 0.6}
        />
      </G>

      {/* ── 10. SCALP OVERLAY ───────────────────────────────────────── */}
      <G onPress={() => onSelect('scalp')}>
        <Path
          d="M 76 42 C 74 26 80 10 100 10 C 120 10 126 26 124 42
             C 120 30 116 16 108 20 C 104 22 100 24 100 24
             C 100 24 96 22 92 20 C 84 16 80 30 76 42 Z"
          fill={selected === 'scalp' ? FILL_ACTIVE : 'transparent'}
          stroke={selected === 'scalp' ? STROKE_ACTIVE : 'transparent'}
          strokeWidth="1"
          opacity={selected === 'scalp' ? 0.7 : 0}
        />
      </G>

      {/* ── 11. MALE HAIR (drawn last, on top) ──────────────────────── */}
      <Path
        d="M 76 42 C 74 26 80 10 100 10 C 120 10 126 26 124 42
           C 120 30 116 16 108 20 C 104 22 100 24 100 24
           C 100 24 96 22 92 20 C 84 16 80 30 76 42 Z"
        fill={HAIR_M} stroke={HAIR_M} strokeWidth="0.5"
      />
      {/* Temple fade lines left */}
      <Path d="M 72 42 C 70 38 70 34 72 30" fill="none" stroke={HAIR_M} strokeWidth="1" opacity="0.5" />
      <Path d="M 70 46 C 68 42 68 38 70 34" fill="none" stroke={HAIR_M} strokeWidth="0.8" opacity="0.3" />
      {/* Temple fade lines right */}
      <Path d="M 128 42 C 130 38 130 34 128 30" fill="none" stroke={HAIR_M} strokeWidth="1" opacity="0.5" />
      <Path d="M 130 46 C 132 42 132 38 130 34" fill="none" stroke={HAIR_M} strokeWidth="0.8" opacity="0.3" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MALE BACK
// ─────────────────────────────────────────────────────────────────────────────
function MaleBackSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 460" width={160} height={368}>

      {/* ── 1. LEGS BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        {/* Left leg back */}
        <Path
          d="M 68 242
             C 64 242 61 248 60 256
             C 58 270 57 290 57 310
             C 56 330 56 350 57 368
             C 57 378 58 388 60 396
             C 61 402 63 406 66 408
             C 70 410 74 410 77 408
             C 80 406 82 402 83 396
             C 84 386 84 374 83 360
             C 82 344 82 328 82 312
             C 83 296 83 278 82 262
             C 82 254 80 248 77 244
             C 75 242 72 242 68 242 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Right leg back */}
        <Path
          d="M 132 242
             C 128 242 125 242 123 244
             C 120 248 118 254 118 262
             C 117 278 117 296 118 312
             C 118 328 118 344 117 360
             C 116 374 116 386 117 396
             C 118 402 120 406 123 408
             C 126 410 130 410 134 408
             C 137 406 139 402 140 396
             C 142 388 143 378 143 368
             C 144 350 144 330 143 310
             C 143 290 142 270 140 256
             C 139 248 136 242 132 242 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Calf back contour — left */}
        <Path d="M 59 338 C 57 350 58 362 61 372" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 78 338 C 80 350 79 362 76 372" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Calf back contour — right */}
        <Path d="M 122 338 C 120 350 121 362 124 372" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 141 338 C 143 350 142 362 139 372" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
      </G>

      {/* ── 2. FEET BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        <Path
          d="M 60 406 C 59 412 58 418 57 422 C 55 428 52 432 54 436 C 56 440 62 440 68 440 C 74 440 80 440 84 438 C 88 436 90 432 88 426 C 86 420 84 414 83 408 C 80 410 74 410 68 408 C 65 408 62 407 60 406 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        <Path
          d="M 140 406 C 138 407 135 408 132 408 C 126 410 120 410 117 408 C 116 414 114 420 112 426 C 110 432 112 436 116 438 C 120 440 126 440 132 440 C 138 440 144 440 146 436 C 148 432 145 428 143 422 C 142 418 141 412 140 406 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
      </G>

      {/* ── 3. BACK / LOWER TORSO ───────────────────────────────────── */}
      <G onPress={() => onSelect('back')}>
        {/* Lower back + glutes */}
        <Path
          d="M 72 182
             C 70 194 68 208 68 222
             C 68 230 68 236 68 242
             L 132 242
             C 132 236 132 230 132 222
             C 132 208 130 194 128 182
             C 120 186 110 188 100 188
             C 90 188 80 186 72 182 Z"
          fill={f('back')} stroke={s('back')} strokeWidth="1.5"
        />
        {/* Glute definition curves */}
        <Path d="M 72 228 C 78 236 88 240 100 240" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
        <Path d="M 128 228 C 122 236 112 240 100 240" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
      </G>

      {/* ── 4. BACK MAIN ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('back')}>
        <Path
          d="M 100 112
             C 112 112 122 112 130 114
             C 140 116 148 120 152 124
             C 156 128 158 134 158 140
             C 158 148 154 156 148 162
             C 142 168 134 172 126 176
             C 118 180 110 182 100 182
             C 90 182 82 180 74 176
             C 66 172 58 168 52 162
             C 46 156 42 148 42 140
             C 42 134 44 128 48 124
             C 52 120 60 116 70 114
             C 78 112 88 112 100 112 Z"
          fill={f('back')} stroke={s('back')} strokeWidth="1.5"
        />
        {/* Trapezius diamond */}
        <Path d="M 100 116 C 108 118 116 124 120 132 C 116 140 108 144 100 146 C 92 144 84 140 80 132 C 84 124 92 118 100 116 Z" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
        {/* Left scapula / shoulder blade */}
        <Path d="M 74 130 C 70 136 70 146 72 152 C 74 158 80 162 86 160 C 90 158 92 154 92 148 C 92 142 90 136 86 132 C 82 128 78 128 74 130 Z" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
        {/* Right scapula / shoulder blade */}
        <Path d="M 126 130 C 130 128 136 128 140 132 C 144 136 146 142 146 148 C 146 154 144 158 140 160 C 136 162 130 158 128 152 C 126 146 126 136 126 130 Z" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
        {/* Spine center line */}
        <Path d="M 100 120 L 100 180" fill="none" stroke={DETAIL} strokeWidth="0.8" strokeDasharray="3,3" opacity="0.4" />
        {/* Lat bulges — left */}
        <Path d="M 56 140 C 58 150 60 160 62 170" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4" />
        {/* Lat bulges — right */}
        <Path d="M 144 140 C 142 150 140 160 138 170" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.4" />
      </G>

      {/* ── 5. ARMS BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('arms')}>
        <Path
          d="M 48 124
             C 44 128 40 134 37 142
             C 34 150 32 160 32 170
             C 31 182 32 194 34 204
             C 36 212 40 218 44 220
             C 48 222 52 220 55 216
             C 58 212 60 206 61 198
             C 62 188 62 178 62 168
             C 62 158 62 148 62 140
             C 62 132 60 126 56 122
             C 54 120 51 122 48 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        <Path
          d="M 152 124
             C 149 122 146 120 144 122
             C 140 126 138 132 138 140
             C 138 148 138 158 138 168
             C 138 178 138 188 139 198
             C 140 206 142 212 145 216
             C 148 220 152 222 156 220
             C 160 218 164 212 166 204
             C 168 194 169 182 168 170
             C 168 160 166 150 163 142
             C 160 134 156 128 152 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        <Path d="M 40 218 C 38 224 36 230 35 236 C 34 242 34 248 36 252 C 38 256 42 258 46 256 C 48 254 50 250 51 244 C 52 238 52 232 52 226 C 52 222 50 220 48 220 C 45 220 42 218 40 218 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
        <Path d="M 160 218 C 158 218 155 220 152 220 C 150 220 148 222 148 226 C 148 232 148 238 149 244 C 150 250 152 254 154 256 C 158 258 162 256 164 252 C 166 248 166 242 165 236 C 164 230 162 224 160 218 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
        {/* Tricep contour — left */}
        <Path d="M 38 148 C 36 158 36 168 38 178" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Tricep contour — right */}
        <Path d="M 162 148 C 164 158 164 168 162 178" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
      </G>

      {/* ── 6. NECK BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('neck')}>
        <Path
          d="M 88 88
             C 88 90 88 94 88 98
             C 88 102 88 106 88 110
             C 88 112 90 114 92 115
             C 94 116 97 116 100 116
             C 103 116 106 116 108 115
             C 110 114 112 112 112 110
             C 112 106 112 102 112 98
             C 112 94 112 90 112 88
             C 108 92 104 94 100 94
             C 96 94 92 92 88 88 Z"
          fill={f('neck')} stroke={s('neck')} strokeWidth="1.5"
        />
      </G>

      {/* ── 7. HEAD BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('scalp')}>
        <Path
          d="M 100 12
             C 120 10 134 22 134 40
             C 134 56 128 66 122 74
             C 116 82 108 88 100 90
             C 92 88 84 82 78 74
             C 72 66 66 56 66 40
             C 66 22 80 10 100 12 Z"
          fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5"
        />
        {/* Left ear back */}
        <Path d="M 66 42 C 62 38 60 44 60 50 C 60 56 62 60 66 58" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
        {/* Right ear back */}
        <Path d="M 134 42 C 138 38 140 44 140 50 C 140 56 138 60 134 58" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
      </G>

      {/* ── 8. MALE HAIR BACK (drawn last) ──────────────────────────── */}
      {/* Back of head hair — rounder cap shape from behind */}
      <Path
        d="M 72 36 C 70 24 76 10 100 10 C 124 10 130 24 128 36
           C 124 20 112 14 100 14 C 88 14 76 20 72 36 Z"
        fill={HAIR_M} stroke={HAIR_M} strokeWidth="0.5"
      />
      {/* Nape of neck hair taper */}
      <Path d="M 88 86 C 92 84 96 82 100 82 C 104 82 108 84 112 86" fill="none" stroke={HAIR_M} strokeWidth="1.5" opacity="0.6" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEMALE FRONT
// ─────────────────────────────────────────────────────────────────────────────
function FemaleFrontSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 460" width={160} height={368}>
      <Defs>
        <SvgLinearGradient id="glowFF" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.purGlow} stopOpacity="0.3" />
          <Stop offset="1" stopColor={colors.pink} stopOpacity="0.3" />
        </SvgLinearGradient>
      </Defs>

      {/* ── 1. LEGS ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        {/* Left leg — female slightly narrower gap */}
        <Path
          d="M 72 248
             C 68 248 65 253 64 260
             C 62 274 61 292 61 312
             C 60 332 60 352 61 370
             C 61 380 62 390 64 398
             C 65 404 67 408 70 410
             C 74 412 78 412 81 410
             C 84 408 86 404 87 398
             C 88 388 88 376 87 362
             C 86 346 86 330 86 314
             C 87 296 87 278 86 262
             C 86 255 84 249 81 247
             C 79 246 76 246 72 248 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Right leg */}
        <Path
          d="M 128 248
             C 124 246 121 246 119 247
             C 116 249 114 255 114 262
             C 113 278 113 296 114 314
             C 114 330 114 346 113 362
             C 112 376 112 388 113 398
             C 114 404 116 408 119 410
             C 122 412 126 412 130 410
             C 133 408 135 404 136 398
             C 138 390 139 380 139 370
             C 140 352 140 332 139 312
             C 139 292 138 274 136 260
             C 135 253 132 248 128 248 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Subtle quad lines — left */}
        <Path d="M 66 270 C 68 286 68 302 68 318" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.35" />
        {/* Subtle quad lines — right */}
        <Path d="M 134 270 C 132 286 132 302 132 318" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.35" />
        {/* Kneecap left */}
        <Path d="M 64 322 C 64 316 67 312 73 312 C 79 312 82 316 82 322 C 82 328 79 332 73 332 C 67 332 64 328 64 322 Z" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Kneecap right */}
        <Path d="M 118 322 C 118 316 121 312 127 312 C 133 312 136 316 136 322 C 136 328 133 332 127 332 C 121 332 118 328 118 322 Z" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
      </G>

      {/* ── 2. FEET ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        <Path
          d="M 64 408 C 63 414 62 420 61 424 C 59 430 56 434 58 438 C 60 442 66 442 72 442 C 78 442 84 442 88 440 C 92 438 94 434 92 428 C 90 422 88 416 87 410 C 84 412 78 412 72 410 C 69 410 66 409 64 408 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        <Path
          d="M 136 408 C 134 409 131 410 128 410 C 122 412 116 412 113 410 C 112 416 110 422 108 428 C 106 434 108 438 112 440 C 116 442 122 442 128 442 C 134 442 140 442 142 438 C 144 434 141 430 139 424 C 138 420 137 414 136 408 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
      </G>

      {/* ── 3. BELLY / LOWER TORSO ──────────────────────────────────── */}
      <G onPress={() => onSelect('belly')}>
        {/* Female hourglass — wider hips than waist */}
        <Path
          d="M 75 178
             C 72 190 70 202 69 216
             C 68 226 67 236 67 248
             L 133 248
             C 133 236 132 226 131 216
             C 130 202 128 190 125 178
             C 118 184 110 188 100 188
             C 90 188 82 184 75 178 Z"
          fill={f('belly')} stroke={s('belly')} strokeWidth="1.5"
        />
        {/* Navel */}
        <Circle cx="100" cy="196" r="1.8" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
        {/* Soft oblique lines */}
        <Path d="M 74 184 C 76 194 77 204 77 214" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.3" />
        <Path d="M 126 184 C 124 194 123 204 123 214" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.3" />
      </G>

      {/* ── 4. CHEST / UPPER TORSO ──────────────────────────────────── */}
      <G onPress={() => onSelect('chest')}>
        {/* Female torso — narrower shoulders, wider hips start below */}
        <Path
          d="M 100 112
             C 110 112 120 112 128 114
             C 136 116 142 120 146 124
             C 150 128 152 134 152 140
             C 152 148 148 156 142 162
             C 136 168 128 172 120 176
             C 112 180 106 182 100 182
             C 94 182 88 180 80 176
             C 72 172 64 168 58 162
             C 52 156 48 148 48 140
             C 48 134 50 128 54 124
             C 58 120 64 116 72 114
             C 80 112 90 112 100 112 Z"
          fill={f('chest')} stroke={s('chest')} strokeWidth="1.5"
        />
        {/* Clavicles — female same as male but slightly thinner */}
        <Path d="M 100 120 C 108 118 116 118 124 122 C 130 125 136 130 140 136" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        <Path d="M 100 120 C 92 118 84 118 76 122 C 70 125 64 130 60 136" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.45" />
        {/* Sternum — lighter than male */}
        <Path d="M 100 124 L 100 148" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        {/* Breast contour — gentle arc under each breast */}
        <Path d="M 74 158 C 80 168 90 174 100 174" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
        <Path d="M 126 158 C 120 168 110 174 100 174" fill="none" stroke={DETAIL} strokeWidth="1" opacity="0.45" />
      </G>

      {/* ── 5. ARMS ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('arms')}>
        {/* Left arm — slimmer female arm */}
        <Path
          d="M 54 124
             C 50 128 46 134 43 142
             C 40 150 38 160 38 170
             C 37 182 38 194 40 202
             C 42 210 46 216 50 218
             C 54 220 58 218 61 214
             C 64 210 65 204 66 196
             C 67 186 67 176 67 166
             C 67 156 66 146 66 138
             C 66 130 64 124 60 122
             C 58 120 56 122 54 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        {/* Right arm */}
        <Path
          d="M 146 124
             C 144 122 142 120 140 122
             C 136 124 134 130 134 138
             C 134 146 133 156 133 166
             C 133 176 133 186 134 196
             C 135 204 136 210 139 214
             C 142 218 146 220 150 218
             C 154 216 158 210 160 202
             C 162 194 163 182 162 170
             C 162 160 160 150 157 142
             C 154 134 150 128 146 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
      </G>

      {/* ── 6. HANDS ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('arms')}>
        {/* Left hand */}
        <Path
          d="M 46 216
             C 44 222 42 228 41 234
             C 40 240 40 246 42 250
             C 44 254 48 256 52 254
             C 54 252 56 248 57 242
             C 58 236 58 230 58 224
             C 58 220 56 218 54 218
             C 51 218 48 217 46 216 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        {/* Right hand */}
        <Path
          d="M 154 216
             C 152 217 149 218 146 218
             C 144 218 142 220 142 224
             C 142 230 142 236 143 242
             C 144 248 146 252 148 254
             C 152 256 156 254 158 250
             C 160 246 160 240 159 234
             C 158 228 156 222 154 216 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
      </G>

      {/* ── 7. NECK ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('neck')}>
        <Path
          d="M 90 88
             C 90 92 90 96 90 100
             C 90 106 90 110 90 114
             C 90 116 92 117 94 118
             C 96 119 98 119 100 119
             C 102 119 104 119 106 118
             C 108 117 110 116 110 114
             C 110 110 110 106 110 100
             C 110 96 110 92 110 88
             C 106 92 103 94 100 94
             C 97 94 94 92 90 88 Z"
          fill={f('neck')} stroke={s('neck')} strokeWidth="1.5"
        />
      </G>

      {/* ── 8. HEAD BASE ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('face')}>
        <Path
          d="M 100 12
             C 120 10 134 22 134 40
             C 134 56 128 68 122 76
             C 116 84 108 90 100 92
             C 92 90 84 84 78 76
             C 72 68 66 56 66 40
             C 66 22 80 10 100 12 Z"
          fill={f('face')} stroke={s('face')} strokeWidth="1.5"
        />
        {/* Left ear */}
        <Path d="M 66 42 C 62 38 60 44 60 50 C 60 56 62 60 66 58" fill={f('face')} stroke={s('face')} strokeWidth="1.5" />
        {/* Right ear */}
        <Path d="M 134 42 C 138 38 140 44 140 50 C 140 56 138 60 134 58" fill={f('face')} stroke={s('face')} strokeWidth="1.5" />
        {/* Nose bridge */}
        <Path d="M 97 40 L 96 54" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.35" />
        <Path d="M 103 40 L 104 54" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.35" />
        {/* Eyebrow arcs */}
        <Path d="M 80 40 C 84 36 90 36 94 39" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        <Path d="M 106 39 C 110 36 116 36 120 40" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.35" />
        {/* Jawline */}
        <Path d="M 72 66 C 78 78 90 86 100 88 C 110 86 122 78 128 66" fill="none" stroke={DETAIL} strokeWidth="0.7" opacity="0.3" />
      </G>

      {/* ── 9. SCALP OVERLAY ────────────────────────────────────────── */}
      <G onPress={() => onSelect('scalp')}>
        <Path
          d="M 78 36 C 80 18 88 8 100 8 C 112 8 120 18 122 36
             C 118 22 110 14 100 14 C 90 14 82 22 78 36 Z"
          fill={selected === 'scalp' ? FILL_ACTIVE : 'transparent'}
          stroke={selected === 'scalp' ? STROKE_ACTIVE : 'transparent'}
          strokeWidth="1"
          opacity={selected === 'scalp' ? 0.7 : 0}
        />
      </G>

      {/* ── 10. FEMALE HAIR (drawn last) ────────────────────────────── */}
      {/* Hair cap on top */}
      <Path
        d="M 78 36 C 80 18 88 8 100 8 C 112 8 120 18 122 36
           C 118 22 110 14 100 14 C 90 14 82 22 78 36 Z"
        fill={HAIR_F} stroke={HAIR_F} strokeWidth="0.5"
      />
      {/* Long flowing hair — left side */}
      <Path
        d="M 68 36
           C 64 46 62 60 62 74
           C 62 86 64 98 66 110
           C 68 122 70 132 70 142
           C 70 150 68 156 66 160"
        fill="none" stroke={HAIR_F} strokeWidth="8" strokeLinecap="round" opacity="0.9"
      />
      <Path
        d="M 66 36
           C 62 48 60 62 60 76
           C 60 90 62 104 64 116
           C 66 128 68 138 68 148
           C 68 156 66 162 64 166"
        fill="none" stroke={HAIR_F} strokeWidth="5" strokeLinecap="round" opacity="0.7"
      />
      {/* Long flowing hair — right side */}
      <Path
        d="M 132 36
           C 136 46 138 60 138 74
           C 138 86 136 98 134 110
           C 132 122 130 132 130 142
           C 130 150 132 156 134 160"
        fill="none" stroke={HAIR_F} strokeWidth="8" strokeLinecap="round" opacity="0.9"
      />
      <Path
        d="M 134 36
           C 138 48 140 62 140 76
           C 140 90 138 104 136 116
           C 134 128 132 138 132 148
           C 132 156 134 162 136 166"
        fill="none" stroke={HAIR_F} strokeWidth="5" strokeLinecap="round" opacity="0.7"
      />
      {/* Hair flow texture lines — left */}
      <Path d="M 65 50 C 63 62 62 74 63 86" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.5" />
      <Path d="M 63 72 C 62 84 62 96 63 108" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.4" />
      {/* Hair flow texture lines — right */}
      <Path d="M 135 50 C 137 62 138 74 137 86" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.5" />
      <Path d="M 137 72 C 138 84 138 96 137 108" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.4" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEMALE BACK
// ─────────────────────────────────────────────────────────────────────────────
function FemaleBackSvg({ selected, onSelect }: { selected: BodyZone | null; onSelect: (z: BodyZone) => void }) {
  const f = (z: BodyZone) => selected === z ? FILL_ACTIVE : FILL_IDLE;
  const s = (z: BodyZone) => selected === z ? STROKE_ACTIVE : STROKE_IDLE;

  return (
    <Svg viewBox="0 0 200 460" width={160} height={368}>

      {/* ── 1. LEGS BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        <Path
          d="M 72 248
             C 68 248 65 253 64 260
             C 62 274 61 292 61 312
             C 60 332 60 352 61 370
             C 61 380 62 390 64 398
             C 65 404 67 408 70 410
             C 74 412 78 412 81 410
             C 84 408 86 404 87 398
             C 88 388 88 376 87 362
             C 86 346 86 330 86 314
             C 87 296 87 278 86 262
             C 86 255 84 249 81 247
             C 79 246 76 246 72 248 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        <Path
          d="M 128 248
             C 124 246 121 246 119 247
             C 116 249 114 255 114 262
             C 113 278 113 296 114 314
             C 114 330 114 346 113 362
             C 112 376 112 388 113 398
             C 114 404 116 408 119 410
             C 122 412 126 412 130 410
             C 133 408 135 404 136 398
             C 138 390 139 380 139 370
             C 140 352 140 332 139 312
             C 139 292 138 274 136 260
             C 135 253 132 248 128 248 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        {/* Calf back contour */}
        <Path d="M 63 340 C 61 352 62 364 65 374" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 82 340 C 84 352 83 364 80 374" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 118 340 C 116 352 117 364 120 374" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 137 340 C 139 352 138 364 135 374" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
      </G>

      {/* ── 2. FEET ─────────────────────────────────────────────────── */}
      <G onPress={() => onSelect('legs')}>
        <Path
          d="M 64 408 C 63 414 62 420 61 424 C 59 430 56 434 58 438 C 60 442 66 442 72 442 C 78 442 84 442 88 440 C 92 438 94 434 92 428 C 90 422 88 416 87 410 C 84 412 78 412 72 410 C 69 410 66 409 64 408 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
        <Path
          d="M 136 408 C 134 409 131 410 128 410 C 122 412 116 412 113 410 C 112 416 110 422 108 428 C 106 434 108 438 112 440 C 116 442 122 442 128 442 C 134 442 140 442 142 438 C 144 434 141 430 139 424 C 138 420 137 414 136 408 Z"
          fill={f('legs')} stroke={s('legs')} strokeWidth="1.5"
        />
      </G>

      {/* ── 3. LOWER BACK / GLUTES ──────────────────────────────────── */}
      <G onPress={() => onSelect('back')}>
        <Path
          d="M 69 182
             C 67 196 65 210 65 226
             C 65 234 65 240 66 248
             L 134 248
             C 135 240 135 234 135 226
             C 135 210 133 196 131 182
             C 122 186 112 188 100 188
             C 88 188 78 186 69 182 Z"
          fill={f('back')} stroke={s('back')} strokeWidth="1.5"
        />
        {/* Softer glute curves */}
        <Path d="M 70 232 C 76 240 88 244 100 244" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.4" />
        <Path d="M 130 232 C 124 240 112 244 100 244" fill="none" stroke={DETAIL} strokeWidth="0.9" opacity="0.4" />
      </G>

      {/* ── 4. BACK MAIN ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('back')}>
        <Path
          d="M 100 112
             C 110 112 120 112 128 114
             C 136 116 142 120 146 124
             C 150 128 152 134 152 140
             C 152 148 148 156 142 162
             C 136 168 128 172 120 176
             C 112 180 106 182 100 182
             C 94 182 88 180 80 176
             C 72 172 64 168 58 162
             C 52 156 48 148 48 140
             C 48 134 50 128 54 124
             C 58 120 64 116 72 114
             C 80 112 90 112 100 112 Z"
          fill={f('back')} stroke={s('back')} strokeWidth="1.5"
        />
        {/* Softer scapula lines — female */}
        <Path d="M 74 132 C 70 138 70 148 72 154 C 74 160 80 162 86 160 C 90 158 92 154 90 148" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        <Path d="M 126 132 C 130 138 130 148 128 154 C 126 160 120 162 114 160 C 110 158 108 154 110 148" fill="none" stroke={DETAIL} strokeWidth="0.8" opacity="0.4" />
        {/* Spine line */}
        <Path d="M 100 120 L 100 180" fill="none" stroke={DETAIL} strokeWidth="0.8" strokeDasharray="3,3" opacity="0.35" />
      </G>

      {/* ── 5. ARMS BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('arms')}>
        <Path
          d="M 54 124
             C 50 128 46 134 43 142
             C 40 150 38 160 38 170
             C 37 182 38 194 40 202
             C 42 210 46 216 50 218
             C 54 220 58 218 61 214
             C 64 210 65 204 66 196
             C 67 186 67 176 67 166
             C 67 156 66 146 66 138
             C 66 130 64 124 60 122
             C 58 120 56 122 54 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        <Path
          d="M 146 124
             C 144 122 142 120 140 122
             C 136 124 134 130 134 138
             C 134 146 133 156 133 166
             C 133 176 133 186 134 196
             C 135 204 136 210 139 214
             C 142 218 146 220 150 218
             C 154 216 158 210 160 202
             C 162 194 163 182 162 170
             C 162 160 160 150 157 142
             C 154 134 150 128 146 124 Z"
          fill={f('arms')} stroke={s('arms')} strokeWidth="1.5"
        />
        {/* Hands */}
        <Path d="M 46 216 C 44 222 42 228 41 234 C 40 240 40 246 42 250 C 44 254 48 256 52 254 C 54 252 56 248 57 242 C 58 236 58 230 58 224 C 58 220 56 218 54 218 C 51 218 48 217 46 216 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
        <Path d="M 154 216 C 152 217 149 218 146 218 C 144 218 142 220 142 224 C 142 230 142 236 143 242 C 144 248 146 252 148 254 C 152 256 156 254 158 250 C 160 246 160 240 159 234 C 158 228 156 222 154 216 Z" fill={f('arms')} stroke={s('arms')} strokeWidth="1.5" />
      </G>

      {/* ── 6. NECK BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('neck')}>
        <Path
          d="M 90 88
             C 90 92 90 96 90 100
             C 90 106 90 110 90 114
             C 90 116 92 117 94 118
             C 96 119 98 119 100 119
             C 102 119 104 119 106 118
             C 108 117 110 116 110 114
             C 110 110 110 106 110 100
             C 110 96 110 92 110 88
             C 106 92 103 94 100 94
             C 97 94 94 92 90 88 Z"
          fill={f('neck')} stroke={s('neck')} strokeWidth="1.5"
        />
      </G>

      {/* ── 7. HEAD BACK ────────────────────────────────────────────── */}
      <G onPress={() => onSelect('scalp')}>
        <Path
          d="M 100 12
             C 120 10 134 22 134 40
             C 134 56 128 68 122 76
             C 116 84 108 90 100 92
             C 92 90 84 84 78 76
             C 72 68 66 56 66 40
             C 66 22 80 10 100 12 Z"
          fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5"
        />
        <Path d="M 66 42 C 62 38 60 44 60 50 C 60 56 62 60 66 58" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
        <Path d="M 134 42 C 138 38 140 44 140 50 C 140 56 138 60 134 58" fill={f('scalp')} stroke={s('scalp')} strokeWidth="1.5" />
      </G>

      {/* ── 8. FEMALE HAIR BACK (drawn last) ────────────────────────── */}
      {/* Hair cap back */}
      <Path
        d="M 78 36 C 80 18 88 8 100 8 C 112 8 120 18 122 36
           C 118 22 110 14 100 14 C 90 14 82 22 78 36 Z"
        fill={HAIR_F} stroke={HAIR_F} strokeWidth="0.5"
      />
      {/* Long hair flowing down the back — centered */}
      <Path
        d="M 74 36
           C 70 50 68 66 68 82
           C 68 98 70 114 72 130
           C 74 146 76 160 76 174
           C 76 184 74 192 72 198"
        fill="none" stroke={HAIR_F} strokeWidth="10" strokeLinecap="round" opacity="0.9"
      />
      <Path
        d="M 126 36
           C 130 50 132 66 132 82
           C 132 98 130 114 128 130
           C 126 146 124 160 124 174
           C 124 184 126 192 128 198"
        fill="none" stroke={HAIR_F} strokeWidth="10" strokeLinecap="round" opacity="0.9"
      />
      {/* Center back hair fall */}
      <Path
        d="M 90 36
           C 88 52 87 68 87 84
           C 87 100 88 116 90 132
           C 92 148 94 162 94 176"
        fill="none" stroke={HAIR_F} strokeWidth="6" strokeLinecap="round" opacity="0.7"
      />
      <Path
        d="M 110 36
           C 112 52 113 68 113 84
           C 113 100 112 116 110 132
           C 108 148 106 162 106 176"
        fill="none" stroke={HAIR_F} strokeWidth="6" strokeLinecap="round" opacity="0.7"
      />
      {/* Hair flow texture lines */}
      <Path d="M 80 52 C 79 66 79 80 80 94" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.45" />
      <Path d="M 78 80 C 77 94 77 108 78 122" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.4" />
      <Path d="M 120 52 C 121 66 121 80 120 94" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.45" />
      <Path d="M 122 80 C 123 94 123 108 122 122" fill="none" stroke={HAIR_F} strokeWidth="1" opacity="0.4" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BODY MANNEQUIN WRAPPER (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
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
