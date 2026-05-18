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

// ── Sickle Cell Risk ──────────────────────────────────────────────────────────

const FAMILY_HISTORY_OPTIONS = [
  { id: 'none',     label: 'No family history',              icon: '✅' },
  { id: 'carrier',  label: 'One parent is a carrier (AS)',   icon: '⚠️' },
  { id: 'both',     label: 'Both parents are carriers (AS)', icon: '🔴' },
  { id: 'relative', label: 'Sibling or relative with SCD',   icon: '🔴' },
  { id: 'unknown',  label: 'Unknown / not sure',             icon: '❓' },
];

const SICKLE_SYMPTOMS = [
  { id: 'pain_crisis', label: 'Recurring pain episodes',   icon: '😣' },
  { id: 'fatigue',     label: 'Chronic fatigue / anaemia', icon: '😴' },
  { id: 'swelling',    label: 'Hand / foot swelling',      icon: '🖐️' },
  { id: 'jaundice',    label: 'Yellowing of eyes',         icon: '👁️' },
  { id: 'infections',  label: 'Frequent infections',       icon: '🦠' },
];

function sickleCellRisk(familyHistory: string, symptoms: string[]): {
  level: 'low' | 'moderate' | 'high'; advice: string; color: string;
} {
  const sympCount = symptoms.length;
  if (familyHistory === 'both' || familyHistory === 'relative') {
    return {
      level: sympCount >= 2 ? 'high' : 'moderate',
      color: sympCount >= 2 ? colors.red : colors.amber,
      advice: 'Your family history suggests elevated risk. A simple haemoglobin electrophoresis test (HbEP) is recommended — available at most teaching hospitals in Ghana.',
    };
  }
  if (familyHistory === 'carrier' && sympCount >= 2) {
    return { level: 'moderate', color: colors.amber, advice: 'With a carrier parent and multiple symptoms, a HbEP test is advisable. Ask your doctor about screening.' };
  }
  return { level: 'low', color: colors.grn, advice: 'Based on your answers, your immediate sickle cell risk appears low. Standard newborn screening is recommended for new parents.' };
}

// ── Blood Group Estimation (Educational) ─────────────────────────────────────

const BLOOD_GROUPS = ['A', 'B', 'AB', 'O'] as const;
const RH_FACTORS = ['+ (Positive)', '− (Negative)'] as const;

const PREVALENCE_GH: Record<string, number> = { 'O': 46, 'A': 22, 'B': 27, 'AB': 5 };

export default function BloodTestScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'sickle' | 'blood'>('sickle');

  // Sickle cell state
  const [familyHistory, setFamilyHistory] = useState<string>('');
  const [sickleSymptoms, setSickleSymptoms] = useState<string[]>([]);
  const [sickleAssessed, setSickleAssessed] = useState(false);
  const [aiSickleInsight, setAiSickleInsight] = useState<string | null>(null);
  const [sickleInsightLoading, setSickleInsightLoading] = useState(false);

  // Blood group state
  const [knownBlood, setKnownBlood] = useState<string>('');
  const [knownRh, setKnownRh] = useState<string>('');
  const [bloodSaved, setBloodSaved] = useState(false);

  const toggleSickleSymptom = (id: string) => {
    setSickleSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setSickleAssessed(false);
  };

  const handleSickleAssess = async () => {
    if (!familyHistory) { Alert.alert('Family history required', 'Please select your family history first.'); return; }
    setSickleAssessed(true);
    setSickleInsightLoading(true);
    import('../../src/services/aiChat').then(({ sendChatMessage }) =>
      sendChatMessage(
        `I've completed a sickle cell risk screen. Family history: ${familyHistory}. Symptoms: ${sickleSymptoms.length > 0 ? sickleSymptoms.join(', ') : 'none reported'}. Risk level: ${sickleCellRisk(familyHistory, sickleSymptoms).level}. I'm in Ghana. Give me a warm 2-sentence personalised message about next steps.`,
        [],
        { region: 'Ghana' }
      )
    ).then(setAiSickleInsight).catch(() => {}).finally(() => setSickleInsightLoading(false));
    if (user) {
      await firestoreService.saveHealthEvent(user.uid, {
        type: 'sickle_cell_screen',
        value: { familyHistory, symptoms: sickleSymptoms, risk: sickleResult.level },
        confidence: 0.6,
      });
    }
  };

  const handleSaveBloodGroup = async () => {
    if (!knownBlood || !knownRh) { Alert.alert('Incomplete', 'Please select both blood group and Rh factor.'); return; }
    if (user) {
      await firestoreService.saveHealthEvent(user.uid, {
        type: 'blood_group',
        value: { group: knownBlood, rh: knownRh, source: 'self_reported' },
        confidence: 1.0,
      });
    }
    setBloodSaved(true);
  };

  const sickleResult = familyHistory ? sickleCellRisk(familyHistory, sickleSymptoms) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Screening</Text>
        <View style={{ width: 55 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'sickle' && styles.tabActive]} onPress={() => setTab('sickle')}>
          <Text style={[styles.tabText, tab === 'sickle' && styles.tabTextActive]}>🔴 Sickle Cell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'blood' && styles.tabActive]} onPress={() => setTab('blood')}>
          <Text style={[styles.tabText, tab === 'blood' && styles.tabTextActive]}>🩸 Blood Group</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {tab === 'sickle' ? (
          <>
            <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
              <LinearGradient colors={['#7C3AED', '#E8398A']} style={styles.heroCard}>
                <Text style={styles.heroTitle}>Sickle Cell Risk Screen</Text>
                <Text style={styles.heroText}>Answer a few questions about your family history and symptoms. This is for educational awareness only — not a genetic test.</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.sectionLabel}>Family history of sickle cell disease</Text>
            {FAMILY_HISTORY_OPTIONS.map((o, i) => (
              <Animated.View key={o.id} entering={FadeInDown.delay(60 + i * 30).springify().damping(20)}>
                <TouchableOpacity
                  style={[styles.optionCard, familyHistory === o.id && styles.optionCardActive]}
                  onPress={() => { setFamilyHistory(o.id); setSickleAssessed(false); }}
                >
                  <Text style={styles.optionIcon}>{o.icon}</Text>
                  <Text style={[styles.optionLabel, familyHistory === o.id && { color: colors.pur, fontWeight: fontWeight.semibold }]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <Text style={styles.sectionLabel}>Symptoms you experience</Text>
            {SICKLE_SYMPTOMS.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.optionCard, sickleSymptoms.includes(s.id) && styles.optionCardActive]}
                onPress={() => toggleSickleSymptom(s.id)}
              >
                <Text style={styles.optionIcon}>{s.icon}</Text>
                <Text style={[styles.optionLabel, sickleSymptoms.includes(s.id) && { color: colors.pur, fontWeight: fontWeight.semibold }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}

            <GradientButton label="Assess My Risk" onPress={handleSickleAssess} variant="primary" disabled={!familyHistory} />

            {sickleAssessed && sickleResult && (
              <Animated.View entering={FadeInDown.springify().damping(22)}>
                <Card variant="white" style={[styles.resultCard, { borderColor: `${sickleResult.color}40` }]}>
                  <View style={[styles.riskBadge, { backgroundColor: `${sickleResult.color}20` }]}>
                    <Text style={[styles.riskLevel, { color: sickleResult.color }]}>
                      {sickleResult.level.toUpperCase()} RISK
                    </Text>
                  </View>
                  <Text style={styles.adviceText}>{sickleResult.advice}</Text>
                  {(sickleInsightLoading || aiSickleInsight) && (
                    <Card variant="tint" style={{ gap: 6 }}>
                      <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.pur }}>🤖 SANO AI</Text>
                      <Text style={{ fontSize: fontSize.md, color: colors.t2, lineHeight: 22 }}>
                        {sickleInsightLoading ? 'Generating personalised guidance…' : aiSickleInsight}
                      </Text>
                    </Card>
                  )}
                  <Card variant="tint" style={{ gap: spacing.xs }}>
                    <Text style={styles.testTitle}>🏥 Where to get tested in Ghana</Text>
                    {['Korle-Bu Haematology Dept — HbEP test', 'Komfo Anokye Teaching Hospital, Kumasi', 'Lister Hospital, Accra — Private, same-day'].map((l, i) => (
                      <Text key={i} style={styles.testLoc}>• {l}</Text>
                    ))}
                  </Card>
                </Card>
              </Animated.View>
            )}
          </>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
              <LinearGradient colors={['#E8398A', '#7C3AED']} style={styles.heroCard}>
                <Text style={styles.heroTitle}>Blood Group Record</Text>
                <Text style={styles.heroText}>Log your blood group to keep it accessible in the SANO health record. We cannot determine your blood type from a photo.</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.sectionLabel}>Prevalence in Ghana</Text>
            <View style={styles.prevalenceRow}>
              {Object.entries(PREVALENCE_GH).map(([g, pct]) => (
                <View key={g} style={styles.prevalenceCard}>
                  <Text style={styles.prevalenceGroup}>Type {g}</Text>
                  <View style={styles.prevalenceBar}>
                    <View style={[styles.prevalenceFill, { height: `${pct}%` }]} />
                  </View>
                  <Text style={styles.prevalencePct}>{pct}%</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>I know my blood group</Text>
            <View style={styles.bloodRow}>
              {BLOOD_GROUPS.map(g => (
                <TouchableOpacity key={g} style={[styles.bloodChip, knownBlood === g && styles.bloodChipActive]} onPress={() => setKnownBlood(g)}>
                  <Text style={[styles.bloodChipText, knownBlood === g && { color: colors.white }]}>Type {g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.bloodRow}>
              {RH_FACTORS.map(rh => (
                <TouchableOpacity key={rh} style={[styles.bloodChip, knownRh === rh && styles.bloodChipActive]} onPress={() => setKnownRh(rh)}>
                  <Text style={[styles.bloodChipText, knownRh === rh && { color: colors.white }]}>{rh}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {bloodSaved ? (
              <Card variant="tint" style={{ alignItems: 'center', gap: spacing.sm }}>
                <Text style={{ fontSize: 32 }}>✅</Text>
                <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.grn }}>Saved!</Text>
                <Text style={{ fontSize: fontSize.md, color: colors.t2, textAlign: 'center' }}>
                  Blood Group {knownBlood} {knownRh} saved to your health record.
                </Text>
              </Card>
            ) : (
              <GradientButton
                label={knownBlood && knownRh ? `Save Blood Group ${knownBlood} ${knownRh}` : 'Save to Health Record'}
                onPress={handleSaveBloodGroup}
                variant="primary"
                disabled={!knownBlood || !knownRh}
              />
            )}
          </>
        )}

        <Card variant="tint" style={[styles.disclaimer, { borderColor: 'rgba(220,38,38,0.2)', backgroundColor: 'rgba(220,38,38,0.04)' }]}>
          <Text style={styles.disclaimerText}>
            ⚠️ SANO does not perform genetic tests or laboratory analysis. All screening results are educational estimates based on self-reported information. Always confirm with a certified medical laboratory.
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

  tabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.bdr,
    backgroundColor: colors.white,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.pur },
  tabText: { fontSize: fontSize.md, color: colors.t3, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.pur, fontWeight: fontWeight.bold },

  scroll: { padding: spacing.lg, gap: spacing.md },

  heroCard: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  heroTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  heroText: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  sectionLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t2, marginTop: spacing.xs },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, backgroundColor: colors.white,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.bdr,
  },
  optionCardActive: { borderColor: colors.pur, backgroundColor: colors.purLt },
  optionIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  optionLabel: { fontSize: fontSize.md, color: colors.t2, flex: 1 },

  resultCard: { gap: spacing.md, borderWidth: 1 },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  riskLevel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  adviceText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  testTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.t1 },
  testLoc: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },

  prevalenceRow: { flexDirection: 'row', gap: spacing.sm, height: 120, alignItems: 'flex-end' },
  prevalenceCard: { flex: 1, alignItems: 'center', gap: 4 },
  prevalenceGroup: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.t1 },
  prevalenceBar: {
    flex: 1, width: '100%', backgroundColor: colors.bg2,
    borderRadius: radius.sm, justifyContent: 'flex-end', overflow: 'hidden',
  },
  prevalenceFill: { width: '100%', backgroundColor: colors.pur, borderRadius: radius.sm },
  prevalencePct: { fontSize: fontSize.xs, color: colors.t3 },

  bloodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bloodChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.bdr,
    backgroundColor: colors.white,
  },
  bloodChipActive: { backgroundColor: colors.pur, borderColor: colors.pur },
  bloodChipText: { fontSize: fontSize.md, color: colors.t2, fontWeight: fontWeight.medium },

  disclaimer: { gap: spacing.xs },
  disclaimerText: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },
});
