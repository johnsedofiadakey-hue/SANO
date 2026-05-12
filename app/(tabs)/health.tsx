import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
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
import { useHeartRate } from '../../src/hooks/useHeartRate';
import { MOCK_VITALS } from '../../src/data/mockData';

const STATUS_COLOR = {
  good: colors.grn,
  ok:   colors.amber,
  alert: colors.red,
} as const;

const TESTS = [
  { name: 'Malaria Detection',     emoji: '🦟', pro: true,  desc: 'Rapid symptom + eye scan analysis' },
  { name: 'Blood Group Est.',      emoji: '🩸', pro: true,  desc: 'Estimate from vein pattern (experimental)' },
  { name: 'Sickle Cell Screening', emoji: '🔴', pro: true,  desc: 'Risk score from family history + symptoms' },
  { name: 'Heart Rate (PPG)',       emoji: '💓', pro: false, desc: 'Camera-based PPG estimation — tap to measure', action: 'bpm' },
  { name: 'Skin Hydration Level',  emoji: '💧', pro: false, desc: 'Analyse moisture from scan' },
] as const;

function PulsingHeart({ active }: { active: boolean }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 350, easing: Easing.out(Easing.quad) }),
          withTiming(1.0,  { duration: 350, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [active, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.Text style={[{ fontSize: 52 }, style]}>❤️</Animated.Text>
  );
}

function HeartRateModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { bpm, spo2, isMeasuring, progress, result, startMeasurement, stop } = useHeartRate();

  const handleClose = () => {
    stop();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <Text style={modal.title}>Heart Rate (PPG)</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={modal.close}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={modal.scroll}>
          <LinearGradient colors={['#1a0533', '#2d1054']} style={modal.card}>
            <PulsingHeart active={isMeasuring} />

            {/* BPM readout */}
            <View style={modal.bpmRow}>
              <Text style={modal.bpmNum}>{bpm ?? '--'}</Text>
              <Text style={modal.bpmUnit}>bpm</Text>
            </View>

            {/* SpO2 */}
            <Text style={modal.spo2}>
              SpO₂: <Text style={modal.spo2Val}>{spo2 != null ? `${spo2}%` : '--'}</Text>
            </Text>

            {/* Progress bar */}
            {isMeasuring && (
              <View style={modal.progressTrack}>
                <Animated.View
                  style={[
                    modal.progressFill,
                    { width: `${Math.round(progress * 100)}%` },
                  ]}
                />
              </View>
            )}

            {isMeasuring && (
              <Text style={modal.hint}>
                Hold your finger steady · {Math.round((1 - progress) * 30)}s remaining
              </Text>
            )}
          </LinearGradient>

          {result ? (
            <Card variant="tint" style={modal.resultCard}>
              <Label color={colors.grn}>Measurement complete</Label>
              <View style={modal.resultRow}>
                <View style={modal.resultItem}>
                  <Text style={modal.resultVal}>{result.bpm}</Text>
                  <Text style={modal.resultLabel}>BPM · Normal</Text>
                </View>
                <View style={modal.resultDivider} />
                <View style={modal.resultItem}>
                  <Text style={modal.resultVal}>{result.spo2}%</Text>
                  <Text style={modal.resultLabel}>SpO₂ · Normal</Text>
                </View>
              </View>
              <Text style={modal.disclaimer}>
                For reference only. Not a medical device. Consult a doctor for clinical readings.
              </Text>
            </Card>
          ) : (
            <GradientButton
              label={isMeasuring ? 'Measuring…' : '💓 Start Measurement'}
              onPress={startMeasurement}
              variant={isMeasuring ? 'outline' : 'primary'}
            />
          )}

          <Card variant="white" style={modal.tipsCard}>
            <Label color={colors.t3}>How to get the best reading</Label>
            {[
              'Place your finger flat over the rear camera lens',
              'Apply gentle, steady pressure',
              'Hold still for the full 30 seconds',
              'Ensure good lighting — avoid direct sunlight',
            ].map((tip, i) => (
              <View key={i} style={modal.tipRow}>
                <Text style={modal.tipNum}>{i + 1}</Text>
                <Text style={modal.tipText}>{tip}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

interface VitalCard {
  label: string;
  value: string;
  unit: string;
  emoji: string;
  status: 'good' | 'ok' | 'alert';
}

const VITALS: VitalCard[] = [
  { label: 'Heart Rate', value: String(MOCK_VITALS.heartRate), unit: 'bpm', emoji: '❤️', status: 'good' },
  { label: 'SpO₂',       value: String(MOCK_VITALS.spo2),      unit: '%',   emoji: '💨', status: 'good' },
  { label: 'Sleep',      value: MOCK_VITALS.sleep,             unit: '',    emoji: '🌙', status: 'good' },
  { label: 'Stress',     value: MOCK_VITALS.stress,            unit: '',    emoji: '🧘', status: 'good' },
];

export default function HealthScreen() {
  const [bpmModalOpen, setBpmModalOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Health Hub</Text>
        <Text style={styles.pageSub}>Track vitals and run health diagnostics</Text>

        {/* Vitals strip */}
        <View style={styles.vitalsRow}>
          {VITALS.map(v => (
            <Card key={v.label} variant="tint" style={styles.vitalCard}>
              <Text style={styles.vitalEmoji}>{v.emoji}</Text>
              <Text style={styles.vitalValue}>
                {v.value}<Text style={styles.vitalUnit}>{v.unit}</Text>
              </Text>
              <Text style={styles.vitalLabel}>{v.label}</Text>
              <View style={[styles.vitalDot, { backgroundColor: STATUS_COLOR[v.status] }]} />
            </Card>
          ))}
        </View>

        {/* Advanced tests */}
        <Label color={colors.t3}>Diagnostics</Label>
        {TESTS.map(t => (
          <TouchableOpacity
            key={t.name}
            activeOpacity={0.85}
            onPress={'action' in t && t.action === 'bpm' ? () => setBpmModalOpen(true) : undefined}
          >
            <Card variant="white" style={styles.testCard}>
              <View style={styles.testRow}>
                <View style={styles.testIconWrap}>
                  <Text style={styles.testEmoji}>{t.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testName}>{t.name}</Text>
                  <Text style={styles.testDesc}>{t.desc}</Text>
                </View>
                {t.pro ? (
                  <LinearGradient colors={[...GRADIENT]} style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeText}>Free</Text>
                  </View>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Hardware kit CTA */}
        <GradientCard style={styles.kitCard}>
          <Label color="rgba(255,255,255,0.6)">SANO Hardware Kit</Label>
          <Text style={styles.kitTitle}>Unlock clinical-grade accuracy</Text>
          <Text style={styles.kitText}>
            The SANO wristband syncs with your app for real-time heart rate, SpO₂, and temperature tracking.
          </Text>
          <TouchableOpacity style={styles.kitBtn} activeOpacity={0.85}>
            <View style={styles.kitBtnInner}>
              <Text style={styles.kitBtnText}>Join the waitlist →</Text>
            </View>
          </TouchableOpacity>
        </GradientCard>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <HeartRateModal visible={bpmModalOpen} onClose={() => setBpmModalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  pageTitle: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.t1 },
  pageSub: { fontSize: fontSize.md, color: colors.t3, marginTop: -spacing.md },

  vitalsRow: { flexDirection: 'row', gap: spacing.sm },
  vitalCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    position: 'relative',
  },
  vitalEmoji: { fontSize: 20 },
  vitalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.t1 },
  vitalUnit: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.t3 },
  vitalLabel: { fontSize: fontSize.xs2, color: colors.t3, textAlign: 'center' },
  vitalDot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  testCard: { gap: spacing.sm },
  testRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  testIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testEmoji: { fontSize: 22 },
  testName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  testDesc: { fontSize: fontSize.sm, color: colors.t3 },
  proBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  proText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.white },
  freeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.grnLt,
    borderWidth: 1,
    borderColor: `${colors.grn}30`,
  },
  freeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.grn },

  kitCard: { gap: spacing.md },
  kitTitle: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  kitText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  kitBtn: { alignSelf: 'flex-start', borderRadius: radius.md, overflow: 'hidden' },
  kitBtnInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  kitBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.md },
});

const modal = StyleSheet.create({
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
  close: { fontSize: fontSize.md, color: colors.t3, fontWeight: fontWeight.medium },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  card: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  bpmRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  bpmNum: { fontSize: 72, fontWeight: fontWeight.extrabold, color: colors.white },
  bpmUnit: { fontSize: fontSize.xl, color: 'rgba(255,255,255,0.6)', fontWeight: fontWeight.medium },
  spo2: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.6)' },
  spo2Val: { fontWeight: fontWeight.bold, color: colors.white },

  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },
  hint: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },

  resultCard: { gap: spacing.md },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  resultItem: { alignItems: 'center', gap: 4 },
  resultVal: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.t1 },
  resultLabel: { fontSize: fontSize.sm, color: colors.t3 },
  resultDivider: { width: 1, height: 40, backgroundColor: colors.bdr },
  disclaimer: { fontSize: fontSize.xs, color: colors.t4, lineHeight: 18 },

  tipsCard: { gap: spacing.md },
  tipRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  tipNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bg3,
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.pur,
    lineHeight: 20,
  },
  tipText: { flex: 1, fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },
});
