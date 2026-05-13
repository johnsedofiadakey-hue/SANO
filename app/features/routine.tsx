import React, { useMemo } from 'react';
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
import { useProfileStore } from '../../src/store/profileStore';
import { useScanStore } from '../../src/store/scanStore';
import type { Fitzpatrick } from '../../src/types/user';
import { api } from '../../src/services/api';

interface RoutineProduct {
  id: string;
  name: string;
  brand: string;
  step: number;
  emoji: string;
  conflict?: string;
  pharmacies: string[];
}

const ACCRA_PHARMACY_POOL = ['Ernest Chemists', 'Entrance Pharmacy', 'Melcom'];

function getPersonalisedRoutine(
  conditionName: string,
  fitzpatrick: Fitzpatrick | null
): RoutineProduct[] {
  const isSensitive = (fitzpatrick ?? 4) >= 4;
  const cond = conditionName.toLowerCase();

  if (cond.includes('hyperpigment') || cond.includes('dark spot')) {
    return [
      { id: '1', name: 'Gentle Cleanser', brand: 'CeraVe', step: 1, emoji: '🧴', pharmacies: ['Ernest Chemists', 'Melcom'] },
      { id: '2', name: 'Vitamin C 10% Serum', brand: 'The Ordinary', step: 2, emoji: '🍊', pharmacies: ['Entrance Pharmacy', 'Melcom'] },
      { id: '3', name: 'Niacinamide 10%', brand: 'The Ordinary', step: 3, emoji: '💧', conflict: 'Use PM only — do not layer with Vitamin C', pharmacies: ['Entrance Pharmacy', 'Melcom'] },
      { id: '4', name: 'Alpha Arbutin 2%', brand: 'The Ordinary', step: 4, emoji: '✨', pharmacies: ['Entrance Pharmacy'] },
      { id: '5', name: 'Moisturiser SPF 50+', brand: 'Neutrogena', step: 5, emoji: '☀️', pharmacies: ['Ernest Chemists', 'Melcom'] },
    ];
  }

  if (cond.includes('acne') || cond.includes('breakout')) {
    return [
      { id: '1', name: 'Salicylic Acid Cleanser', brand: 'Neutrogena', step: 1, emoji: '🧴', pharmacies: ['Ernest Chemists', 'Melcom'] },
      { id: '2', name: 'Niacinamide 10%', brand: 'The Ordinary', step: 2, emoji: '💧', pharmacies: ['Entrance Pharmacy', 'Melcom'] },
      { id: '3', name: 'Salicylic Acid 2%', brand: 'The Ordinary', step: 3, emoji: '⚗️', conflict: 'Use AM or PM — not both; avoid with Vitamin C', pharmacies: ['Entrance Pharmacy'] },
      { id: '4', name: 'Oil-free Moisturiser', brand: 'Cetaphil', step: 4, emoji: '💆', pharmacies: ['Ernest Chemists'] },
      { id: '5', name: 'SPF 50+ Gel Sunscreen', brand: 'La Roche-Posay', step: 5, emoji: '☀️', pharmacies: ['Ernest Chemists', 'Entrance Pharmacy'] },
    ];
  }

  if (cond.includes('eczema') || cond.includes('dermatitis')) {
    return [
      { id: '1', name: 'Fragrance-free Cleanser', brand: 'Dove Sensitive', step: 1, emoji: '🧴', pharmacies: ['Ernest Chemists', 'Melcom'] },
      { id: '2', name: 'Ceramide Moisturiser', brand: 'CeraVe', step: 2, emoji: '🛡️', pharmacies: ['Ernest Chemists', 'Entrance Pharmacy'] },
      { id: '3', name: 'Colloidal Oatmeal Cream', brand: 'Aveeno', step: 3, emoji: '🌾', pharmacies: ['Ernest Chemists'] },
      { id: '4', name: 'Hydrocortisone 1%', brand: 'Generic', step: 4, emoji: '💊', conflict: 'Prescription-strength only for flares; max 7 days', pharmacies: ['Ernest Chemists', 'Entrance Pharmacy'] },
      { id: '5', name: 'Mineral SPF 30', brand: 'EltaMD', step: 5, emoji: '☀️', pharmacies: ['Entrance Pharmacy'] },
    ];
  }

  if (cond.includes('razor') || cond.includes('bump')) {
    return [
      { id: '1', name: 'Gentle Exfoliating Wash', brand: 'Tend Skin', step: 1, emoji: '🧴', pharmacies: ['Ernest Chemists'] },
      { id: '2', name: 'Glycolic Acid 7%', brand: 'The Ordinary', step: 2, emoji: '⚗️', conflict: 'Use PM only; introduce slowly 2x/week', pharmacies: ['Entrance Pharmacy', 'Melcom'] },
      { id: '3', name: 'Niacinamide 10%', brand: 'The Ordinary', step: 3, emoji: '💧', pharmacies: ['Entrance Pharmacy', 'Melcom'] },
      { id: '4', name: 'Bump Eraser Serum', brand: 'Tend Skin', step: 4, emoji: '✨', pharmacies: ['Ernest Chemists'] },
      { id: '5', name: 'Moisturiser SPF 50+', brand: 'Neutrogena', step: 5, emoji: '☀️', pharmacies: ['Ernest Chemists', 'Melcom'] },
    ];
  }

  // Healthy / general
  return [
    { id: '1', name: 'Gentle Cleanser', brand: 'CeraVe', step: 1, emoji: '🧴', pharmacies: ['Ernest Chemists', 'Melcom'] },
    { id: '2', name: 'Vitamin C 10%', brand: 'The Ordinary', step: 2, emoji: '🍊', pharmacies: ['Entrance Pharmacy', 'Melcom'] },
    { id: '3', name: 'Hyaluronic Acid 2%', brand: 'The Ordinary', step: 3, emoji: '💧', pharmacies: ['Entrance Pharmacy'] },
    { id: '4', name: isSensitive ? 'SPF 50+ for Dark Skin' : 'SPF 30 Moisturiser', brand: 'Neutrogena', step: 4, emoji: '☀️', pharmacies: ['Ernest Chemists', 'Melcom'] },
  ];
}

export default function RoutineScreen() {
  const router = useRouter();
  const { logEvent } = useDataCollection();
  const { fitzpatrick } = useProfileStore();
  const { currentResult } = useScanStore();
  const [routine, setRoutine] = React.useState<RoutineProduct[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    logEvent('routine_checked');
  }, [logEvent]);

  const conditionName = currentResult?.conditions?.[0]?.name ?? '';

  React.useEffect(() => {
    if (!currentResult) return;

    const fetchRoutine = async () => {
      setLoading(true);
      try {
        const response = await api.post('/ai/routine', {
          condition: conditionName,
          userContext: { fitzpatrick },
        });
        setRoutine(response.data.routine);
      } catch (error) {
        console.error('Failed to fetch routine:', error);
        // Fallback to local
        setRoutine(getPersonalisedRoutine(conditionName, fitzpatrick));
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
  }, [conditionName, fitzpatrick, currentResult]);

  const analysis = useMemo(
    () => analyzeRoutine(
      routine.map(p => ({ name: p.name })),
      { skinType: 'combination', fitzpatrick: fitzpatrick ?? 5 }
    ),
    [routine, fitzpatrick]
  );

  const conflicts = routine.filter(p => p.conflict);

  if (!currentResult) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Routine Builder</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔬</Text>
          <Text style={styles.emptyTitle}>No scan yet</Text>
          <Text style={styles.emptyBody}>
            Scan your skin first to get your personalised routine ✦
          </Text>
          <GradientButton
            label="Scan my skin now"
            onPress={() => router.push('/scan/camera')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const conditionDisplay = currentResult.conditions?.[0]?.name ?? 'Healthy Skin';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Routine Builder</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading && (
          <View style={{ padding: 10, alignItems: 'center', backgroundColor: colors.bg3, borderRadius: 8 }}>
            <Text style={{ color: colors.pur, fontWeight: '600' }}>Loading routine from AI...</Text>
          </View>
        )}

        {/* Context banner */}
        <LinearGradient colors={[...GRADIENT]} style={styles.contextBanner}>
          <Text style={styles.contextLabel}>Personalised for your scan</Text>
          <Text style={styles.contextCondition}>{conditionDisplay}</Text>
          {fitzpatrick && (
            <Text style={styles.contextSub}>Fitzpatrick Type {fitzpatrick} · Optimised for your tone</Text>
          )}
        </LinearGradient>

        <Label>Your personalised routine</Label>

        {routine.map((p, i) => (
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

            {/* Find in Accra */}
            <View style={styles.pharmacyRow}>
              <Text style={styles.pharmacyLabel}>Find in Accra: </Text>
              {p.pharmacies.map(ph => (
                <View key={ph} style={styles.pharmacyChip}>
                  <Text style={styles.pharmacyChipText}>{ph}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        {/* Routine score */}
        <Card variant="tint" style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View>
              <Label color={colors.pur}>Routine score</Label>
              <Text style={styles.scoreNum}>
                {String(analysis.score)}
                <Text style={styles.scoreMax}>/100</Text>
              </Text>
            </View>
            <View style={styles.scoreRight}>
              <Text style={styles.scoreRec}>{analysis.recommendation}</Text>
            </View>
          </View>
        </Card>

        {/* AI conflict analysis */}
        {analysis.conflicts.length > 0 && (
          <Card variant="white" style={styles.aiAnalysis}>
            <View style={styles.aiHeader}>
              <LinearGradient colors={['#D97706', '#B45309']} style={styles.aiIcon}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
              </LinearGradient>
              <View>
                <Label color={colors.amber}>
                  {`${analysis.conflicts.length} conflict${analysis.conflicts.length > 1 ? 's' : ''} detected`}
                </Label>
                <Text style={styles.aiTitle}>SANO AI Analysis</Text>
              </View>
            </View>
            {analysis.conflicts.map((c, i) => (
              <View
                key={i}
                style={c.severity === 'bad'
                  ? [styles.amberBanner, { backgroundColor: colors.redLt, borderLeftColor: colors.red }]
                  : styles.amberBanner}
              >
                <Text style={styles.conflictTitle2}>{c.title}</Text>
                <Text style={[styles.amberText, c.severity === 'bad' && { color: colors.red }]}>
                  {c.detail}
                </Text>
              </View>
            ))}
          </Card>
        )}

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
  demoBanner: { backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' },
  demoText: { fontSize: 12, color: '#B45309', fontWeight: '600', textAlign: 'center' },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.t1 },
  emptyBody: { fontSize: fontSize.md, color: colors.t3, textAlign: 'center', lineHeight: 24 },

  contextBanner: { borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  contextLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  contextCondition: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.white },
  contextSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },

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

  pharmacyRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  pharmacyLabel: { fontSize: fontSize.xs, color: colors.t4, fontWeight: fontWeight.semibold },
  pharmacyChip: {
    backgroundColor: colors.bg3,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pharmacyChipText: { fontSize: fontSize.xs2, color: colors.t3, fontWeight: fontWeight.medium },

  scoreCard: { gap: spacing.sm },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreNum: { fontSize: 40, fontWeight: fontWeight.extrabold, color: colors.pur },
  scoreMax: { fontSize: fontSize.md, color: colors.t3, fontWeight: fontWeight.regular },
  scoreRight: { flex: 1, paddingLeft: spacing.md },
  scoreRec: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },

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
  conflictTitle2: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.t1, marginBottom: 2 },
});
