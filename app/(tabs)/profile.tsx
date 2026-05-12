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
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { Avatar } from '../../src/components/ui/Avatar';
import { Divider } from '../../src/components/ui/Divider';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useProfileStore } from '../../src/store/profileStore';
import { useAuthStore } from '../../src/store/authStore';
import { useScanStore } from '../../src/store/scanStore';

const SETTINGS_ROWS = [
  { label: 'Notification preferences', emoji: '🔔' },
  { label: 'Privacy & data',           emoji: '🔒' },
  { label: 'Consent settings',         emoji: '✅' },
  { label: 'Language',                 emoji: '🌍' },
  { label: 'Connect a doctor',         emoji: '👨‍⚕️' },
  { label: 'Export all my data',       emoji: '📥' },
  { label: 'Help & support',           emoji: '💬' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { name, glowScore, fitzpatrick } = useProfileStore();
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
        {/* Profile hero */}
        <GradientCard style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Avatar name={displayName} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{displayName}</Text>
              <Text style={styles.heroSub}>Fitzpatrick Type {fitzpatrick ?? '—'}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
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
              <Text style={styles.heroStatVal}>{glowScore}</Text>
              <Text style={styles.heroStatKey}>Glow score</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>—</Text>
              <Text style={styles.heroStatKey}>Blood group</Text>
            </View>
          </View>
        </GradientCard>

        {/* Subscription */}
        <Card variant="tint" style={styles.subCard}>
          <View style={styles.subRow}>
            <View>
              <Label color={colors.pur}>Current plan</Label>
              <Text style={styles.subPlan}>Free</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85}>
              <LinearGradient colors={[...GRADIENT]} style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>Upgrade to Glow ✦</Text>
              </LinearGradient>
            </TouchableOpacity>
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

        {/* Settings */}
        <Label color={colors.t3}>Settings</Label>
        <Card variant="white" noPadding>
          {SETTINGS_ROWS.map((row, i) => (
            <React.Fragment key={row.label}>
              <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
                <Text style={styles.settingsEmoji}>{row.emoji}</Text>
                <Text style={styles.settingsLabel}>{row.label}</Text>
                <Text style={styles.settingsArrow}>›</Text>
              </TouchableOpacity>
              {i < SETTINGS_ROWS.length - 1 && <Divider vertical={0} />}
            </React.Fragment>
          ))}
        </Card>

        {/* Research opt-in */}
        <Card variant="tint" style={styles.researchCard}>
          <Text style={styles.researchTitle}>🔬 Support African skin research</Text>
          <Text style={styles.researchText}>
            Your anonymised scan data helps train better AI for dark skin tones.
            No PII ever leaves your device.
          </Text>
          <View style={styles.researchToggle}>
            <Text style={styles.researchToggleLabel}>Opt in to research</Text>
            <View style={styles.toggleOn}>
              <Text style={styles.toggleOnText}>ON</Text>
            </View>
          </View>
        </Card>

        {/* Log out */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>SANO v1.0.0 · Built in Ghana 🇬🇭</Text>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  heroCard: { gap: spacing.lg },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroName: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  heroSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)' },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  editBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  heroStatKey: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)' },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  subCard: { gap: spacing.md },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subPlan: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.t1 },
  upgradeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  upgradeBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.sm },
  subFeatures: { gap: spacing.xs },
  subFeature: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  subFeatureCheck: { color: colors.pur, fontWeight: fontWeight.bold },
  subFeatureText: { fontSize: fontSize.sm, color: colors.t2 },

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingsEmoji: { fontSize: 18 },
  settingsLabel: { flex: 1, fontSize: fontSize.md, color: colors.t1, fontWeight: fontWeight.medium },
  settingsArrow: { fontSize: 20, color: colors.t4 },

  researchCard: { gap: spacing.sm },
  researchTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  researchText: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },
  researchToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  researchToggleLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t2 },
  toggleOn: {
    backgroundColor: colors.pur,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  toggleOnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  logoutBtn: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.redLt,
    backgroundColor: colors.redLt,
  },
  logoutText: { color: colors.red, fontWeight: fontWeight.bold, fontSize: fontSize.md },

  version: { textAlign: 'center', fontSize: fontSize.xs, color: colors.t4 },
});
