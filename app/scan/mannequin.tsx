import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BodyMannequin, BODY_ZONES } from '../../src/components/ui/BodyMannequin';
import type { BodyZone } from '../../src/components/ui/BodyMannequin';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useScanStore } from '../../src/store/scanStore';
import { useProfileStore } from '../../src/store/profileStore';

const FREE_MONTHLY_SCAN_LIMIT = 3;

export default function MannequinScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<BodyZone | null>(null);
  const { setSelectedBodyArea, scans } = useScanStore();
  const { subscription } = useProfileStore();

  const scansThisMonth = scans.filter(s => {
    const ts = (s as any).createdAt?.toDate?.() ?? new Date((s as any).createdAt ?? 0);
    const now = new Date();
    return ts.getFullYear() === now.getFullYear() && ts.getMonth() === now.getMonth();
  }).length;

  const handleScan = () => {
    if (!selected) return;

    if (subscription === 'free' && scansThisMonth >= FREE_MONTHLY_SCAN_LIMIT) {
      Alert.alert(
        'Monthly limit reached',
        `Free plan includes ${FREE_MONTHLY_SCAN_LIMIT} scans per month. Upgrade to SANO Plus for unlimited scans.`,
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/features/subscription' as any) },
        ]
      );
      return;
    }

    setSelectedBodyArea(selected);
    router.push({ pathname: '/scan/camera', params: { area: selected } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Body Scan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.instruction}>Tap the area you want to scan</Text>

        <BodyMannequin selected={selected} onSelect={setSelected} />

        {selected && (
          <Card variant="tint" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                style={styles.infoIcon}
              >
                <Text style={{ fontSize: 18 }}>🔬</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoArea}>{BODY_ZONES[selected].label}</Text>
                <Text style={styles.infoDesc}>{BODY_ZONES[selected].description}</Text>
              </View>
            </View>
            <Text style={styles.infoHint}>
              Make sure the area is well-lit and free of makeup for best results.
            </Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={selected ? `Scan ${BODY_ZONES[selected]?.label} →` : 'Select an area to continue'}
          onPress={handleScan}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bdr,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.semibold },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  instruction: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.t2,
    textAlign: 'center',
  },
  infoCard: { width: '100%', gap: spacing.md },
  infoRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoArea: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  infoDesc: { fontSize: fontSize.sm, color: colors.t3 },
  infoHint: {
    fontSize: fontSize.sm,
    color: colors.t3,
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: colors.bdr,
    paddingTop: spacing.sm,
  },
  footer: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.bdr,
    backgroundColor: colors.white,
  },
});
