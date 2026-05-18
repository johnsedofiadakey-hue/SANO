import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useCycleStore, getSkinForecastForPhase } from '../../src/store/cycleStore';
import { useProfileStore } from '../../src/store/profileStore';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import type { CyclePhase, Symptom } from '../../src/types/health';

const { width } = Dimensions.get('window');
const DAY_SIZE = Math.floor((width - spacing.lg * 2 - spacing.md * 2 - 6 * 4) / 7);

const PHASE_COLORS: Record<CyclePhase, string> = {
  period:     '#EC489922',
  follicular: '#0891B222',
  ovulation:  '#05996922',
  luteal:     '#7C3AED22',
};

const PHASE_BORDER: Record<CyclePhase, string> = {
  period:     '#EC4899',
  follicular: '#0891B2',
  ovulation:  '#059669',
  luteal:     '#7C3AED',
};

function getPhaseForDay(day: number): CyclePhase {
  if (day <= 5)  return 'period';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulation';
  return 'luteal';
}

const SYMPTOMS: { key: Symptom; label: string; emoji: string }[] = [
  { key: 'cramps',      label: 'Cramps',      emoji: '😣' },
  { key: 'bloating',    label: 'Bloating',    emoji: '🫃' },
  { key: 'headache',    label: 'Headache',    emoji: '🤕' },
  { key: 'fatigue',     label: 'Fatigue',     emoji: '😴' },
  { key: 'mood_swings', label: 'Mood swings', emoji: '🎭' },
  { key: 'breakouts',   label: 'Breakouts',   emoji: '😤' },
  { key: 'clear_skin',  label: 'Clear skin',  emoji: '✨' },
  { key: 'oily_skin',   label: 'Oily skin',   emoji: '💦' },
  { key: 'dry_skin',    label: 'Dry skin',    emoji: '🏜️' },
];

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildCalendarDates(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from 3 weeks ago, show 5 weeks (35 days)
  const start = new Date(today);
  start.setDate(start.getDate() - 21);
  // Align to Sunday
  const dow = start.getDay();
  start.setDate(start.getDate() - dow);
  const dates: Date[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function CycleScreen() {
  const router = useRouter();
  const {
    currentCycleDay,
    currentPhase,
    nextPeriodDate,
    periodDays,
    periodStartDate,
    symptoms,
    logSymptom,
    removeSymptom,
    logPeriodStart,
    togglePeriodDay,
  } = useCycleStore();
  const { logEvent } = useDataCollection();
  const { skinConcerns } = useProfileStore();
  const [phaseInsight, setPhaseInsight] = useState<string | null>(null);
  const insightFetched = useRef(false);

  useEffect(() => {
    logEvent('feature_opened', { feature: 'cycle' });
  }, [logEvent]);

  useEffect(() => {
    if (!currentCycleDay || insightFetched.current) return;
    insightFetched.current = true;
    import('../../src/services/aiChat').then(({ sendChatMessage }) =>
      sendChatMessage(
        `I'm on Day ${currentCycleDay} of my menstrual cycle in the ${currentPhase ?? 'follicular'} phase. My skin concerns are: ${skinConcerns?.join(', ') || 'general skincare'}. Give me one warm, specific sentence about how this phase is affecting my skin today and what to do about it.`,
        [],
        { cycleDay: currentCycleDay, cyclePhase: currentPhase ?? 'follicular', skinConcerns }
      )
    ).then(setPhaseInsight).catch(() => {});
  }, [currentCycleDay, currentPhase]);

  const calDates = buildCalendarDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);

  const phase = currentPhase ?? 'follicular';
  const cycleDay = currentCycleDay ?? 1;
  const skinForecast = getSkinForecastForPhase(phase, cycleDay);

  // Days until next period
  let daysUntilNext: number | null = null;
  if (nextPeriodDate) {
    const next = new Date(nextPeriodDate);
    next.setHours(0, 0, 0, 0);
    daysUntilNext = Math.max(0, Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const handleDayTap = async (d: Date) => {
    const iso = toISO(d);
    await togglePeriodDay(iso);
    logEvent('cycle_day_toggled', { date: iso });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cycle Tracker</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Current phase banner */}
        {currentCycleDay && (
          <LinearGradient colors={[...GRADIENT]} style={styles.phaseBanner}>
            <Text style={styles.phaseBannerLabel}>Day {currentCycleDay} · {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase</Text>
            <Text style={styles.phaseBannerSub}>
              {phaseInsight ?? (phase === 'period' ? 'Skin is most sensitive — be gentle' :
               phase === 'follicular' ? 'Great time for active ingredients' :
               phase === 'ovulation' ? 'Skin looks its best this week' :
               'Breakout risk rising — watch oil levels')}
            </Text>
          </LinearGradient>
        )}

        {/* Phase legend */}
        <View style={styles.legendRow}>
          {(Object.keys(PHASE_COLORS) as CyclePhase[]).map(p => (
            <View key={p} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PHASE_BORDER[p] }]} />
              <Text style={styles.legendText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Calendar */}
        <Card variant="white" noPadding style={styles.calCard}>
          {/* Day-of-week header */}
          <View style={styles.dowRow}>
            {DOW_LABELS.map(d => (
              <Text key={d} style={styles.dowLabel}>{d}</Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {calDates.map((d, i) => {
              const iso = toISO(d);
              const isPeriodDay = periodDays.includes(iso);
              const isToday = iso === todayISO;
              const isFuture = d > today;

              // Calculate cycle day for phase coloring
              let phaseBg = 'transparent';
              let phaseBorderColor = 'transparent';
              if (periodStartDate) {
                const start = new Date(periodStartDate);
                start.setHours(0, 0, 0, 0);
                const diff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                if (diff >= 0 && diff < 28) {
                  const dayInCycle = diff + 1;
                  const p = getPhaseForDay(dayInCycle);
                  phaseBg = PHASE_COLORS[p];
                  if (isToday) phaseBorderColor = PHASE_BORDER[p];
                }
              }

              return (
                <TouchableOpacity
                  key={iso}
                  style={[
                    styles.calDay,
                    { backgroundColor: isPeriodDay ? '#EC489940' : phaseBg },
                    { borderColor: isToday ? (phaseBorderColor || colors.pur) : 'transparent' },
                    isFuture && styles.calDayFuture,
                  ]}
                  onPress={() => handleDayTap(d)}
                  activeOpacity={0.75}
                >
                  {isPeriodDay && (
                    <View style={styles.periodCircle} />
                  )}
                  <Text style={[
                    styles.calDayNum,
                    isToday && styles.calDayNumToday,
                    isPeriodDay && styles.calDayNumPeriod,
                    isFuture && styles.calDayNumFuture,
                  ]}>
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.calHint}>Tap days to mark period · Pink = period days</Text>
        </Card>

        {/* Skin forecast */}
        <Label color={colors.t3}>Skin forecast this week</Label>
        <Card variant="tint" style={styles.forecastCard}>
          <View style={styles.forecastRow}>
            {skinForecast.map(f => {
              const barColor = f.level > 0.6 ? colors.red : f.level > 0.35 ? colors.amber : colors.grn;
              return (
                <View key={f.day} style={styles.forecastItem}>
                  <View style={styles.forecastBarWrap}>
                    <View style={[styles.forecastBar, { height: f.level * 60, backgroundColor: barColor }]} />
                  </View>
                  <Text style={styles.forecastDay}>{f.day}</Text>
                  <Text style={[styles.forecastLabel, { color: barColor }]}>{f.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Symptom logger */}
        <Label color={colors.t3}>Log today's symptoms</Label>
        <View style={styles.symptomsGrid}>
          {SYMPTOMS.map(s => (
            <TouchableOpacity
              key={s.key}
              onPress={() => {
                symptoms.includes(s.key) ? removeSymptom(s.key) : logSymptom(s.key);
                logEvent('symptom_logged', { symptom: s.key });
              }}
              style={[styles.symptomChip, symptoms.includes(s.key) && styles.symptomChipActive]}
              activeOpacity={0.8}
            >
              <Text style={styles.symptomEmoji}>{s.emoji}</Text>
              <Text style={[styles.symptomLabel, symptoms.includes(s.key) && styles.symptomLabelActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next period prediction */}
        <Card variant="tint" style={styles.predictionCard}>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionEmoji}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.predictionTitle}>Next period predicted</Text>
              <Text style={styles.predictionDate}>
                {daysUntilNext !== null
                  ? daysUntilNext === 0
                    ? 'Today · Day 1 of cycle'
                    : `In ${daysUntilNext} days`
                  : 'Log period days to get a prediction'}
              </Text>
            </View>
            {!periodStartDate && (
              <TouchableOpacity
                onPress={() => logPeriodStart(todayISO)}
                style={styles.logBtn}
              >
                <LinearGradient colors={[...GRADIENT]} style={styles.logBtnGrad}>
                  <Text style={styles.logBtnText}>Log today</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Card>

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

  phaseBanner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 4,
  },
  phaseBannerLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.white },
  phaseBannerSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)' },

  legendRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium, textTransform: 'capitalize' },

  calCard: { overflow: 'hidden' },
  dowRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 4,
  },
  dowLabel: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: fontSize.xs2,
    color: colors.t4,
    fontWeight: fontWeight.bold,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  calDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  calDayFuture: { opacity: 0.45 },
  calDayNum: { fontSize: 11, fontWeight: fontWeight.medium, color: colors.t2 },
  calDayNumToday: { fontWeight: fontWeight.extrabold, color: colors.t1 },
  calDayNumPeriod: { color: '#EC4899', fontWeight: fontWeight.bold },
  calDayNumFuture: { color: colors.t4 },
  periodCircle: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#EC4899',
  },
  calHint: {
    fontSize: fontSize.xs2,
    color: colors.t4,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },

  forecastCard: { gap: spacing.sm },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  forecastItem: { alignItems: 'center', gap: 4 },
  forecastBarWrap: { height: 60, justifyContent: 'flex-end' },
  forecastBar: { width: 16, borderRadius: radius.full, minHeight: 4 },
  forecastDay: { fontSize: fontSize.xs2, color: colors.t3 },
  forecastLabel: { fontSize: fontSize.xs2, fontWeight: fontWeight.bold },

  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.bdr,
    backgroundColor: colors.bg2,
  },
  symptomChipActive: {
    borderColor: colors.pur,
    backgroundColor: colors.purMid,
  },
  symptomEmoji: { fontSize: 14 },
  symptomLabel: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },
  symptomLabelActive: { color: colors.pur, fontWeight: fontWeight.bold },

  predictionCard: { gap: spacing.sm },
  predictionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  predictionEmoji: { fontSize: 24 },
  predictionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  predictionDate: { fontSize: fontSize.sm, color: colors.t3 },
  logBtn: { borderRadius: radius.md, overflow: 'hidden' },
  logBtnGrad: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  logBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.sm },
});
