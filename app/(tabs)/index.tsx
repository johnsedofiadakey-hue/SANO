import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { GradientRing } from '../../src/components/ui/GradientRing';
import { Avatar } from '../../src/components/ui/Avatar';
import { Label } from '../../src/components/ui/Label';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useProfileStore } from '../../src/store/profileStore';
import { useScanStore } from '../../src/store/scanStore';
import { useCycleStore } from '../../src/store/cycleStore';

const { width } = Dimensions.get('window');

const TIPS = [
  'Drink 8 glasses of water daily — hydration shows on your face within 48 hours.',
  'Apply SPF 30+ every morning, even on cloudy days. UV rays penetrate clouds.',
  'Change your pillowcase every 3 days to reduce acne-causing bacteria.',
  'Never pop a pimple — it causes hyperpigmentation, especially on dark skin.',
];

function QuickAction({
  emoji,
  label,
  sub,
  bg,
  onPress,
}: {
  emoji: string;
  label: string;
  sub: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.quickAction, { backgroundColor: bg }]}
    >
      <Text style={styles.qaEmoji}>{emoji}</Text>
      <Text style={styles.qaLabel}>{label}</Text>
      <Text style={styles.qaSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { name, glowScore, streakDays } = useProfileStore();
  const { scans } = useScanStore();
  const { currentCycleDay, currentPhase } = useCycleStore();

  const displayName = name || 'Beautiful';
  const tip = TIPS[new Date().getDay() % TIPS.length];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{displayName} ✨</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakChip}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{streakDays} days</Text>
            </View>
            <Avatar name={displayName} size={42} />
          </View>
        </View>

        {/* Glow Score Hero */}
        <GradientCard style={styles.glowCard}>
          <View style={styles.glowRow}>
            <View style={styles.glowInfo}>
              <Label color="rgba(255,255,255,0.65)">Your Glow Score</Label>
              <Text style={styles.glowScore}>{glowScore}</Text>
              <Text style={styles.glowSub}>Looking radiant 💜</Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{scans.length}</Text>
                  <Text style={styles.statKey}>Scans</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{currentCycleDay ?? '—'}</Text>
                  <Text style={styles.statKey}>Cycle day</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statVal}>SPF</Text>
                  <Text style={styles.statKey}>Next tip</Text>
                </View>
              </View>
            </View>

            <View style={styles.ringBox}>
              <GradientRing
                progress={glowScore / 100}
                size={110}
                strokeWidth={10}
                gradientStart="#FFFFFF"
                gradientEnd="rgba(255,255,255,0.35)"
                trackColor="rgba(255,255,255,0.15)"
              />
              <View style={styles.ringCenter}>
                <Text style={styles.ringNum}>{glowScore}</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        {/* Cycle alert */}
        {currentCycleDay && (
          <Card variant="tint" style={styles.cycleAlert}>
            <View style={styles.cycleRow}>
              <Text style={styles.cycleEmoji}>🌙</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cycleTitle}>
                  Cycle day {currentCycleDay} · {currentPhase}
                </Text>
                <Text style={styles.cycleSub}>
                  {currentPhase === 'luteal'
                    ? 'Breakout risk is elevated. Keep your routine consistent.'
                    : 'Skin is in a stable phase. Great time to try new products.'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Quick actions */}
        <Label style={styles.sectionLabel}>Quick actions</Label>
        <View style={styles.quickGrid}>
          <QuickAction
            emoji="🔬"
            label="Scan skin"
            sub="AI analysis"
            bg={colors.purMid}
            onPress={() => router.push('/scan/mannequin')}
          />
          <QuickAction
            emoji="📊"
            label="My scans"
            sub={`${scans.length} saved`}
            bg={colors.bg3}
            onPress={() => router.push('/features/dashboard')}
          />
          <QuickAction
            emoji="💬"
            label="AI Chat"
            sub="Ask anything"
            bg={colors.pinkMid}
            onPress={() => router.push('/features/chat')}
          />
          <QuickAction
            emoji="🧴"
            label="Routine"
            sub="Check conflicts"
            bg={colors.bg2}
            onPress={() => router.push('/features/routine')}
          />
        </View>

        {/* Recent scans */}
        {scans.length > 0 && (
          <>
            <Label style={styles.sectionLabel}>Recent scans</Label>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scansScroll}
            >
              {scans.slice(0, 5).map(scan => (
                <TouchableOpacity
                  key={scan.scan_id}
                  style={styles.scanCard}
                  onPress={() => router.push('/features/dashboard')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[...GRADIENT]}
                    style={styles.scanIcon}
                  >
                    <Text style={{ fontSize: 18 }}>🔬</Text>
                  </LinearGradient>
                  <Text style={styles.scanArea}>{scan.body_area}</Text>
                  <Text style={styles.scanDate}>
                    {new Date(scan.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                  </Text>
                  <View style={styles.scanStatus}>
                    <View style={[styles.dot, { backgroundColor: colors.grn }]} />
                    <Text style={styles.scanStatusText}>Improving</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.scanCard, styles.newScanCard]}
                onPress={() => router.push('/scan/mannequin')}
                activeOpacity={0.85}
              >
                <Text style={styles.newScanPlus}>＋</Text>
                <Text style={styles.newScanText}>New scan</Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}

        {/* Daily tip */}
        <Card variant="tint" style={styles.tipCard}>
          <Label color={colors.pur}>Daily tip</Label>
          <Text style={styles.tipText}>{tip}</Text>
        </Card>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { gap: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greeting: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },
  name: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.t1 },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.amberLt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  streakEmoji: { fontSize: 12 },
  streakText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.amber },

  glowCard: { gap: spacing.md },
  glowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  glowInfo: { flex: 1, gap: spacing.xs },
  glowScore: { fontSize: fontSize.xl6, fontWeight: fontWeight.extrabold, color: colors.white, lineHeight: 52 },
  glowSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: fontWeight.medium },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.md },
  stat: { alignItems: 'center' },
  statVal: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.white },
  statKey: { fontSize: fontSize.xs2, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  ringBox: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringNum: { fontSize: fontSize.xl4, fontWeight: fontWeight.extrabold, color: colors.white },

  cycleAlert: { gap: spacing.xs },
  cycleRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  cycleEmoji: { fontSize: 20, marginTop: 2 },
  cycleTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1, textTransform: 'capitalize' },
  cycleSub: { fontSize: fontSize.sm, color: colors.t3, marginTop: 2 },

  sectionLabel: { marginTop: spacing.sm, marginBottom: -spacing.sm },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickAction: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  qaEmoji: { fontSize: 24 },
  qaLabel: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  qaSub: { fontSize: fontSize.xs, color: colors.t3 },

  scansScroll: { gap: spacing.sm, paddingBottom: spacing.xs },
  scanCard: {
    width: 110,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  scanIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.t1, textTransform: 'capitalize' },
  scanDate: { fontSize: fontSize.xs2, color: colors.t4 },
  scanStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  scanStatusText: { fontSize: fontSize.xs2, color: colors.t3 },
  newScanCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purLt,
    borderColor: colors.purMid,
    borderStyle: 'dashed',
  },
  newScanPlus: { fontSize: 28, color: colors.pur, fontWeight: fontWeight.bold },
  newScanText: { fontSize: fontSize.xs, color: colors.pur, fontWeight: fontWeight.medium },

  tipCard: { gap: spacing.sm },
  tipText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
});
