import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { Chip } from '../../src/components/ui/Chip';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useProfileStore } from '../../src/store/profileStore';
import type { Fitzpatrick, SkinConcern, SkinGoal } from '../../src/types/user';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 3;

const FITZPATRICK_TONES: { tone: Fitzpatrick; hex: string; name: string; desc: string }[] = [
  { tone: 1, hex: '#F5DCCA', name: 'Type I',   desc: 'Very fair, burns easily' },
  { tone: 2, hex: '#E8BF9A', name: 'Type II',  desc: 'Fair, burns sometimes' },
  { tone: 3, hex: '#C8935A', name: 'Type III', desc: 'Medium, tans gradually' },
  { tone: 4, hex: '#A0622D', name: 'Type IV',  desc: 'Olive, rarely burns' },
  { tone: 5, hex: '#7A3E12', name: 'Type V',   desc: 'Brown, very rarely burns' },
  { tone: 6, hex: '#4A2008', name: 'Type VI',  desc: 'Dark brown / black' },
];

const SKIN_CONCERNS: { key: SkinConcern; label: string }[] = [
  { key: 'hyperpigmentation', label: 'Hyperpigmentation' },
  { key: 'dark_spots',        label: 'Dark spots' },
  { key: 'acne',              label: 'Acne' },
  { key: 'razor_bumps',       label: 'Razor bumps' },
  { key: 'oily_skin',         label: 'Oily skin' },
  { key: 'uneven_tone',       label: 'Uneven tone' },
  { key: 'eczema',            label: 'Eczema' },
  { key: 'keloids',           label: 'Keloids' },
  { key: 'dryness',           label: 'Dryness' },
  { key: 'dark_circles',      label: 'Dark circles' },
];

const SKIN_GOALS: { key: SkinGoal; label: string; emoji: string }[] = [
  { key: 'brighter_skin', label: 'Brighter skin', emoji: '✨' },
  { key: 'clear_skin',    label: 'Clear skin',    emoji: '💎' },
  { key: 'even_tone',     label: 'Even tone',     emoji: '🎯' },
  { key: 'glass_skin',    label: 'Glass skin',    emoji: '💧' },
  { key: 'healthy_glow',  label: 'Healthy glow',  emoji: '🌟' },
];

const CONFETTI_COLORS = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F43F5E'];
const CONFETTI_COUNT = 15;

// ─── Confetti ────────────────────────────────────────────────────────────────

function ConfettiPiece({ index, active, x, size }: {
  index: number; active: boolean; x: number; size: number;
}) {
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const delay = index * 60;

  useEffect(() => {
    if (active) {
      translateY.value = withDelay(delay,
        withTiming(700, { duration: 1500, easing: Easing.in(Easing.quad) }),
      );
      opacity.value = withDelay(delay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(1200, withTiming(0, { duration: 200 })),
        ),
      );
      rotate.value = withDelay(delay,
        withTiming(index % 2 === 0 ? 360 : -360, { duration: 1500 }),
      );
    }
  }, [active, delay, index, opacity, rotate, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }] as any,
    opacity: opacity.value,
  }));

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

  return (
    <Animated.View
      style={[styles.confettiPiece, animStyle, { left: x, width: size, height: size, backgroundColor: color }]}
    />
  );
}

const CONFETTI_PIECES = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  x: (i / CONFETTI_COUNT) * width + (i % 3) * 8,
  size: 8 + (i % 4) * 2,
}));

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CONFETTI_PIECES.map(({ x, size }, i) => (
        <ConfettiPiece key={i} index={i} active={active} x={x} size={size} />
      ))}
    </View>
  );
}

// ─── "Not sure?" sheet ────────────────────────────────────────────────────────

function NotSureSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={sheet.safe}>
        <View style={sheet.header}>
          <Text style={sheet.title}>How to find your type</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={sheet.close}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={sheet.scroll}>
          <Text style={sheet.intro}>
            The Fitzpatrick scale measures how your skin responds to UV exposure. Pick the description that sounds most like you.
          </Text>
          {FITZPATRICK_TONES.map(t => (
            <View key={t.tone} style={sheet.row}>
              <View style={[sheet.swatch, { backgroundColor: t.hex }]} />
              <View style={{ flex: 1 }}>
                <Text style={sheet.rowTitle}>{t.name}</Text>
                <Text style={sheet.rowDesc}>{t.desc}</Text>
              </View>
            </View>
          ))}
          <View style={sheet.tip}>
            <Text style={sheet.tipText}>
              💡 Most users from West Africa and the diaspora fall within Types IV–VI. SANO is specifically optimised for these tones.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withSpring((step / total) * 100, { stiffness: 200, damping: 20 });
  }, [step, total, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value}%` as `${number}%` }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={style}>
        <LinearGradient colors={[...GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.progressFill} />
      </Animated.View>
    </View>
  );
}

// ─── ToneCircle ───────────────────────────────────────────────────────────────

function ToneCircle({ tone, hex, name, selected, onPress }: {
  tone: Fitzpatrick; hex: string; name: string; selected: boolean; onPress: () => void;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.15 : 1, { stiffness: 200, damping: 20 }) }],
  }));
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.toneItem}>
      <Animated.View style={animStyle}>
        <View style={[styles.toneCircle, { backgroundColor: hex }, selected && styles.toneCircleSelected]} />
      </Animated.View>
      <Text style={[styles.toneName, selected && styles.toneNameSelected]}>{name}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showSheet, setShowSheet] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const slideX = useSharedValue(0);

  const {
    fitzpatrick,
    skinConcerns,
    skinGoal,
    setFitzpatrick,
    toggleSkinConcern,
    setSkinGoal,
    persist,
  } = useProfileStore();

  const slideTo = useCallback((nextStep: number) => {
    slideX.value = withSpring(-(nextStep - 1) * width, { stiffness: 200, damping: 20 });
    setStep(nextStep);
  }, [slideX]);

  const handleNext = useCallback(async () => {
    if (step < TOTAL_STEPS) {
      slideTo(step + 1);
    } else {
      setShowConfetti(true);
      setTimeout(async () => {
        await persist();
        router.replace('/(tabs)');
      }, 1600);
    }
  }, [step, slideTo, persist, router]);

  const canContinue = () => {
    if (step === 1) return fitzpatrick !== null;
    if (step === 2) return skinConcerns.length > 0;
    if (step === 3) return skinGoal !== null;
    return false;
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <Confetti active={showConfetti} />

      <View style={styles.header}>
        <Text style={styles.stepText}>Step {step} of {TOTAL_STEPS}</Text>
        <ProgressBar step={step} total={TOTAL_STEPS} />
      </View>

      {/* Horizontal slide container */}
      <View style={styles.viewport}>
        <Animated.View style={[styles.slideRow, containerStyle]}>
          {/* Step 1 — Fitzpatrick */}
          <View style={styles.slide}>
            <ScrollView contentContainerStyle={styles.slideScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>What's your skin tone?</Text>
              <Text style={styles.subtitle}>We personalize results for Fitzpatrick types 4–6</Text>

              <View style={styles.tonesGrid}>
                {FITZPATRICK_TONES.map(t => (
                  <ToneCircle
                    key={t.tone}
                    {...t}
                    selected={fitzpatrick === t.tone}
                    onPress={() => setFitzpatrick(t.tone)}
                  />
                ))}
              </View>

              {fitzpatrick !== null && fitzpatrick >= 4 && (
                <LinearGradient colors={[...GRADIENT]} style={styles.confirmBanner}>
                  <Text style={styles.confirmText}>
                    ✦ SANO is built for your skin tone. You're in the right place.
                  </Text>
                </LinearGradient>
              )}

              <TouchableOpacity onPress={() => setShowSheet(true)} style={styles.notSureBtn}>
                <Text style={styles.notSureText}>Not sure? →</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Step 2 — Concerns */}
          <View style={styles.slide}>
            <ScrollView contentContainerStyle={styles.slideScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>What are your skin concerns?</Text>
              <Text style={styles.subtitle}>Select all that apply</Text>
              <View style={styles.chipsWrap}>
                {SKIN_CONCERNS.map(c => (
                  <Chip
                    key={c.key}
                    label={c.label}
                    selected={skinConcerns.includes(c.key)}
                    onPress={() => toggleSkinConcern(c.key)}
                    color={colors.pur}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Step 3 — Goal */}
          <View style={styles.slide}>
            <ScrollView contentContainerStyle={styles.slideScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>What's your skin goal?</Text>
              <Text style={styles.subtitle}>We'll tailor your daily tips</Text>
              <View style={styles.goalsList}>
                {SKIN_GOALS.map(g => (
                  <TouchableOpacity
                    key={g.key}
                    onPress={() => setSkinGoal(g.key)}
                    activeOpacity={0.85}
                    style={[styles.goalCard, skinGoal === g.key && styles.goalCardSelected]}
                  >
                    <Text style={styles.goalEmoji}>{g.emoji}</Text>
                    <Text style={[styles.goalLabel, skinGoal === g.key && styles.goalLabelSelected]}>
                      {g.label}
                    </Text>
                    {skinGoal === g.key && (
                      <LinearGradient colors={[...GRADIENT]} style={styles.goalCheck}>
                        <Text style={styles.goalCheckText}>✓</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity onPress={() => slideTo(step - 1)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <GradientButton
          label={step < TOTAL_STEPS ? 'Continue →' : '🎉 Start my SANO journey'}
          onPress={handleNext}
          disabled={!canContinue()}
        />
      </View>

      <NotSureSheet visible={showSheet} onClose={() => setShowSheet(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },

  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  stepText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.t3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.bg3,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: radius.full },

  viewport: { flex: 1, overflow: 'hidden' },
  slideRow: { flexDirection: 'row', flex: 1 },
  slide: { width, flex: 1 },
  slideScroll: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },

  title: { fontSize: fontSize.xl3, fontWeight: fontWeight.extrabold, color: colors.t1 },
  subtitle: { fontSize: fontSize.md, color: colors.t3, marginTop: -spacing.md },

  tonesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  toneItem: {
    alignItems: 'center',
    gap: spacing.xs,
    width: (width - spacing.xxl * 2 - spacing.md * 5) / 6,
  },
  toneCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  toneCircleSelected: {
    borderColor: colors.pur,
    shadowColor: colors.pur,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  toneName: { fontSize: fontSize.xs2, color: colors.t4, textAlign: 'center' },
  toneNameSelected: { color: colors.pur, fontWeight: fontWeight.bold },

  confirmBanner: { borderRadius: radius.md, padding: spacing.md },
  confirmText: { fontSize: fontSize.sm, color: colors.white, fontWeight: fontWeight.medium, textAlign: 'center' },

  notSureBtn: { alignSelf: 'center', paddingVertical: spacing.sm },
  notSureText: { fontSize: fontSize.sm, color: colors.pur, fontWeight: fontWeight.bold },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  goalsList: { gap: spacing.sm },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.bdr,
    backgroundColor: colors.bg2,
    gap: spacing.md,
  },
  goalCardSelected: { borderColor: colors.pur, backgroundColor: colors.purMid },
  goalEmoji: { fontSize: 22 },
  goalLabel: { flex: 1, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.t2 },
  goalLabelSelected: { color: colors.purDk },
  goalCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCheckText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  footer: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  backBtn: { alignSelf: 'center' },
  backText: { fontSize: fontSize.md, color: colors.t3, fontWeight: fontWeight.medium },

  confettiPiece: { position: 'absolute', top: 0, borderRadius: 2 },
});

const sheet = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bdr,
  },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  close: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.bold },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  intro: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.bdr,
    flexShrink: 0,
  },
  rowTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  rowDesc: { fontSize: fontSize.sm, color: colors.t3 },
  tip: {
    backgroundColor: colors.purMid,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.pur,
  },
  tipText: { fontSize: fontSize.sm, color: colors.purDk, lineHeight: 20 },
});
