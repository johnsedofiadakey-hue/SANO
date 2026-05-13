import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useProfileStore } from '../../src/store/profileStore';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import type { Fitzpatrick } from '../../src/types/user';
import { api } from '../../src/services/api';

type Undertone = 'warm' | 'cool' | 'neutral';
type Phase = 'idle' | 'undertone' | 'processing' | 'results';

const FITZPATRICK_TONES = ['#F5DCCA', '#E8BF9A', '#C8935A', '#A0622D', '#7A3E12', '#4A2008'];

interface FoundationMatch {
  brand: string;
  shade: string;
  type: string;
  swatchColor: string;
  match: number;
  accraStore: string;
}

const FOUNDATION_DATABASE: Record<number, Record<Undertone, FoundationMatch[]>> = {
  1: {
    warm:    [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 100W', type: 'Matte longwear', swatchColor: '#F5DCCA', match: 96, accraStore: 'Melcom' }, { brand: 'Maybelline', shade: 'Fit Me 110', type: 'Matte + Poreless', swatchColor: '#F4D8C5', match: 91, accraStore: 'Ernest Chemists, Melcom' }],
    cool:    [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 100C', type: 'Matte longwear', swatchColor: '#F2D9CB', match: 95, accraStore: 'Melcom' }, { brand: 'NARS', shade: 'Natural Radiant Deauville', type: 'Longwear', swatchColor: '#F1D8C9', match: 90, accraStore: 'Entrance Pharmacy' }],
    neutral: [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 100N', type: 'Matte longwear', swatchColor: '#F3D9CA', match: 95, accraStore: 'Melcom' }, { brand: 'L\'Oreal', shade: 'True Match C1', type: 'Super-Blendable', swatchColor: '#F2D8C9', match: 90, accraStore: 'Ernest Chemists' }],
  },
  2: {
    warm:    [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 185W', type: 'Matte longwear', swatchColor: '#E8BF9A', match: 96, accraStore: 'Melcom' }, { brand: 'Maybelline', shade: 'Fit Me 220', type: 'Matte + Poreless', swatchColor: '#E7BE98', match: 91, accraStore: 'Ernest Chemists, Melcom' }],
    cool:    [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 185C', type: 'Matte longwear', swatchColor: '#E6BD97', match: 95, accraStore: 'Melcom' }, { brand: 'NARS', shade: 'Natural Radiant Syracuse', type: 'Longwear', swatchColor: '#E5BC96', match: 90, accraStore: 'Entrance Pharmacy' }],
    neutral: [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 185N', type: 'Matte longwear', swatchColor: '#E7BF98', match: 95, accraStore: 'Melcom' }, { brand: 'MAC', shade: 'Studio Fix NC25', type: 'Powder Foundation', swatchColor: '#E6BE97', match: 91, accraStore: 'Melcom' }],
  },
  3: {
    warm:    [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 280W', type: 'Matte longwear', swatchColor: '#C8935A', match: 96, accraStore: 'Melcom' }, { brand: 'Maybelline', shade: 'Fit Me 310', type: 'Matte + Poreless', swatchColor: '#C89158', match: 91, accraStore: 'Ernest Chemists, Melcom' }],
    cool:    [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 280C', type: 'Matte longwear', swatchColor: '#C69059', match: 95, accraStore: 'Melcom' }, { brand: 'NARS', shade: 'Natural Radiant Valencia', type: 'Longwear', swatchColor: '#C58E57', match: 90, accraStore: 'Entrance Pharmacy' }],
    neutral: [{ brand: 'Fenty Beauty', shade: 'Pro Filt\'r 280N', type: 'Matte longwear', swatchColor: '#C79158', match: 95, accraStore: 'Melcom' }, { brand: 'MAC', shade: 'Studio Fix NC35', type: 'Powder Foundation', swatchColor: '#C69057', match: 92, accraStore: 'Melcom' }],
  },
  4: {
    warm: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 385W', type: 'Matte longwear', swatchColor: '#A0622D', match: 97, accraStore: 'Melcom' },
      { brand: 'MAC', shade: 'Studio Fix NC45', type: 'Powder Foundation', swatchColor: '#9B5E2B', match: 92, accraStore: 'Melcom' },
      { brand: 'Maybelline', shade: 'Fit Me 330', type: 'Matte + Poreless', swatchColor: '#A36128', match: 88, accraStore: 'Ernest Chemists, Melcom' },
    ],
    cool: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 385C', type: 'Matte longwear', swatchColor: '#9A5E30', match: 96, accraStore: 'Melcom' },
      { brand: 'NARS', shade: 'Natural Radiant Syracuse', type: 'Longwear foundation', swatchColor: '#936030', match: 90, accraStore: 'Entrance Pharmacy' },
      { brand: 'Maybelline', shade: 'Fit Me 335', type: 'Matte + Poreless', swatchColor: '#9C5E2C', match: 86, accraStore: 'Ernest Chemists, Melcom' },
    ],
    neutral: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 385N', type: 'Matte longwear', swatchColor: '#9E602C', match: 95, accraStore: 'Melcom' },
      { brand: 'L\'Oreal', shade: 'True Match W6', type: 'Super-Blendable', swatchColor: '#9A5F2A', match: 91, accraStore: 'Ernest Chemists' },
      { brand: 'Maybelline', shade: 'Fit Me 332', type: 'Matte + Poreless', swatchColor: '#9C5F2D', match: 87, accraStore: 'Ernest Chemists, Melcom' },
    ],
  },
  5: {
    warm: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 430W', type: 'Matte longwear', swatchColor: '#7A3E12', match: 97, accraStore: 'Melcom' },
      { brand: 'Black Opal', shade: 'Total Coverage Hazelnut', type: 'Full coverage', swatchColor: '#7B3C12', match: 93, accraStore: 'Ernest Chemists' },
      { brand: 'Maybelline', shade: 'Fit Me 355', type: 'Matte + Poreless', swatchColor: '#7C3E14', match: 89, accraStore: 'Ernest Chemists, Melcom' },
    ],
    cool: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 430C', type: 'Matte longwear', swatchColor: '#763B13', match: 96, accraStore: 'Melcom' },
      { brand: 'NARS', shade: 'Natural Radiant Deauville', type: 'Longwear foundation', swatchColor: '#763912', match: 91, accraStore: 'Entrance Pharmacy' },
      { brand: 'Maybelline', shade: 'Fit Me 360', type: 'Matte + Poreless', swatchColor: '#773A13', match: 87, accraStore: 'Ernest Chemists, Melcom' },
    ],
    neutral: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 430N', type: 'Matte longwear', swatchColor: '#783D13', match: 95, accraStore: 'Melcom' },
      { brand: 'MAC', shade: 'Studio Fix NW45', type: 'Powder Foundation', swatchColor: '#773B12', match: 92, accraStore: 'Melcom' },
      { brand: 'Maybelline', shade: 'Fit Me 356', type: 'Matte + Poreless', swatchColor: '#783C13', match: 88, accraStore: 'Ernest Chemists, Melcom' },
    ],
  },
  6: {
    warm: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 490W', type: 'Matte longwear', swatchColor: '#4A2008', match: 97, accraStore: 'Melcom' },
      { brand: 'Black Opal', shade: 'Total Coverage Ebony Brown', type: 'Full coverage', swatchColor: '#491F08', match: 94, accraStore: 'Ernest Chemists' },
      { brand: 'Maybelline', shade: 'Fit Me 380', type: 'Matte + Poreless', swatchColor: '#4B2109', match: 89, accraStore: 'Ernest Chemists, Melcom' },
    ],
    cool: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 490C', type: 'Matte longwear', swatchColor: '#471D08', match: 96, accraStore: 'Melcom' },
      { brand: 'NARS', shade: 'Natural Radiant Macao', type: 'Longwear foundation', swatchColor: '#461D07', match: 92, accraStore: 'Entrance Pharmacy' },
      { brand: 'Maybelline', shade: 'Fit Me 385', type: 'Matte + Poreless', swatchColor: '#471D08', match: 87, accraStore: 'Ernest Chemists, Melcom' },
    ],
    neutral: [
      { brand: 'Fenty Beauty', shade: 'Pro Filt\'r 490N', type: 'Matte longwear', swatchColor: '#481F08', match: 95, accraStore: 'Melcom' },
      { brand: 'MAC', shade: 'Studio Fix NW55', type: 'Powder Foundation', swatchColor: '#471E08', match: 93, accraStore: 'Melcom' },
      { brand: 'Maybelline', shade: 'Fit Me 382', type: 'Matte + Poreless', swatchColor: '#481F09', match: 88, accraStore: 'Ernest Chemists, Melcom' },
    ],
  },
};

function getMatches(fitzpatrick: Fitzpatrick | null, undertone: Undertone): FoundationMatch[] {
  const type = Math.min(Math.max(fitzpatrick ?? 5, 1), 6);
  return FOUNDATION_DATABASE[type]?.[undertone] ?? FOUNDATION_DATABASE[5].neutral;
}

const UNDERTONE_OPTIONS: { key: Undertone; label: string; desc: string; color: string }[] = [
  { key: 'warm', label: 'Warm', desc: 'Golden, yellow, or peachy undertones', color: '#D97706' },
  { key: 'cool', label: 'Cool', desc: 'Pink, red, or bluish undertones', color: '#7C3AED' },
  { key: 'neutral', label: 'Neutral', desc: 'Mix of warm and cool', color: '#059669' },
];

const PROCESSING_STEPS = [
  'Analysing skin tone…',
  'Mapping undertones…',
  'Matching 500+ shades…',
  'Checking Accra stores…',
  'Finalising results…',
];

function ProcessingOverlay({ onDone }: { onDone: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const scanY = useSharedValue(-50);
  const glowScale = useSharedValue(0.95);

  useEffect(() => {
    scanY.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(-50, { duration: 800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1, false,
    );
    glowScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 600 }), withTiming(0.95, { duration: 600 })),
      -1, false,
    );
    const iv = setInterval(() => setStepIndex(i => Math.min(i + 1, PROCESSING_STEPS.length - 1)), 400);
    const done = setTimeout(onDone, 2200);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [onDone, scanY, glowScale]);

  const scanStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scanY.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  return (
    <View style={proc.overlay}>
      <LinearGradient colors={['#1a0533', '#2d1054', '#1a0533']} style={proc.grad}>
        <Animated.View style={[proc.swatchCircle, glowStyle]}>
          <View style={proc.swatchInner} />
          <Animated.View style={[proc.scanLine, scanStyle]} />
        </Animated.View>
        <Text style={proc.stepText}>{PROCESSING_STEPS[stepIndex]}</Text>
        <View style={proc.dots}>
          {PROCESSING_STEPS.map((_, i) => (
            <View key={i} style={[proc.dot, i <= stepIndex && proc.dotActive]} />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

export default function FoundationScreen() {
  const router = useRouter();
  const { fitzpatrick, undertone, setUndertone, persist } = useProfileStore();
  const { logEvent } = useDataCollection();
  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedUndertone, setSelectedUndertone] = useState<Undertone>(undertone ?? 'neutral');
  const [serverMatches, setServerMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toneIndex = (fitzpatrick ?? 5) - 1;
  const skinColor = FITZPATRICK_TONES[toneIndex];

  useEffect(() => { logEvent('feature_opened', { feature: 'foundation' }); }, [logEvent]);

  const startCapture = () => {
    if (!undertone) {
      setPhase('undertone');
    } else {
      setPhase('processing');
      logEvent('foundation_scan_started');
    }
  };

  const confirmUndertone = useCallback(async () => {
    setUndertone(selectedUndertone);
    await persist();
    setPhase('processing');
    logEvent('foundation_scan_started', { undertone: selectedUndertone });
  }, [selectedUndertone, setUndertone, persist, logEvent]);

  const handleDone = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/foundation', {
        fitzpatrick,
        undertone: undertone ?? selectedUndertone,
      });
      setServerMatches(response.data.matches);
      setPhase('results');
      logEvent('foundation_matches_shown', { topMatch: response.data.matches[0]?.shade });
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setPhase('results'); // Still show results (fallback to local!)
      const matches = getMatches(fitzpatrick, undertone ?? selectedUndertone);
      logEvent('foundation_matches_shown', { topMatch: matches[0]?.shade });
    } finally {
      setLoading(false);
    }
  }, [fitzpatrick, undertone, selectedUndertone, logEvent]);

  const handleShare = async () => {
    const matches = getMatches(fitzpatrick, undertone ?? selectedUndertone);
    await Share.share({
      message: `My SANO foundation matches:\n${matches.map(s => `${s.brand} ${s.shade} — ${s.match}% match`).join('\n')}\n\nFind yours with SANO — Ghana's AI skincare app 💜`,
    });
  };

  const activeUndertone = undertone ?? selectedUndertone;
  const matches = serverMatches.length > 0 ? serverMatches : getMatches(fitzpatrick, activeUndertone);
  const undertoneDesc = UNDERTONE_OPTIONS.find(u => u.key === activeUndertone)?.desc ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Foundation Match</Text>
        <View style={{ width: 60 }} />
      </View>

      {phase === 'processing' && <ProcessingOverlay onDone={handleDone} />}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {phase === 'idle' && (
          <>
            <GradientCard style={styles.heroCard}>
              <Label color="rgba(255,255,255,0.6)">AI Foundation Matcher</Label>
              <Text style={styles.heroTitle}>Find your perfect shade</Text>
              <Text style={styles.heroSub}>
                SANO maps your Fitzpatrick tone and undertone to match you to shades available in Accra.
              </Text>
            </GradientCard>

            <Card variant="tint" style={styles.toneCard}>
              <Text style={styles.toneCardLabel}>Your detected tone</Text>
              <View style={styles.toneRow}>
                <View style={[styles.toneSwatch, { backgroundColor: skinColor }]} />
                <View>
                  <Text style={styles.toneName}>Fitzpatrick Type {fitzpatrick ?? 5}</Text>
                  <Text style={styles.toneDesc}>{undertone ? `${undertone.charAt(0).toUpperCase() + undertone.slice(1)} undertone` : 'Undertone not set yet'}</Text>
                </View>
              </View>
            </Card>

            <GradientButton label="📸 Match my foundation" onPress={startCapture} variant="primary" />

            <View style={styles.howRow}>
              {['Natural light', 'No makeup', 'Face centred'].map(tip => (
                <View key={tip} style={styles.howItem}>
                  <Text style={styles.howTick}>✓</Text>
                  <Text style={styles.howText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {phase === 'undertone' && (
          <>
            <GradientCard style={styles.heroCard}>
              <Label color="rgba(255,255,255,0.6)">Step 1 of 2</Label>
              <Text style={styles.heroTitle}>What's your undertone?</Text>
              <Text style={styles.heroSub}>This helps us find shades that look natural on your skin.</Text>
            </GradientCard>

            <Text style={styles.undertoneHint}>Look at your wrist veins: green = warm · blue/purple = cool · both = neutral</Text>

            {UNDERTONE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSelectedUndertone(opt.key)}
                style={[styles.undertoneCard, selectedUndertone === opt.key && { borderColor: opt.color, borderWidth: 2 }]}
                activeOpacity={0.8}
              >
                <View style={[styles.undertoneCircle, { backgroundColor: opt.color + '22', borderColor: opt.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.undertoneLabel, selectedUndertone === opt.key && { color: opt.color }]}>{opt.label}</Text>
                  <Text style={styles.undertoneDesc}>{opt.desc}</Text>
                </View>
                {selectedUndertone === opt.key && <Text style={{ color: opt.color, fontSize: 20 }}>✓</Text>}
              </TouchableOpacity>
            ))}

            <GradientButton label="Continue →" onPress={confirmUndertone} variant="primary" />
          </>
        )}

        {phase === 'results' && (
          <>
            <GradientCard style={styles.heroCard}>
              <Label color="rgba(255,255,255,0.6)">Detected skin tone</Label>
              <View style={styles.toneRow}>
                <View style={[styles.toneSwatch, { backgroundColor: skinColor }]} />
                <View>
                  <Text style={styles.toneName}>Fitzpatrick Type {fitzpatrick ?? 5}</Text>
                  <Text style={styles.toneDesc}>{activeUndertone.charAt(0).toUpperCase() + activeUndertone.slice(1)} undertone · {undertoneDesc}</Text>
                </View>
              </View>
              <Text style={styles.heroSub}>Matched to {matches.length} foundation shades across top brands in Accra</Text>
            </GradientCard>

            <Label color={colors.t3}>Your shade matches</Label>
            {matches.map((s, i) => (
              <Card
                key={i}
                variant={i === 0 ? 'tint' : 'white'}
                style={i === 0 ? [styles.shadeCard, styles.topMatch] : styles.shadeCard}
              >
                {i === 0 && (
                  <LinearGradient colors={[...GRADIENT]} style={styles.topBadge}>
                    <Text style={styles.topBadgeText}>Best match</Text>
                  </LinearGradient>
                )}
                <View style={styles.shadeRow}>
                  <View style={[styles.shadeSwatch, { backgroundColor: s.swatchColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shadeBrand}>{s.brand}</Text>
                    <Text style={styles.shadeName}>{s.shade}</Text>
                    <Text style={styles.shadeType}>{s.type}</Text>
                    <Text style={styles.shadeStore}>📍 {s.accraStore}</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchPct}>{s.match}%</Text>
                    <Text style={styles.matchLabel}>match</Text>
                  </View>
                </View>
              </Card>
            ))}

            <GradientButton label="📤 Share my shades" onPress={handleShare} variant="primary" />
            <GradientButton label="🔄 Change undertone" onPress={() => setPhase('undertone')} variant="outline" />
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bdr,
  },
  back: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.semibold },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  demoBanner: { backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' },
  demoText: { fontSize: 12, color: '#B45309', fontWeight: '600', textAlign: 'center' },

  heroCard: { gap: spacing.md },
  heroTitle: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  heroSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  toneCard: { gap: spacing.sm },
  toneCardLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.t3, letterSpacing: 1, textTransform: 'uppercase' },
  toneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toneSwatch: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: colors.bdr },
  toneName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  toneDesc: { fontSize: fontSize.sm, color: colors.t3 },

  howRow: { flexDirection: 'row', justifyContent: 'space-around' },
  howItem: { alignItems: 'center', gap: 4 },
  howTick: { fontSize: fontSize.lg, color: colors.grn },
  howText: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium },

  undertoneHint: { fontSize: fontSize.sm, color: colors.t3, textAlign: 'center', lineHeight: 20 },
  undertoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.bdr,
  },
  undertoneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  undertoneLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  undertoneDesc: { fontSize: fontSize.sm, color: colors.t3, marginTop: 2 },

  shadeCard: { gap: spacing.sm, overflow: 'hidden' },
  topMatch: { borderColor: colors.purMid, borderWidth: 2 },
  topBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  topBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.white },
  shadeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  shadeSwatch: { width: 48, height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.bdr },
  shadeBrand: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium },
  shadeName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  shadeType: { fontSize: fontSize.xs, color: colors.t3 },
  shadeStore: { fontSize: fontSize.xs, color: colors.grn, fontWeight: fontWeight.medium, marginTop: 2 },
  matchBadge: { alignItems: 'center' },
  matchPct: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.pur },
  matchLabel: { fontSize: fontSize.xs2, color: colors.t3 },
});

const proc = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  grad: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  swatchCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swatchInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6B3A1F', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#EC4899', opacity: 0.9 },
  stepText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.white, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { backgroundColor: '#A855F7' },
});
