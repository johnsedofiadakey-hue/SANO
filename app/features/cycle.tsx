import React, { useState } from 'react';
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
import { Chip } from '../../src/components/ui/Chip';
import { Label } from '../../src/components/ui/Label';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useCycleStore } from '../../src/store/cycleStore';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import type { CyclePhase, Symptom } from '../../src/types/health';

const { width } = Dimensions.get('window');

const PHASE_COLORS: Record<CyclePhase, string> = {
  period:     '#EC489933',
  follicular: '#0891B233',
  ovulation:  '#05996933',
  luteal:     '#7C3AED33',
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

const SKIN_FORECAST = [
  { day: 'Mon', label: 'Clear', level: 0.15 },
  { day: 'Tue', label: 'Clear', level: 0.2 },
  { day: 'Wed', label: 'Oily',  level: 0.55 },
  { day: 'Thu', label: 'Oily',  level: 0.65 },
  { day: 'Fri', label: 'Risk',  level: 0.8 },
  { day: 'Sat', label: 'Risk',  level: 0.75 },
  { day: 'Sun', label: 'Better',level: 0.4 },
];

export default function CycleScreen() {
  const router = useRouter();
  const { currentCycleDay, symptoms, logSymptom, removeSymptom, logPeriodStart } = useCycleStore();
  const { logEvent } = useDataCollection();
  const today = currentCycleDay ?? 14;
  const currentPhase = getPhaseForDay(today);

  React.useEffect(() => {
    logEvent('feature_opened', { feature: 'cycle' });
  }, [logEvent]);

  const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
  const COLS = 7;

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
        {/* Phase legend */}
        <View style={styles.legendRow}>
          {(Object.keys(PHASE_COLORS) as CyclePhase[]).map(p => (
            <View key={p} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PHASE_BORDER[p] }]} />
              <Text style={styles.legendText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* 28-day calendar grid */}
        <Card variant="white" noPadding style={styles.calCard}>
          <View style={styles.calGrid}>
            {DAYS.map(day => {
              const phase = getPhaseForDay(day);
              const isToday = day === today;
              const bg = PHASE_COLORS[phase];
              const border = isToday ? PHASE_BORDER[phase] : 'transparent';
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.calDay,
                    { backgroundColor: bg, borderColor: border },
                    isToday && styles.calDayToday,
                  ]}
                  onPress={() => logEvent('cycle_day_logged', { day })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.calDayNum, isToday && styles.calDayNumToday]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Skin forecast */}
        <Label color={colors.t3}>Skin forecast this week</Label>
        <Card variant="tint" style={styles.forecastCard}>
          <View style={styles.forecastRow}>
            {SKIN_FORECAST.map(f => {
              const barColor = f.level > 0.6 ? colors.red : f.level > 0.35 ? colors.amber : colors.grn;
              return (
                <View key={f.day} style={styles.forecastItem}>
                  <View style={styles.forecastBarWrap}>
                    <View
                      style={[
                        styles.forecastBar,
                        { height: f.level * 60, backgroundColor: barColor },
                      ]}
                    />
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

        {/* Period prediction */}
        <Card variant="tint" style={styles.predictionCard}>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionEmoji}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.predictionTitle}>Next period predicted</Text>
              <Text style={styles.predictionDate}>In {28 - today} days · Day 1 of cycle</Text>
            </View>
            <TouchableOpacity
              onPress={() => logPeriodStart(new Date().toISOString())}
              style={styles.logBtn}
            >
              <LinearGradient colors={[...GRADIENT]} style={styles.logBtnGrad}>
                <Text style={styles.logBtnText}>Log</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const DAY_SIZE = Math.floor((Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2 - 6 * 4) / 7);

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

  legendRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium, textTransform: 'capitalize' },

  calCard: { overflow: 'hidden' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: 4 },
  calDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  calDayToday: {
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  calDayNum: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.t2 },
  calDayNumToday: { fontWeight: fontWeight.extrabold, color: colors.t1 },

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
