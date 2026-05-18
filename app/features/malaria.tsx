import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../src/components/ui/Card';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { firestoreService } from '../../src/services/firestore';
import { useAuthStore } from '../../src/store/authStore';

const SYMPTOMS = [
  { id: 'fever',     label: 'Fever or chills',         icon: '🌡️' },
  { id: 'headache',  label: 'Severe headache',          icon: '🤕' },
  { id: 'sweating',  label: 'Sweating / night sweats',  icon: '💧' },
  { id: 'fatigue',   label: 'Fatigue / weakness',       icon: '😴' },
  { id: 'nausea',    label: 'Nausea or vomiting',       icon: '🤢' },
  { id: 'muscle',    label: 'Muscle / joint pain',      icon: '💪' },
  { id: 'jaundice',  label: 'Yellow eyes / skin',       icon: '👁️' },
  { id: 'confusion', label: 'Confusion or dizziness',   icon: '😵' },
];

function riskScore(symptoms: string[]): { score: number; level: 'low' | 'moderate' | 'high'; color: string; advice: string } {
  const high = ['fever', 'jaundice', 'confusion'];
  const highCount = symptoms.filter(s => high.includes(s)).length;
  const total = symptoms.length;

  if (highCount >= 2 || (highCount >= 1 && total >= 4)) {
    return { score: 85, level: 'high', color: colors.red, advice: 'Your symptoms suggest a high risk of malaria. Seek emergency medical care immediately and request a rapid diagnostic test (RDT).' };
  }
  if (total >= 3 || highCount >= 1) {
    return { score: 55, level: 'moderate', color: colors.amber, advice: 'Moderate risk. Visit a clinic or pharmacy today for a rapid malaria test (RDT). Available at most pharmacies in Accra for GHS 20–35.' };
  }
  if (total >= 1) {
    return { score: 25, level: 'low', color: colors.grn, advice: 'Low risk based on symptoms alone. Monitor closely. If fever develops or symptoms worsen, get tested immediately.' };
  }
  return { score: 5, level: 'low', color: colors.grn, advice: 'No symptoms selected. If you feel unwell, select any symptoms above.' };
}

export default function MalariaScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [assessed, setAssessed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setAssessed(false);
  };

  const handleAssess = async () => {
    if (selected.length === 0) {
      Alert.alert('Select symptoms', 'Please select at least one symptom to assess risk.');
      return;
    }
    setAssessed(true);
    setInsightLoading(true);
    import('../../src/services/aiChat').then(({ sendChatMessage }) =>
      sendChatMessage(
        `I've assessed my malaria risk based on symptoms: ${selected.join(', ')}. Risk level: ${result.level} (${result.score}% indicator). I'm in Ghana. Give me a warm 2-sentence personalised next-step message — what should I do right now?`,
        [],
        { region: 'Ghana' }
      )
    ).then(setAiInsight).catch(() => {}).finally(() => setInsightLoading(false));

    if (user) {
      setSaving(true);
      try {
        await firestoreService.saveHealthEvent(user.uid, {
          type: 'malaria_screen',
          value: { symptoms: selected, riskLevel: result.level, score: result.score },
          confidence: 0.7,
        });
      } catch { /* non-blocking */ } finally {
        setSaving(false);
      }
    }
  };

  const result = riskScore(selected);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Malaria Screening</Text>
        <View style={{ width: 55 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
          <LinearGradient colors={['#7C3AED', '#E8398A']} style={styles.heroCard}>
            <Text style={styles.heroTitle}>Symptom-Based Risk Screen</Text>
            <Text style={styles.heroText}>
              This is an educational screening tool — NOT a diagnosis. A rapid diagnostic test (RDT) is the only way to confirm malaria.
            </Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🦟 Software-only · No hardware required</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.sectionLabel}>Which symptoms are you experiencing?</Text>
        <View style={styles.symptomsGrid}>
          {SYMPTOMS.map((s, i) => {
            const active = selected.includes(s.id);
            return (
              <Animated.View key={s.id} entering={FadeInDown.delay(80 + i * 30).springify().damping(20)} style={{ width: '48%' }}>
                <TouchableOpacity
                  style={[styles.symptomCard, active && styles.symptomCardActive]}
                  onPress={() => toggleSymptom(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.symptomIcon}>{s.icon}</Text>
                  <Text style={[styles.symptomLabel, active && { color: colors.pur, fontWeight: fontWeight.semibold }]}>
                    {s.label}
                  </Text>
                  {active && <View style={styles.checkMark}><Text style={{ color: colors.white, fontSize: 10, fontWeight: fontWeight.bold }}>✓</Text></View>}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <GradientButton
          label={`Assess Risk (${selected.length} symptom${selected.length !== 1 ? 's' : ''} selected)`}
          onPress={handleAssess}
          variant="primary"
          disabled={selected.length === 0}
        />

        {assessed && (
          <Animated.View entering={FadeInDown.springify().damping(22)}>
            <Card variant="white" style={[styles.resultCard, { borderColor: `${result.color}40` }]}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>Risk Assessment</Text>
                <View style={[styles.riskBadge, { backgroundColor: `${result.color}20` }]}>
                  <Text style={[styles.riskLevel, { color: result.color }]}>
                    {result.level.toUpperCase()} RISK
                  </Text>
                </View>
              </View>

              <View style={styles.scoreBar}>
                <View style={[styles.scoreFill, { width: `${result.score}%`, backgroundColor: result.color }]} />
              </View>
              <Text style={[styles.scoreText, { color: result.color }]}>{result.score}% risk indicator</Text>

              <Text style={styles.adviceText}>{result.advice}</Text>

              {(insightLoading || aiInsight) && (
                <Card variant="tint" style={{ gap: 6 }}>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.pur }}>🤖 SANO AI</Text>
                  <Text style={{ fontSize: fontSize.md, color: colors.t2, lineHeight: 22 }}>
                    {insightLoading ? 'Analysing your symptoms…' : aiInsight}
                  </Text>
                </Card>
              )}

              <Card variant="tint" style={styles.testLocations}>
                <Text style={styles.testTitle}>📍 Get tested in Accra</Text>
                {[
                  'Korle-Bu Outpatient Dept — Free malaria testing',
                  'Ridge Hospital — Same-day RDT results',
                  'Ernest Chemists, Osu — RDT kits GHS 25',
                  'Vivo Pharmacy, East Legon — GHS 20',
                ].map((loc, i) => (
                  <Text key={i} style={styles.testLocation}>• {loc}</Text>
                ))}
              </Card>
            </Card>
          </Animated.View>
        )}

        <Card variant="tint" style={[styles.disclaimer, { borderColor: 'rgba(220,38,38,0.2)', backgroundColor: 'rgba(220,38,38,0.04)' }]}>
          <Text style={styles.disclaimerText}>
            ⚠️ This tool does NOT replace a laboratory or RDT test. SANO cannot diagnose malaria. If you have fever with any of the above symptoms, seek immediate medical attention — malaria can be life-threatening if untreated.
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.bdr,
  },
  back: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.medium },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  heroCard: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  heroTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  heroText: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm,
  },
  heroBadgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  sectionLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t2 },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  symptomCard: {
    padding: spacing.md, backgroundColor: colors.white,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.bdr,
    gap: spacing.xs, alignItems: 'flex-start', position: 'relative',
  },
  symptomCardActive: { borderColor: colors.pur, backgroundColor: colors.purLt },
  symptomIcon: { fontSize: 24 },
  symptomLabel: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 18 },
  checkMark: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.pur, alignItems: 'center', justifyContent: 'center',
  },

  resultCard: { gap: spacing.md, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t2 },
  riskBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  riskLevel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  scoreBar: { height: 8, backgroundColor: colors.bg2, borderRadius: radius.full, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: radius.full },
  scoreText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  adviceText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  testLocations: { gap: spacing.xs },
  testTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.t1 },
  testLocation: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },

  disclaimer: { gap: spacing.xs },
  disclaimerText: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },
});
