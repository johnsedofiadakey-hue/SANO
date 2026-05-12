import React, { useState, useEffect, useRef } from 'react';
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
  withSpring,
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
import { MOCK_FOUNDATION_MATCHES } from '../../src/data/mockData';

const FITZPATRICK_TONES = ['#F5DCCA', '#E8BF9A', '#C8935A', '#A0622D', '#7A3E12', '#4A2008'];

const PROCESSING_STEPS = [
  'Analysing skin tone…',
  'Mapping undertones…',
  'Matching 500+ shades…',
  'Checking Accra stores…',
  'Finalising results…',
];

const TOTAL_PROCESSING_MS = 2000;

type Phase = 'idle' | 'processing' | 'results';

function ProcessingOverlay({ onDone }: { onDone: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const scanY = useSharedValue(-50);
  const glowScale = useSharedValue(0.95);

  useEffect(() => {
    // Scan line
    scanY.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(-50, { duration: 800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    // Pulsing glow
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 600 }),
        withTiming(0.95, { duration: 600 }),
      ),
      -1,
      false,
    );

    // Cycle through steps
    const stepInterval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, PROCESSING_STEPS.length - 1));
    }, TOTAL_PROCESSING_MS / PROCESSING_STEPS.length);

    const done = setTimeout(onDone, TOTAL_PROCESSING_MS);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(done);
    };
  }, [onDone, scanY, glowScale]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

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
            <View
              key={i}
              style={[proc.dot, i <= stepIndex && proc.dotActive]}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

export default function FoundationScreen() {
  const router = useRouter();
  const { fitzpatrick } = useProfileStore();
  const { logEvent } = useDataCollection();
  const [phase, setPhase] = useState<Phase>('idle');

  const toneIndex = (fitzpatrick ?? 5) - 1;
  const skinColor = FITZPATRICK_TONES[toneIndex];

  useEffect(() => {
    logEvent('feature_opened', { feature: 'foundation' });
  }, [logEvent]);

  const startCapture = () => {
    setPhase('processing');
    logEvent('foundation_scan_started');
  };

  const handleDone = () => {
    setPhase('results');
    logEvent('foundation_matches_shown', { topMatch: MOCK_FOUNDATION_MATCHES[0].match });
  };

  const handleShare = async () => {
    await Share.share({
      message: `My SANO foundation matches:\n${MOCK_FOUNDATION_MATCHES.slice(0, 3).map(s => `${s.brand} ${s.shade} — ${s.match}% match`).join('\n')}\n\nFind yours with SANO — Ghana's AI skincare app 💜`,
    });
  };

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
                Scan your face in natural light. SANO maps your undertone and matches you to 500+ shades available in Ghana.
              </Text>
            </GradientCard>

            <Card variant="tint" style={styles.toneCard}>
              <Text style={styles.toneCardLabel}>Your detected tone</Text>
              <View style={styles.toneRow}>
                <View style={[styles.toneSwatch, { backgroundColor: skinColor }]} />
                <View>
                  <Text style={styles.toneName}>Fitzpatrick Type {fitzpatrick ?? 5}</Text>
                  <Text style={styles.toneDesc}>Deep warm undertone</Text>
                </View>
              </View>
            </Card>

            <GradientButton
              label="📸 Scan face to match"
              onPress={startCapture}
              variant="primary"
            />

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

        {phase === 'results' && (
          <>
            {/* Detected tone hero */}
            <GradientCard style={styles.heroCard}>
              <Label color="rgba(255,255,255,0.6)">Detected skin tone</Label>
              <View style={styles.toneRow}>
                <View style={[styles.toneSwatch, { backgroundColor: skinColor }]} />
                <View>
                  <Text style={styles.toneName}>Fitzpatrick Type {fitzpatrick ?? 5}</Text>
                  <Text style={styles.toneDesc}>Deep warm undertone</Text>
                </View>
              </View>
              <Text style={styles.heroSub}>
                Matched to {MOCK_FOUNDATION_MATCHES.length} foundation shades across top brands
              </Text>
            </GradientCard>

            {/* Shade matches */}
            <Label color={colors.t3}>Your shade matches</Label>
            {MOCK_FOUNDATION_MATCHES.map((s, i) => (
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
                    {s.accraStore && (
                      <Text style={styles.shadeStore}>📍 {s.accraStore}</Text>
                    )}
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchPct}>{s.match}%</Text>
                    <Text style={styles.matchLabel}>match</Text>
                  </View>
                </View>
              </Card>
            ))}

            <GradientButton label="📤 Share my shades" onPress={handleShare} variant="primary" />
            <GradientButton
              label="📸 Rescan"
              onPress={() => setPhase('idle')}
              variant="outline"
            />
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

  heroCard: { gap: spacing.md },
  heroTitle: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  heroSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  toneCard: { gap: spacing.sm },
  toneCardLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.t3, letterSpacing: 1 },
  toneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toneSwatch: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: colors.bdr,
  },
  toneName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  toneDesc: { fontSize: fontSize.sm, color: colors.t3 },

  howRow: { flexDirection: 'row', justifyContent: 'space-around' },
  howItem: { alignItems: 'center', gap: 4 },
  howTick: { fontSize: fontSize.lg, color: colors.grn },
  howText: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium },

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
  shadeSwatch: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  shadeBrand: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium },
  shadeName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  shadeType: { fontSize: fontSize.xs, color: colors.t3 },
  shadeStore: { fontSize: fontSize.xs, color: colors.grn, fontWeight: fontWeight.medium, marginTop: 2 },
  matchBadge: { alignItems: 'center' },
  matchPct: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.pur },
  matchLabel: { fontSize: fontSize.xs2, color: colors.t3 },
});

const proc = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  grad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
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
  swatchInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B3A1F',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#EC4899',
    opacity: 0.9,
  },
  stepText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { backgroundColor: '#A855F7' },
});
