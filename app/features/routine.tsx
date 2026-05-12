import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { Label } from '../../src/components/ui/Label';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import { analyzeRoutine } from '../../src/services/routineAnalyzer';
import { MOCK_ROUTINE as MOCK_ROUTINE_DATA } from '../../src/data/mockData';
import { useProfileStore } from '../../src/store/profileStore';

interface Product {
  id: string;
  name: string;
  brand: string;
  step: number;
  emoji: string;
  conflict?: string;
}

const MOCK_ROUTINE: Product[] = [
  { id: '1', name: 'Vitamin C Serum',   brand: 'The Ordinary',   step: 1, emoji: '🍊' },
  { id: '2', name: 'Niacinamide 10%',   brand: 'The Ordinary',   step: 2, emoji: '💧', conflict: 'Do not mix with Vitamin C — reduces efficacy' },
  { id: '3', name: 'AHA 30% + BHA 2%', brand: 'The Ordinary',   step: 3, emoji: '⚗️', conflict: 'Never use same time as Vitamin C or Retinol' },
  { id: '4', name: 'Moisturiser SPF30', brand: 'Neutrogena',     step: 4, emoji: '☀️' },
];

const CORRECTED_ORDER: Product[] = [
  { id: '1', name: 'Vitamin C Serum',   brand: 'The Ordinary', step: 1, emoji: '🍊' },
  { id: '4', name: 'Moisturiser SPF30', brand: 'Neutrogena',   step: 2, emoji: '☀️' },
  { id: '3', name: 'AHA/BHA (PM only)', brand: 'The Ordinary', step: 3, emoji: '⚗️' },
  { id: '2', name: 'Niacinamide 10%',   brand: 'The Ordinary', step: 4, emoji: '💧' },
];

export default function RoutineScreen() {
  const router = useRouter();
  const { logEvent } = useDataCollection();
  const { fitzpatrick } = useProfileStore();

  React.useEffect(() => {
    logEvent('routine_checked');
  }, [logEvent]);

  const analysis = useMemo(() =>
    analyzeRoutine(
      MOCK_ROUTINE.map(p => ({ name: p.name })),
      { skinType: 'combination', fitzpatrick: fitzpatrick ?? 5 }
    ),
    [fitzpatrick]
  );

  const conflicts = MOCK_ROUTINE.filter(p => p.conflict);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Routine Checker</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Label>Your current routine</Label>

        {MOCK_ROUTINE.map((p, i) => (
          <Card
            key={p.id}
            variant={p.conflict ? 'white' : 'tint'}
            style={p.conflict ? [styles.productCard, styles.conflictCard] : styles.productCard}
          >
            <View style={styles.productRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              <Text style={styles.productEmoji}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{p.name}</Text>
                <Text style={styles.productBrand}>{p.brand}</Text>
              </View>
              {p.conflict && <Text style={styles.warningIcon}>⚠️</Text>}
            </View>
            {p.conflict && (
              <View style={styles.conflictBanner}>
                <Text style={styles.conflictText}>⚠️ {p.conflict}</Text>
              </View>
            )}
          </Card>
        ))}

        {/* Routine score */}
        <Card variant="tint" style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View>
              <Label color={colors.pur}>Routine score</Label>
              <Text style={styles.scoreNum}>{String(analysis.score)}<Text style={styles.scoreMax}>/100</Text></Text>
            </View>
            <View style={styles.scoreRight}>
              <Text style={styles.scoreRec}>{analysis.recommendation}</Text>
            </View>
          </View>
        </Card>

        {/* Live AI analysis */}
        {analysis.conflicts.length > 0 && (
          <Card variant="white" style={styles.aiAnalysis}>
            <View style={styles.aiHeader}>
              <LinearGradient colors={['#D97706', '#B45309']} style={styles.aiIcon}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
              </LinearGradient>
              <View>
                <Label color={colors.amber}>{`${analysis.conflicts.length} conflict${analysis.conflicts.length > 1 ? 's' : ''} detected`}</Label>
                <Text style={styles.aiTitle}>SANO AI Analysis</Text>
              </View>
            </View>
            {analysis.conflicts.map((c, i) => (
              <View key={i} style={c.severity === 'bad' ? [styles.amberBanner, { backgroundColor: colors.redLt, borderLeftColor: colors.red }] : styles.amberBanner}>
                <Text style={styles.conflictTitle2}>{c.title}</Text>
                <Text style={[styles.amberText, c.severity === 'bad' && { color: colors.red }]}>{c.detail}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Corrected order */}
        <Card variant="tint" style={styles.correctedCard}>
          <View style={styles.correctedHeader}>
            <Text style={styles.correctedEmoji}>✅</Text>
            <View>
              <Label color={colors.grn}>Corrected order</Label>
              <Text style={styles.correctedTitle}>Recommended routine</Text>
            </View>
          </View>
          <View style={styles.grnBanner}>
            <Text style={styles.grnText}>Separate Vitamin C (AM) and Niacinamide (PM) for best results.</Text>
          </View>
          {MOCK_ROUTINE_DATA.correctedOrder.map((step, i) => (
            <View key={i} style={styles.correctedRow}>
              <LinearGradient colors={[...GRADIENT]} style={styles.correctedStep}>
                <Text style={styles.correctedStepNum}>{i + 1}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.correctedName}>{step}</Text>
              </View>
            </View>
          ))}
        </Card>

        <GradientButton
          label="📸 Scan new product label"
          onPress={() => router.push('/scan/camera')}
          variant="outline"
        />

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
  scroll: { padding: spacing.lg, gap: spacing.md },

  productCard: { gap: spacing.sm },
  conflictCard: { borderColor: colors.amber, borderWidth: 1.5 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.pur },
  productEmoji: { fontSize: 20 },
  productName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  productBrand: { fontSize: fontSize.xs, color: colors.t3 },
  warningIcon: { fontSize: 18 },
  conflictBanner: {
    backgroundColor: colors.amberLt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
  },
  conflictText: { fontSize: fontSize.sm, color: colors.amber, fontWeight: fontWeight.medium },

  aiAnalysis: { gap: spacing.md },
  aiHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  amberBanner: {
    backgroundColor: colors.amberLt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.amber}40`,
  },
  amberText: { fontSize: fontSize.sm, color: colors.gold, lineHeight: 20 },

  correctedCard: { gap: spacing.md },
  correctedHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  correctedEmoji: { fontSize: 22 },
  correctedTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  grnBanner: {
    backgroundColor: colors.grnLt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.grn}30`,
  },
  grnText: { fontSize: fontSize.sm, color: colors.grn, lineHeight: 20 },
  correctedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  correctedStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctedStepNum: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.white },
  correctedEmoji2: { fontSize: 18 },
  correctedName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  correctedBrand: { fontSize: fontSize.xs, color: colors.t3 },

  scoreCard: { gap: spacing.sm },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreNum: { fontSize: 40, fontWeight: fontWeight.extrabold, color: colors.pur },
  scoreMax: { fontSize: fontSize.md, color: colors.t3, fontWeight: fontWeight.regular },
  scoreRight: { flex: 1, paddingLeft: spacing.md },
  scoreRec: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },

  conflictTitle2: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.t1, marginBottom: 2 },
});
