import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { Avatar } from '../../src/components/ui/Avatar';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius, shadows } from '../../src/theme';
import { useProfileStore } from '../../src/store/profileStore';
import { useAuthStore } from '../../src/store/authStore';
import { useScanStore } from '../../src/store/scanStore';

const SETTINGS_ROWS = [
  { label: 'Notification preferences', emoji: '🔔', tint: '#FFF7ED' },
  { label: 'Privacy & data',           emoji: '🔒', tint: '#F0FDF4' },
  { label: 'Consent settings',         emoji: '✅', tint: '#F0FDF4' },
  { label: 'Language',                 emoji: '🌍', tint: '#EFF6FF' },
  { label: 'Connect a doctor',         emoji: '👨‍⚕️', tint: '#FDF4FF' },
  { label: 'Export all my data',       emoji: '📥', tint: colors.purLt },
  { label: 'Help & support',           emoji: '💬', tint: colors.bg3 },
];

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={colors.t4} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { name, glowScore, fitzpatrick, subscription } = useProfileStore();
  const { signOut: logout } = useAuthStore();
  const { scans } = useScanStore();

  const displayName = name || 'SANO User';

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero card ── */}
        <Animated.View entering={FadeInDown.delay(60).springify().damping(20)}>
          <GradientCard style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Avatar name={displayName} size={60} />
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{displayName}</Text>
                <View style={styles.fitzRow}>
                  <View style={styles.fitzBadge}>
                    <Text style={styles.fitzText}>Fitzpatrick {fitzpatrick ?? '—'}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{scans.length}</Text>
                <Text style={styles.heroStatKey}>Scans</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{glowScore ?? '—'}</Text>
                <Text style={styles.heroStatKey}>Glow score</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>Free</Text>
                <Text style={styles.heroStatKey}>Plan</Text>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {/* ── Subscription upgrade ── */}
        <Animated.View entering={FadeInDown.delay(120).springify().damping(20)}>
          <Card variant="tint" style={styles.subCard}>
            <View style={styles.subRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Label color={colors.pur}>Current plan</Label>
                <Text style={styles.subPlan}>{subscription === 'free' ? 'Free' : subscription === 'plus' ? 'SANO Plus' : 'SANO Premium'}</Text>
                <Text style={styles.subHint}>{subscription === 'free' ? '3 scans/month · Basic analysis' : 'Unlimited scans · Full analysis'}</Text>
              </View>
              {subscription === 'free' && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/features/subscription' as any)}
                >
                  <LinearGradient colors={[...GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeBtn}>
                    <Text style={styles.upgradeBtnText}>Upgrade ✦</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.subFeatures}>
              {['Unlimited scans', 'Foundation matcher', 'Cycle predictor', 'PDF reports'].map(f => (
                <View key={f} style={styles.subFeature}>
                  <Text style={styles.subFeatureCheck}>✓</Text>
                  <Text style={styles.subFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* ── Settings ── */}
        <Animated.View entering={FadeInDown.delay(180).springify().damping(20)}>
          <Label color={colors.t3} style={styles.sectionLabel}>Settings</Label>
          <Card variant="white" noPadding elevated>
            {SETTINGS_ROWS.map((row, i) => (
              <React.Fragment key={row.label}>
                <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
                  <View style={[styles.settingsEmojiWrap, { backgroundColor: row.tint }]}>
                    <Text style={styles.settingsEmoji}>{row.emoji}</Text>
                  </View>
                  <Text style={styles.settingsLabel}>{row.label}</Text>
                  <ChevronRight />
                </TouchableOpacity>
                {i < SETTINGS_ROWS.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </Card>
        </Animated.View>

        {/* ── Research opt-in ── */}
        <Animated.View entering={FadeInDown.delay(240).springify().damping(20)}>
          <Card variant="tint" style={styles.researchCard}>
            <View style={styles.researchHeader}>
              <Text style={styles.researchIcon}>🔬</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.researchTitle}>Support African skin research</Text>
                <Text style={styles.researchText}>
                  Your anonymised scan data helps train better AI for dark skin tones. No PII leaves your device.
                </Text>
              </View>
            </View>
            <View style={styles.researchToggle}>
              <Text style={styles.researchToggleLabel}>Opt in to research</Text>
              <View style={styles.toggleOn}>
                <Text style={styles.toggleOnText}>ON</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* ── Log out ── */}
        <Animated.View entering={FadeInDown.delay(300).springify().damping(20)}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.version}>SANO v1.0.0 · Built in Ghana 🇬🇭</Text>

        {/* Tab bar padding */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  sectionLabel: { marginBottom: -spacing.sm },

  // Hero
  heroCard: { gap: spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroName: {
    fontSize: fontSize.xl2,
    fontFamily: 'Inter_800ExtraBold',
    color: colors.white,
    marginBottom: 4,
  },
  fitzRow: { flexDirection: 'row' },
  fitzBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fitzText: { fontSize: fontSize.xs2, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter_500Medium' },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  editBtnText: { color: colors.white, fontSize: fontSize.sm, fontFamily: 'Inter_600SemiBold' },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  heroStat: { alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  heroStatKey: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.60)', fontFamily: 'Inter_400Regular' },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'stretch', marginVertical: 4 },

  // Subscription card
  subCard: { gap: spacing.md },
  subRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  subPlan: { fontSize: fontSize.xl, fontFamily: 'Inter_700Bold', color: colors.t1 },
  subHint: { fontSize: fontSize.xs, color: colors.t3 },
  upgradeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  upgradeBtnText: { color: colors.white, fontFamily: 'Inter_700Bold', fontSize: fontSize.sm },
  subFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  subFeature: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subFeatureCheck: { color: colors.pur, fontFamily: 'Inter_700Bold', fontSize: fontSize.xs },
  subFeatureText: { fontSize: fontSize.xs, color: colors.t3 },

  // Settings
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingsEmojiWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsEmoji: { fontSize: 17 },
  settingsLabel: { flex: 1, fontSize: fontSize.md, color: colors.t1, fontFamily: 'Inter_500Medium' },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.bdr, marginLeft: 68 },

  // Research
  researchCard: { gap: spacing.sm },
  researchHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  researchIcon: { fontSize: 22, marginTop: 2 },
  researchTitle: { fontSize: fontSize.md, fontFamily: 'Inter_700Bold', color: colors.t1, marginBottom: 4 },
  researchText: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },
  researchToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.bdr,
  },
  researchToggleLabel: { fontSize: fontSize.md, fontFamily: 'Inter_600SemiBold', color: colors.t2 },
  toggleOn: {
    backgroundColor: colors.pur,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  toggleOnText: { color: colors.white, fontSize: fontSize.xs, fontFamily: 'Inter_700Bold' },

  // Logout
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.red}30`,
    backgroundColor: colors.redLt,
  },
  logoutText: { color: colors.red, fontFamily: 'Inter_700Bold', fontSize: fontSize.md },

  version: { textAlign: 'center', fontSize: fontSize.xs, color: colors.t4 },
});
