import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useDataCollection } from '../../src/hooks/useDataCollection';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - spacing.lg * 2;

const STATS = [
  { label: 'Severity',   before: '68%',  after: '42%',  emoji: '📉', positive: true  },
  { label: 'Improvement', before: '—',    after: '+38%',  emoji: '✨', positive: true  },
  { label: 'Duration',   before: '6 wk', after: '3 wk',  emoji: '⏱️', positive: true  },
];

const TIMELINE = [
  { week: 'Week 1', severity: 0.68, label: 'Severe' },
  { week: 'Week 2', severity: 0.62, label: 'Severe' },
  { week: 'Week 3', severity: 0.55, label: 'Moderate' },
  { week: 'Week 4', severity: 0.48, label: 'Moderate' },
  { week: 'Week 5', severity: 0.42, label: 'Moderate' },
];

export default function CompareScreen() {
  const router = useRouter();
  const [sliderPos, setSliderPos] = useState(SLIDER_WIDTH / 2);
  const { logEvent } = useDataCollection();

  React.useEffect(() => {
    logEvent('feature_opened', { feature: 'compare' });
  }, [logEvent]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPos = Math.max(0, Math.min(SLIDER_WIDTH, gestureState.moveX - spacing.lg));
      setSliderPos(newPos);
    },
  });

  const handleShare = async () => {
    await Share.share({
      message: 'Look at my skin glow-up with SANO! Severity went from 68% to 42% in 5 weeks 💜 #SANOSkincare',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Before / After</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Slider comparison */}
        <View style={styles.sliderContainer} {...panResponder.panHandlers}>
          {/* Before */}
          <View style={styles.sliderPanel}>
            <LinearGradient colors={['#EDE8FF', '#D4C6FF']} style={styles.sliderImg}>
              <Text style={styles.sliderEmoji}>😟</Text>
              <Text style={styles.sliderLabel}>Before</Text>
              <Text style={styles.sliderDate}>Mar 15</Text>
            </LinearGradient>
          </View>

          {/* After (clipped to sliderPos) */}
          <View
            style={[styles.sliderPanel, styles.sliderAfter, { width: sliderPos }]}
          >
            <LinearGradient colors={[...GRADIENT]} style={styles.sliderImg}>
              <Text style={styles.sliderEmoji}>😊</Text>
              <Text style={[styles.sliderLabel, { color: colors.white }]}>After</Text>
              <Text style={[styles.sliderDate, { color: 'rgba(255,255,255,0.7)' }]}>May 11</Text>
            </LinearGradient>
          </View>

          {/* Divider + handle */}
          <View style={[styles.sliderDivider, { left: sliderPos }]}>
            <LinearGradient colors={[...GRADIENT]} style={styles.sliderHandle}>
              <Text style={styles.handleIcon}>↔</Text>
            </LinearGradient>
          </View>
        </View>

        <Text style={styles.sliderHint}>Drag to compare before and after</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <Card key={s.label} variant="tint" style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <View style={styles.statValues}>
                {s.before !== '—' && (
                  <Text style={styles.statBefore}>{s.before}</Text>
                )}
                <Text style={[styles.statAfter, s.positive && { color: colors.grn }]}>
                  {s.after}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Progress timeline */}
        <Label color={colors.t3}>Progress timeline</Label>
        <Card variant="white" style={styles.timelineCard}>
          <View style={styles.timelineChart}>
            {TIMELINE.map((t, i) => {
              const barColor =
                t.severity > 0.6 ? colors.red :
                t.severity > 0.45 ? colors.amber : colors.grn;
              return (
                <View key={i} style={styles.timelineBar}>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={i === TIMELINE.length - 1 ? [...GRADIENT] : [barColor, barColor]}
                      style={[styles.barFill, { height: `${t.severity * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.barWeek}>{t.week}</Text>
                  <Text style={[styles.barLabel, { color: barColor }]}>{t.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.actions}>
          <GradientButton
            label="🎉 Share my glow-up"
            onPress={handleShare}
            variant="primary"
          />
          <GradientButton
            label="📄 Export PDF"
            onPress={() => {}}
            variant="outline"
          />
        </View>

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

  sliderContainer: {
    height: 240,
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.bg3,
  },
  sliderPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sliderAfter: {
    overflow: 'hidden',
    right: 'auto',
  },
  sliderImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sliderEmoji: { fontSize: 48 },
  sliderLabel: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.t1 },
  sliderDate: { fontSize: fontSize.sm, color: colors.t3 },
  sliderDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    marginLeft: -1.5,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderHandle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.pur,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  handleIcon: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.md },
  sliderHint: { fontSize: fontSize.xs, color: colors.t4, textAlign: 'center', marginTop: -spacing.sm },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
  },
  statEmoji: { fontSize: 20 },
  statLabel: { fontSize: fontSize.xs, color: colors.t3, textAlign: 'center' },
  statValues: { alignItems: 'center' },
  statBefore: { fontSize: fontSize.sm, color: colors.t4, textDecorationLine: 'line-through' },
  statAfter: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.t1 },

  timelineCard: { gap: spacing.md },
  timelineChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: spacing.sm },
  timelineBar: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bg3,
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: { borderRadius: radius.sm },
  barWeek: { fontSize: fontSize.xs2, color: colors.t4, textAlign: 'center' },
  barLabel: { fontSize: fontSize.xs2, fontWeight: fontWeight.bold, textAlign: 'center' },

  actions: { gap: spacing.sm },
});
