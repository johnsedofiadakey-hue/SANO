import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { GradientRing } from '../../src/components/ui/GradientRing';
import { Avatar } from '../../src/components/ui/Avatar';
import { Label } from '../../src/components/ui/Label';
import { colors, GRADIENT, GRADIENT_SOFT, spacing, fontSize, fontWeight, radius, shadows } from '../../src/theme';
import { useProfileStore } from '../../src/store/profileStore';
import { useScanStore } from '../../src/store/scanStore';
import { useCycleStore } from '../../src/store/cycleStore';

const { width } = Dimensions.get('window');

const TIPS = [
  { text: 'Drink 8 glasses of water daily — hydration shows on your face within 48 hours.', icon: '💧' },
  { text: 'Apply SPF 30+ every morning, even on cloudy days. UV rays penetrate clouds.', icon: '☀️' },
  { text: 'Change your pillowcase every 3 days to reduce acne-causing bacteria.', icon: '🛌' },
  { text: 'Never pop a pimple — it causes hyperpigmentation, especially on dark skin.', icon: '🚫' },
];

function PressableCard({
  onPress, children, style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 14, stiffness: 350 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 280 }); }}
      activeOpacity={1}
    >
      <Animated.View style={[animStyle, style]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

function QuickAction({
  emoji, label, sub, gradient, onPress, delay,
}: {
  emoji: string; label: string; sub: string;
  gradient: readonly [string, string];
  onPress: () => void; delay: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)} style={styles.qaWrap}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 12, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 280 }); }}
        activeOpacity={1}
      >
        <Animated.View style={[styles.quickAction, animStyle]}>
          <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.qaIcon}>
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </LinearGradient>
          <Text style={styles.qaLabel}>{label}</Text>
          <Text style={styles.qaSub}>{sub}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const PHASE_CONFIG: Record<string, { emoji: string; bg: string; text: string; border: string }> = {
  follicular: { emoji: '🌱', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  ovulation:  { emoji: '🌸', bg: '#FEF0F7', text: '#831843', border: '#F9A8D4' },
  luteal:     { emoji: '🌙', bg: '#F5F3FF', text: '#4C1D95', border: '#DDD6FE' },
  period:     { emoji: '💜', bg: '#FFF1F2', text: '#9F1239', border: '#FCA5A5' },
};

export default function HomeScreen() {
  const router = useRouter();
  const { name, glowScore, streakDays } = useProfileStore();
  const { scans } = useScanStore();
  const { currentCycleDay, currentPhase } = useCycleStore();

  const displayName = name?.split(' ')[0] || 'there';
  const displayGlowScore = glowScore > 0 ? glowScore : '—';
  const tip = TIPS[new Date().getDay() % TIPS.length];
  const phase = PHASE_CONFIG[currentPhase ?? 'follicular'] ?? PHASE_CONFIG.follicular;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(0).springify().damping(20)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <View style={styles.headerRight}>
            {streakDays > 0 && (
              <View style={styles.streakChip}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{streakDays}d</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
              <Avatar name={displayName} size={44} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Glow Score Hero ── */}
        <Animated.View entering={FadeInDown.delay(60).springify().damping(20)}>
          <GradientCard style={styles.glowCard}>
            <View style={styles.glowRow}>
              <View style={styles.glowInfo}>
                <Text style={styles.glowLabel}>GLOW SCORE</Text>
                <Text style={styles.glowScore}>{displayGlowScore}</Text>
                <Text style={styles.glowSub}>{glowScore > 0 ? 'Looking radiant ✦' : 'Complete a scan to start'}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statVal}>{scans.length}</Text>
                    <Text style={styles.statKey}>Scans</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statVal}>{currentCycleDay ?? '—'}</Text>
                    <Text style={styles.statKey}>Cycle</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statVal}>{streakDays}</Text>
                    <Text style={styles.statKey}>Streak</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ringBox}>
                <GradientRing
                  progress={glowScore > 0 ? glowScore / 100 : 0}
                  size={108}
                  strokeWidth={9}
                  gradientStart="rgba(255,255,255,0.95)"
                  gradientEnd="rgba(255,255,255,0.35)"
                  trackColor="rgba(255,255,255,0.15)"
                />
                <View style={styles.ringCenter}>
                  <Text style={styles.ringNum}>{displayGlowScore}</Text>
                  <Text style={styles.ringLabel}>/ 100</Text>
                </View>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {/* ── Cycle insight ── */}
        {currentCycleDay && (
          <Animated.View entering={FadeInDown.delay(120).springify().damping(20)}>
            <TouchableOpacity
              onPress={() => router.push('/features/cycle')}
              activeOpacity={0.85}
            >
              <View style={[styles.cycleCard, { backgroundColor: phase.bg, borderColor: phase.border }]}>
                <Text style={styles.cycleEmoji}>{phase.emoji}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.cycleTitle, { color: phase.text }]}>
                    Day {currentCycleDay} · {(currentPhase ?? 'follicular').charAt(0).toUpperCase() + (currentPhase ?? 'follicular').slice(1)} phase
                  </Text>
                  <Text style={[styles.cycleSub, { color: phase.text, opacity: 0.75 }]}>
                    {currentPhase === 'luteal'
                      ? 'Breakout risk elevated — keep routine consistent.'
                      : currentPhase === 'period'
                      ? 'Focus on hydration and gentle products this week.'
                      : 'Skin barrier is at its best — great time for actives.'}
                  </Text>
                </View>
                <Text style={[styles.cycleChevron, { color: phase.text }]}>›</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Quick actions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.quickGrid}>
          <QuickAction
            emoji="🔬" label="Scan skin" sub="AI analysis"
            gradient={['#6D28D9', '#8B5CF6']}
            onPress={() => router.push('/scan/mannequin')} delay={100}
          />
          <QuickAction
            emoji="📊" label="My scans" sub={`${scans.length} saved`}
            gradient={['#0EA5E9', '#38BDF8']}
            onPress={() => router.push('/features/dashboard')} delay={140}
          />
          <QuickAction
            emoji="💬" label="AI Chat" sub="Ask anything"
            gradient={['#E8398A', '#F472B6']}
            onPress={() => router.push('/features/chat')} delay={180}
          />
          <QuickAction
            emoji="🧴" label="Routine" sub="Check conflicts"
            gradient={['#059669', '#34D399']}
            onPress={() => router.push('/features/routine')} delay={220}
          />
        </View>

        {/* ── Recent scans ── */}
        {scans.length > 0 && (
          <Animated.View entering={FadeInDown.delay(260).springify().damping(20)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent scans</Text>
              <TouchableOpacity onPress={() => router.push('/features/dashboard')} activeOpacity={0.7}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scansScroll}
            >
              {scans.slice(0, 5).map((scan, i) => (
                <PressableCard
                  key={scan.scan_id}
                  onPress={() => router.push('/features/dashboard')}
                  style={styles.scanCard}
                >
                  <LinearGradient colors={[...GRADIENT]} style={styles.scanIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={{ fontSize: 16 }}>🔬</Text>
                  </LinearGradient>
                  <Text style={styles.scanArea} numberOfLines={1}>{scan.body_area}</Text>
                  <Text style={styles.scanDate}>
                    {new Date(scan.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                  </Text>
                  <View style={styles.scanStatusRow}>
                    <View style={[styles.dot, { backgroundColor: colors.grn }]} />
                    <Text style={styles.scanStatusText}>Improving</Text>
                  </View>
                </PressableCard>
              ))}
              <PressableCard
                onPress={() => router.push('/scan/mannequin')}
                style={[styles.scanCard, styles.newScanCard]}
              >
                <Text style={styles.newScanPlus}>＋</Text>
                <Text style={styles.newScanText}>New{'\n'}scan</Text>
              </PressableCard>
            </ScrollView>
          </Animated.View>
        )}

        {/* ── Daily tip ── */}
        <Animated.View entering={FadeInDown.delay(300).springify().damping(20)}>
          <LinearGradient colors={[...GRADIENT_SOFT]} style={styles.tipCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipLabel}>DAILY TIP</Text>
            </View>
            <Text style={styles.tipText}>{tip.text}</Text>
          </LinearGradient>
        </Animated.View>

        {/* ── Health features banner ── */}
        <Animated.View entering={FadeInDown.delay(340).springify().damping(20)}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/health')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0D0520', '#2E1065']}
              style={styles.healthBanner}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={styles.healthBannerOrb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.healthBannerLabel}>HEALTH CENTER</Text>
                <Text style={styles.healthBannerTitle}>Check your vitals →</Text>
                <Text style={styles.healthBannerSub}>Heart rate, hydration, and more</Text>
              </View>
              <Text style={{ fontSize: 32 }}>💓</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const QA_SIZE = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  headerLeft: { gap: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium, letterSpacing: 0.1 },
  name: { fontSize: fontSize.xl3, fontWeight: fontWeight.extrabold, color: colors.t1, letterSpacing: -0.5 },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFFBEB', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  streakEmoji: { fontSize: 12 },
  streakText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.amber },

  // Glow card
  glowCard: { marginTop: 4 },
  glowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  glowInfo: { flex: 1, gap: 4 },
  glowLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5,
  },
  glowScore: {
    fontSize: fontSize.xl6, fontWeight: fontWeight.extrabold,
    color: colors.white, lineHeight: 52, letterSpacing: -2,
  },
  glowSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', fontWeight: fontWeight.medium },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 16 },
  stat: { alignItems: 'center', gap: 2 },
  statVal: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.white },
  statKey: { fontSize: fontSize.xs2, color: 'rgba(255,255,255,0.55)', fontWeight: fontWeight.medium, letterSpacing: 0.3 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.18)' },
  ringBox: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringNum: { fontSize: fontSize.xl3, fontWeight: fontWeight.extrabold, color: colors.white, lineHeight: 28 },
  ringLabel: { fontSize: fontSize.xs2, color: 'rgba(255,255,255,0.5)', fontWeight: fontWeight.medium },

  // Cycle
  cycleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: radius.xl, borderWidth: 1.5, padding: 14,
  },
  cycleEmoji: { fontSize: 22 },
  cycleTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  cycleSub: { fontSize: fontSize.xs, lineHeight: 16 },
  cycleChevron: { fontSize: 22, fontWeight: fontWeight.bold, opacity: 0.6 },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1, letterSpacing: -0.2 },
  seeAll: { fontSize: fontSize.sm, color: colors.pur, fontWeight: fontWeight.semibold },

  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  qaWrap: { width: QA_SIZE },
  quickAction: {
    width: '100%', borderRadius: radius.xl,
    padding: 18, gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.bdr,
    ...shadows.sm,
  },
  qaIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  qaLabel: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  qaSub: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium },

  // Scans
  scansScroll: { gap: 10, paddingBottom: 4 },
  scanCard: {
    width: 108, backgroundColor: colors.white,
    borderRadius: radius.xl, padding: 14, gap: 6,
    borderWidth: 1, borderColor: colors.bdr,
    ...shadows.xs,
  },
  scanIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  scanArea: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.t1, textTransform: 'capitalize' },
  scanDate: { fontSize: fontSize.xs2, color: colors.t4 },
  scanStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  scanStatusText: { fontSize: fontSize.xs2, color: colors.t3, fontWeight: fontWeight.medium },
  newScanCard: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.purLt, borderColor: colors.purMid, borderStyle: 'dashed',
  },
  newScanPlus: { fontSize: 26, color: colors.pur, fontWeight: fontWeight.bold },
  newScanText: { fontSize: fontSize.xs, color: colors.pur, fontWeight: fontWeight.semibold, textAlign: 'center' },

  // Tip
  tipCard: {
    borderRadius: radius.xl, padding: 18, gap: 10,
    borderWidth: 1, borderColor: colors.bdrHi,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipIcon: { fontSize: 18 },
  tipLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.pur, letterSpacing: 1.2,
  },
  tipText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 23, fontWeight: fontWeight.medium },

  // Health banner
  healthBanner: {
    borderRadius: radius.xl, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    overflow: 'hidden', position: 'relative',
  },
  healthBannerOrb: {
    position: 'absolute', width: 160, height: 160,
    borderRadius: 80, backgroundColor: 'rgba(124,58,237,0.2)',
    top: -40, right: -20,
  },
  healthBannerLabel: {
    fontSize: fontSize.xs2, fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.45)', letterSpacing: 1.4, marginBottom: 2,
  },
  healthBannerTitle: {
    fontSize: fontSize.xl, fontWeight: fontWeight.extrabold,
    color: colors.white, letterSpacing: -0.3,
  },
  healthBannerSub: {
    fontSize: fontSize.sm, color: 'rgba(255,255,255,0.55)',
    fontWeight: fontWeight.medium, marginTop: 2,
  },
});
