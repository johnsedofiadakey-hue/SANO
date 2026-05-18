import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius, shadows } from '../../src/theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useHeartRate } from '../../src/hooks/useHeartRate';
import { useRef } from 'react';
import { FIREBASE_READY, auth } from '../../src/config/firebase';
import { firestoreService } from '../../src/services/firestore';
import { healthConnectService } from '../../src/services/healthConnect';

const { width } = Dimensions.get('window');

const STATUS_COLOR = {
  good:  colors.grn,
  ok:    colors.amber,
  alert: colors.red,
} as const;

const TESTS = [
  { name: 'Malaria Screening',     emoji: '🦟', pro: false, desc: 'Symptom-based risk assessment',              tint: '#FEF9C3', route: '/features/malaria' as const },
  { name: 'Blood / Sickle Cell',   emoji: '🩸', pro: false, desc: 'Log blood group + sickle cell risk screen',  tint: '#FEE2E2', route: '/features/blood-test' as const },
  { name: 'Heart Rate (PPG)',       emoji: '💓', pro: false, desc: 'Camera-based PPG — tap to measure',          tint: '#FDF4FF', action: 'bpm' as const },
  { name: 'Doctor Consultation',   emoji: '👨‍⚕️', pro: false, desc: 'Ask a verified dermatologist',               tint: '#F0FDF4', route: '/features/consult' as const },
  { name: 'Skin Hydration Level',  emoji: '💧', pro: true,  desc: 'Analyse moisture from scan',                 tint: '#EFF6FF' },
] as const;

function PulsingHeart({ active }: { active: boolean }) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 380, easing: Easing.out(Easing.quad) }),
          withTiming(1.0, { duration: 380, easing: Easing.in(Easing.quad) }),
        ), -1, false,
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [active, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.Text style={[{ fontSize: 56 }, style]}>❤️</Animated.Text>;
}

function HeartRateModal({ visible, onClose, onResult, insight, insightLoading }: { visible: boolean; onClose: () => void; onResult: (res: { bpm: number; spo2: number }) => void; insight: string | null; insightLoading: boolean }) {
  const { isMeasuring, progress, result, error, startMeasurement, stop } = useHeartRate();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleClose = () => { stop(); onClose(); };

  React.useEffect(() => {
    if (result) onResult(result);
  }, [result, onResult]);

  const handleStart = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    startMeasurement(async () => {
      if (cameraRef.current) {
        const video = await cameraRef.current.recordAsync({ maxDuration: 30 });
        return video.uri;
      }
      throw new Error('Camera not ready');
    });
  };

  const secondsLeft = Math.ceil((1 - progress) * 30);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <Text style={modal.title}>Heart Rate</Text>
          <TouchableOpacity onPress={handleClose} style={modal.closeBtn}>
            <Text style={modal.close}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={modal.scroll}>
          <LinearGradient colors={['#160730', '#2d0f54']} style={modal.card}>
            {isMeasuring ? (
              <View style={{ width: 100, height: 100, borderRadius: 50, overflow: 'hidden' }}>
                <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" flash="on" mode="video" />
              </View>
            ) : (
              <PulsingHeart active={!!result} />
            )}

            {isMeasuring ? (
              <>
                <Text style={modal.measuringLabel}>Analysing…</Text>
                <View style={modal.progressTrack}>
                  <Animated.View style={[modal.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
                </View>
                <Text style={modal.hint}>
                  Hold finger over rear camera · {secondsLeft}s remaining
                </Text>
              </>
            ) : result ? (
              <>
                <View style={modal.bpmRow}>
                  <Text style={modal.bpmNum}>{result.bpm}</Text>
                  <Text style={modal.bpmUnit}>bpm</Text>
                </View>
                <Text style={modal.spo2}>SpO₂  <Text style={modal.spo2Val}>{result.spo2}%</Text></Text>
              </>
            ) : (
              <>
                <View style={modal.bpmRow}>
                  <Text style={modal.bpmNum}>--</Text>
                  <Text style={modal.bpmUnit}>bpm</Text>
                </View>
                <Text style={modal.spo2}>SpO₂  <Text style={modal.spo2Val}>--</Text></Text>
              </>
            )}
          </LinearGradient>

          {error && (
            <View style={modal.errorCard}>
              <Text style={modal.errorText}>{error}</Text>
            </View>
          )}

          {result ? (
            <Card variant="tint" style={modal.resultCard}>
              <Label color={colors.grn}>Measurement complete</Label>
              <View style={modal.resultRow}>
                <View style={modal.resultItem}>
                  <Text style={modal.resultVal}>{result.bpm}</Text>
                  <Text style={modal.resultLabel}>BPM</Text>
                </View>
                <View style={modal.resultDivider} />
                <View style={modal.resultItem}>
                  <Text style={modal.resultVal}>{result.spo2}%</Text>
                  <Text style={modal.resultLabel}>SpO₂</Text>
                </View>
              </View>
              {(insightLoading || insight) && (
                <View style={modal.insightBox}>
                  <Text style={modal.insightText}>
                    {insightLoading ? 'SANO AI is analysing your reading…' : insight}
                  </Text>
                </View>
              )}
              <Text style={modal.disclaimer}>
                For reference only. Not a medical device. Consult a doctor for clinical readings.
              </Text>
            </Card>
          ) : (
            <GradientButton
              label={isMeasuring ? 'Measuring…' : '💓  Start Measurement'}
              onPress={isMeasuring ? undefined : handleStart}
              variant={isMeasuring ? 'outline' : 'primary'}
            />
          )}

          <Card variant="white" style={modal.tipsCard}>
            <Label color={colors.t3}>How to get the best reading</Label>
            {[
              'Place finger flat over the rear camera lens',
              'Apply gentle, steady pressure',
              'Hold still for the full 30 seconds',
              'Ensure good lighting — avoid direct sunlight',
            ].map((tip, i) => (
              <View key={i} style={modal.tipRow}>
                <View style={modal.tipNum}><Text style={modal.tipNumText}>{i + 1}</Text></View>
                <Text style={modal.tipText}>{tip}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function HealthScreen() {
  const router = useRouter();
  const [bpmModalOpen, setBpmModalOpen] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<{ bpm: number; spo2: number } | null>(null);
  const [bpmInsight, setBpmInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const saveVitals = async (res: { bpm: number; spo2: number }) => {
    setMeasurementResult(res);
    if (FIREBASE_READY && auth?.currentUser?.uid) {
      try {
        await firestoreService.saveHealthEvent(auth.currentUser.uid, {
          type: 'heart_rate',
          value: { bpm: res.bpm, spo2: res.spo2 },
          confidence: 0.9,
        });
      } catch (e) {
        console.error('Failed to save vitals to cloud:', e);
      }
    }
    // Ask Claude to interpret the reading
    setInsightLoading(true);
    try {
      const { sendChatMessage } = await import('../../src/services/aiChat');
      const insight = await sendChatMessage(
        `My heart rate just measured ${res.bpm} BPM and SpO₂ is ${res.spo2}%. Give me a brief 2-sentence interpretation — is this healthy, and any skin or wellness tip?`,
        [],
        { heartRate: res.bpm, spo2: res.spo2 }
      );
      setBpmInsight(insight);
    } catch {
      // non-critical, skip silently
    } finally {
      setInsightLoading(false);
    }
  };
  
  const [sleepModalOpen, setSleepModalOpen] = useState(false);
  const [stressModalOpen, setStressModalOpen] = useState(false);
  const [loggedSleep, setLoggedSleep] = useState<string | null>(null);
  const [loggedStress, setLoggedStress] = useState<string | null>(null);

  const handleSync = async () => {
    if (!healthConnectService.isAvailable()) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    const data = await healthConnectService.syncAll(uid);
    if (data.sleepHours?.value) {
      setLoggedSleep(String(data.sleepHours.value));
    }
  };

  const VITALS = [
    { label: 'Heart Rate', value: measurementResult ? String(measurementResult.bpm) : '--', unit: 'bpm', emoji: '❤️', status: 'good' as const, tint: '#FFF1F2', icon_tint: '#FCA5A5', action: 'bpm' },
    { label: 'SpO₂',       value: measurementResult ? String(measurementResult.spo2) : '--',      unit: '%',   emoji: '💨', status: 'good' as const, tint: '#EFF6FF', icon_tint: '#93C5FD', action: 'spo2' },
    { label: 'Sleep',      value: loggedSleep || '--',             unit: 'hrs',    emoji: '🌙', status: 'good' as const, tint: '#F5F3FF', icon_tint: '#C4B5FD', action: 'sleep' },
    { label: 'Stress',     value: loggedStress || '--',            unit: '',    emoji: '🧘', status: 'good' as const, tint: '#F0FDF4', icon_tint: '#86EFAC', action: 'stress' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(20)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.pageTitle}>Health Hub</Text>
            <Text style={styles.pageSub}>Vitals, diagnostics, and wellness</Text>
          </View>
          <TouchableOpacity onPress={handleSync} style={{ padding: spacing.sm }}>
            <Text style={{ color: colors.pur, fontFamily: 'Inter_600SemiBold' }}>🔄 Sync</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Vitals 2×2 grid ── */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(20)} style={styles.vitalsGrid}>
          {VITALS.map(v => (
            <TouchableOpacity 
              key={v.label} 
              style={[styles.vitalCard, { backgroundColor: v.tint }]}
              onPress={() => {
                if (v.action === 'sleep') setSleepModalOpen(true);
                if (v.action === 'stress') setStressModalOpen(true);
                if (v.action === 'bpm' || v.action === 'spo2') setBpmModalOpen(true);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.vitalIconWrap, { backgroundColor: v.icon_tint }]}>
                <Text style={styles.vitalEmoji}>{v.emoji}</Text>
              </View>
              <Text style={styles.vitalValue}>
                {v.value}
                {v.unit && v.value !== '--' ? <Text style={styles.vitalUnit}> {v.unit}</Text> : null}
              </Text>
              <Text style={styles.vitalLabel}>{v.label}</Text>
              <View style={[styles.vitalStatus, { backgroundColor: STATUS_COLOR[v.status] }]} />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Diagnostics ── */}
        <Animated.View entering={FadeInDown.delay(160).springify().damping(20)}>
          <Label color={colors.t3} style={styles.sectionLabel}>Diagnostics</Label>
          <Card variant="white" noPadding elevated>
            {TESTS.map((t, i) => (
              <React.Fragment key={t.name}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    'action' in t && t.action === 'bpm'
                      ? () => setBpmModalOpen(true)
                      : 'route' in t && t.route
                        ? () => router.push(t.route as any)
                        : t.pro
                          ? () => Alert.alert('Coming soon', `${t.name} will be available in the next SANO update.`)
                          : undefined
                  }
                  style={styles.testRow}
                >
                  <View style={[styles.testIconWrap, { backgroundColor: t.tint }]}>
                    <Text style={styles.testEmoji}>{t.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testName}>{t.name}</Text>
                    <Text style={styles.testDesc}>{t.desc}</Text>
                  </View>
                  {t.pro ? (
                    <LinearGradient colors={[...GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.proBadge}>
                      <Text style={styles.proText}>PRO</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeText}>Free</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {i < TESTS.length - 1 && <View style={styles.testDivider} />}
              </React.Fragment>
            ))}
          </Card>
        </Animated.View>

        {/* ── Hardware kit CTA ── */}
        <Animated.View entering={FadeInDown.delay(220).springify().damping(20)}>
          <GradientCard style={styles.kitCard}>
            <Label color="rgba(255,255,255,0.55)">SANO Hardware Kit</Label>
            <Text style={styles.kitTitle}>Clinical-grade accuracy</Text>
            <Text style={styles.kitText}>
              The SANO wristband syncs with your app for real-time heart rate, SpO₂, and temperature tracking.
            </Text>
            <TouchableOpacity style={styles.kitBtn} activeOpacity={0.85}>
              <View style={styles.kitBtnInner}>
                <Text style={styles.kitBtnText}>Join the waitlist  →</Text>
              </View>
            </TouchableOpacity>
          </GradientCard>
        </Animated.View>

        {/* Tab bar padding */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <HeartRateModal visible={bpmModalOpen} onClose={() => { setBpmModalOpen(false); setBpmInsight(null); }} onResult={saveVitals} insight={bpmInsight} insightLoading={insightLoading} />
      
      {/* Sleep Modal */}
      <Modal visible={sleepModalOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={modal.safe}>
          <View style={modal.header}>
            <Text style={modal.title}>Log Sleep</Text>
            <TouchableOpacity onPress={() => setSleepModalOpen(false)}>
              <Text style={modal.close}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={modal.scroll}>
            <Card variant="white" style={{ gap: spacing.md }}>
              <Label color={colors.t3}>How many hours did you sleep?</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {['4', '5', '6', '7', '8', '9', '10'].map(hrs => (
                  <TouchableOpacity 
                    key={hrs} 
                    style={[styles.testIconWrap, { backgroundColor: colors.bg2, width: 60, height: 40 }]}
                    onPress={async () => {
                      setLoggedSleep(hrs);
                      setSleepModalOpen(false);
                      if (FIREBASE_READY && auth?.currentUser?.uid) {
                        await firestoreService.saveHealthEvent(auth.currentUser.uid, {
                          type: 'sleep',
                          value: { hours: parseInt(hrs, 10) },
                        });
                      }
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_700Bold', color: colors.t1 }}>{hrs} hrs</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Stress Modal */}
      <Modal visible={stressModalOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={modal.safe}>
          <View style={modal.header}>
            <Text style={modal.title}>Log Stress</Text>
            <TouchableOpacity onPress={() => setStressModalOpen(false)}>
              <Text style={modal.close}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={modal.scroll}>
            <Card variant="white" style={{ gap: spacing.md }}>
              <Label color={colors.t3}>How do you feel today?</Label>
              <View style={{ gap: spacing.sm }}>
                {[
                  { level: '1', label: 'Calm', emoji: '🧘' },
                  { level: '2', label: 'Moderate', emoji: '😐' },
                  { level: '3', label: 'Stressed', emoji: '😰' },
                  { level: '4', label: 'Overwhelmed', emoji: '🤯' },
                ].map(item => (
                  <TouchableOpacity 
                    key={item.level} 
                    style={[styles.testRow, { backgroundColor: colors.bg2, borderRadius: radius.md, padding: spacing.md }]}
                    onPress={async () => {
                      setLoggedStress(item.label);
                      setStressModalOpen(false);
                      if (FIREBASE_READY && auth?.currentUser?.uid) {
                        await firestoreService.saveHealthEvent(auth.currentUser.uid, {
                          type: 'stress',
                          value: { level: parseInt(item.level, 10), label: item.label },
                        });
                      }
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: spacing.md }}>{item.emoji}</Text>
                    <View>
                      <Text style={{ fontFamily: 'Inter_700Bold', color: colors.t1 }}>{item.label}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.t3 }}>Level {item.level}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  pageTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.t1 },
  pageSub: { fontSize: fontSize.md, color: colors.t3, marginTop: 2 },
  sectionLabel: { marginBottom: -spacing.sm },

  // Vitals 2×2
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  vitalCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  vitalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  vitalEmoji: { fontSize: 20 },
  vitalValue: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.t1 },
  vitalUnit: { fontSize: fontSize.sm, fontFamily: 'Inter_400Regular', color: colors.t3 },
  vitalLabel: { fontSize: fontSize.xs, color: colors.t3, fontFamily: 'Inter_500Medium' },
  vitalStatus: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 7, height: 7, borderRadius: 4,
  },

  // Tests
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  testDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.bdr, marginLeft: 72 },
  testIconWrap: {
    width: 44, height: 44, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  testEmoji: { fontSize: 22 },
  testName: { fontSize: fontSize.md, fontFamily: 'Inter_600SemiBold', color: colors.t1, marginBottom: 2 },
  testDesc: { fontSize: fontSize.sm, color: colors.t3 },
  proBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
  },
  proText: { fontSize: fontSize.xs2, fontFamily: 'Inter_700Bold', color: colors.white },
  freeBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
    backgroundColor: colors.grnLt, borderWidth: 1, borderColor: `${colors.grn}40`,
  },
  freeText: { fontSize: fontSize.xs2, fontFamily: 'Inter_700Bold', color: colors.grn },

  // Kit card
  kitCard: { gap: spacing.md },
  kitTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  kitText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.78)', lineHeight: 20 },
  kitBtn: { alignSelf: 'flex-start' },
  kitBtnInner: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  kitBtnText: { color: colors.white, fontFamily: 'Inter_700Bold', fontSize: fontSize.md },
});

const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.bdr,
  },
  title: { fontSize: fontSize.lg, fontFamily: 'Inter_700Bold', color: colors.t1 },
  closeBtn: {},
  close: { fontSize: fontSize.md, color: colors.pur, fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  card: {
    borderRadius: radius.xl, padding: spacing.xxl,
    alignItems: 'center', gap: spacing.lg,
  },
  bpmRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  bpmNum: { fontSize: 76, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  bpmUnit: { fontSize: fontSize.xl, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter_500Medium' },
  spo2: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.55)' },
  spo2Val: { fontFamily: 'Inter_700Bold', color: colors.white },

  measuringLabel: {
    fontSize: fontSize.lg, fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.7)', letterSpacing: 1,
  },
  progressTrack: {
    width: '100%', height: 5,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#A855F7', borderRadius: 3 },
  hint: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  errorCard: {
    backgroundColor: '#FEF2F2', borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: '#FCA5A5',
  },
  errorText: { fontSize: fontSize.sm, color: colors.red, textAlign: 'center', lineHeight: 20 },

  resultCard: { gap: spacing.md },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  resultItem: { alignItems: 'center', gap: 4 },
  resultVal: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.t1 },
  resultLabel: { fontSize: fontSize.sm, color: colors.t3 },
  resultDivider: { width: 1, height: 40, backgroundColor: colors.bdr },
  disclaimer: { fontSize: fontSize.xs, color: colors.t4, lineHeight: 18 },
  insightBox: { marginTop: spacing.sm, backgroundColor: colors.bg2, borderRadius: radius.md, padding: spacing.sm },
  insightText: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },

  tipsCard: { gap: spacing.md },
  tipRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  tipNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.purMid,
    alignItems: 'center', justifyContent: 'center',
  },
  tipNumText: {
    fontSize: fontSize.xs, fontFamily: 'Inter_700Bold',
    color: colors.pur, lineHeight: 22,
  },
  tipText: { flex: 1, fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },
});
