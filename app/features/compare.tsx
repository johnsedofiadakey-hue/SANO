import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { SeverityBar } from '../../src/components/ui/SeverityBar';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useScanStore } from '../../src/store/scanStore';
import { useProfileStore } from '../../src/store/profileStore';

export default function CompareScreen() {
  const router = useRouter();
  const { scans } = useScanStore();
  const { glowScore, skinConcerns, fitzpatrick } = useProfileStore();
  const [trendInsight, setTrendInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (scans.length < 2 || fetched.current) return;
    fetched.current = true;
    const oldest = scans[scans.length - 1] as any;
    const newest = scans[0] as any;
    const oldCondition = oldest?.conditions?.[0];
    const newCondition = newest?.conditions?.[0];
    setInsightLoading(true);
    import('../../src/services/aiChat').then(({ sendChatMessage }) =>
      sendChatMessage(
        `I have ${scans.length} skin scans. My oldest scan showed ${oldCondition?.name ?? 'unknown'} at ${Math.round((oldCondition?.severity ?? 0) * 100)}% severity. My most recent scan shows ${newCondition?.name ?? 'unknown'} at ${Math.round((newCondition?.severity ?? 0) * 100)}% severity. My current Glow Score is ${glowScore ?? 'unknown'}/100. Fitzpatrick: ${fitzpatrick ?? 'unknown'}. Give me a warm 2-3 sentence analysis of my skin progress trend and what's driving the change.`,
        [],
        { glowScore, skinConcerns, fitzpatrick, scanCount: scans.length }
      )
    ).then(setTrendInsight).catch(() => {}).finally(() => setInsightLoading(false));
  }, [scans.length]);

  if (scans.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Before / After</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.body}>
          <LinearGradient colors={[...GRADIENT]} style={styles.iconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.icon}>📸</Text>
          </LinearGradient>
          <Text style={styles.headline}>Progress tracking{'\n'}starts here</Text>
          <Text style={styles.sub}>Complete at least 2 skin scans to see your before/after comparison and AI trend analysis.</Text>
          <GradientButton label="Start a skin scan →" onPress={() => router.push('/scan/mannequin')} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

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

        {/* AI Trend Analysis */}
        <Card variant="tint" style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <LinearGradient colors={[...GRADIENT]} style={styles.aiIcon}>
              <Text style={{ fontSize: 16 }}>🤖</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiLabel}>SANO AI</Text>
              <Text style={styles.aiTitle}>Trend Analysis</Text>
            </View>
            {insightLoading && <ActivityIndicator color={colors.pur} size="small" />}
          </View>
          <Text style={styles.aiText}>
            {insightLoading
              ? 'Analysing your skin progress…'
              : trendInsight ?? `You have ${scans.length} scans recorded. Keep scanning regularly to build a richer trend picture.`}
          </Text>
        </Card>

        {/* Glow Score trend */}
        {glowScore !== null && glowScore !== undefined && (
          <Card variant="white" style={styles.glowCard}>
            <Text style={styles.sectionLabel}>Current Glow Score</Text>
            <View style={styles.glowRow}>
              <Text style={styles.glowScore}>{glowScore}</Text>
              <Text style={styles.glowUnit}>/100</Text>
            </View>
            <View style={styles.glowBar}>
              <View style={[styles.glowFill, { width: `${glowScore}%` }]} />
            </View>
          </Card>
        )}

        {/* Scan timeline */}
        <Text style={styles.sectionLabel}>Scan timeline ({scans.length} scans)</Text>
        {scans.slice(0, 10).map((scan: any, i: number) => {
          const cond = scan?.conditions?.[0];
          const date = new Date(scan?.created_at ?? scan?.createdAt ?? Date.now());
          return (
            <Card key={scan.id ?? i} variant="white" style={styles.scanCard}>
              <View style={styles.scanRow}>
                <View style={styles.scanMeta}>
                  <Text style={styles.scanIndex}>#{scans.length - i}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scanCondition}>{cond?.name ?? 'Scan result'}</Text>
                    <Text style={styles.scanDate}>{date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  </View>
                  <Text style={styles.scanArea}>{scan.body_area ?? 'face'}</Text>
                </View>
              </View>
              {cond && <SeverityBar label="Severity" value={cond.severity} />}
            </Card>
          );
        })}

        <GradientButton label="+ New scan" onPress={() => router.push('/scan/mannequin')} variant="primary" />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.bdr,
  },
  back: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.semibold },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, gap: spacing.xl },
  iconWrap: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48 },
  headline: { fontSize: 26, fontWeight: fontWeight.extrabold, color: colors.t1, textAlign: 'center', lineHeight: 34, letterSpacing: -0.5 },
  sub: { fontSize: fontSize.md, color: colors.t3, textAlign: 'center', lineHeight: 22, maxWidth: 320 },
  scroll: { padding: spacing.lg, gap: spacing.md },
  aiCard: { gap: spacing.md },
  aiHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  aiIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  aiLabel: { fontSize: fontSize.xs, color: colors.pur, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  aiText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  glowCard: { gap: spacing.sm },
  glowRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  glowScore: { fontSize: 48, fontWeight: fontWeight.extrabold, color: colors.pur },
  glowUnit: { fontSize: fontSize.lg, color: colors.t3, fontWeight: fontWeight.medium },
  glowBar: { height: 8, backgroundColor: colors.bg2, borderRadius: radius.full, overflow: 'hidden' },
  glowFill: { height: '100%', backgroundColor: colors.pur, borderRadius: radius.full },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.t3, textTransform: 'uppercase', letterSpacing: 0.5 },
  scanCard: { gap: spacing.sm },
  scanRow: { gap: spacing.xs },
  scanMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scanIndex: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.t4, width: 24 },
  scanCondition: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1, textTransform: 'capitalize' },
  scanDate: { fontSize: fontSize.xs, color: colors.t3 },
  scanArea: { fontSize: fontSize.xs, color: colors.t4, textTransform: 'capitalize' },
});
