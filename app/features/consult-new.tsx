import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { consultationService } from '../../src/services/consultations';
import { useAuthStore } from '../../src/store/authStore';
import { useProfileStore } from '../../src/store/profileStore';
import { useScanStore } from '../../src/store/scanStore';

const SUBJECTS = [
  'Dark spots / hyperpigmentation',
  'Acne & breakouts',
  'Razor bumps',
  'Eczema / dry skin',
  'Uneven skin tone',
  'Product recommendation',
  'Other concern',
];

export default function ConsultNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ doctorId: string; doctorName: string }>();
  const { user } = useAuthStore();
  const { name } = useProfileStore();
  const { scans } = useScanStore();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachScan, setAttachScan] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [tipsLoading, setTipsLoading] = useState(false);

  const latestScan = scans[0];
  const doctorName = decodeURIComponent(params.doctorName ?? '');

  const handleSubmit = async () => {
    if (!subject) { Alert.alert('Select a subject', 'Please choose what your question is about.'); return; }
    if (message.trim().length < 20) { Alert.alert('Too short', 'Please describe your concern in at least 20 characters.'); return; }
    if (!user) { Alert.alert('Sign in required', 'Please sign in to send a consultation.'); return; }

    setSubmitting(true);
    try {
      const patientName = name?.split(' ')[0] ?? 'Patient';
      await consultationService.createConsultation({
        patientUid: user.uid,
        patientName,
        subject,
        message: message.trim(),
        condition: latestScan && attachScan ? (latestScan as any).conditions?.[0]?.name : undefined,
        scanId: latestScan && attachScan ? (latestScan as any).id : undefined,
      });
      Alert.alert(
        'Consultation sent! 💜',
        `${doctorName} will typically respond within 24–48 hours. You'll see the reply in My Consultations.`,
        [{ text: 'OK', onPress: () => router.push('/features/consult') }],
      );
    } catch {
      Alert.alert('Error', 'Could not send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Consultation</Text>
          <View style={{ width: 55 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card variant="tint" style={styles.doctorBanner}>
            <Text style={styles.doctorLabel}>Sending to</Text>
            <Text style={styles.doctorName}>{doctorName || 'Our dermatology team'}</Text>
          </Card>

          <Text style={styles.sectionLabel}>What's your question about?</Text>
          {SUBJECTS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.subjectOption, subject === s && styles.subjectActive]}
              onPress={() => {
                setSubject(s);
                setAiTips(null);
                setTipsLoading(true);
                import('../../src/services/aiChat').then(({ sendChatMessage }) =>
                  sendChatMessage(
                    `I'm writing a consultation to a dermatologist about: "${s}". What are 3 key pieces of information I should include to get the best advice? Reply with 3 concise bullet points only.`,
                    [],
                    {}
                  )
                ).then(setAiTips).catch(() => {}).finally(() => setTipsLoading(false));
              }}
            >
              <View style={[styles.radio, subject === s && styles.radioActive]} />
              <Text style={[styles.subjectText, subject === s && { color: colors.pur, fontWeight: fontWeight.semibold }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}

          {(tipsLoading || aiTips) && (
            <Card variant="tint" style={styles.tipsCard}>
              <Text style={styles.tipsHeader}>🤖 What to include</Text>
              <Text style={styles.tipsText}>
                {tipsLoading ? 'Getting tips from SANO AI…' : aiTips}
              </Text>
            </Card>
          )}

          <Text style={styles.sectionLabel}>Describe your concern</Text>
          <Card variant="white" style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Include how long you've had the concern, what you've tried, and any relevant details…"
              placeholderTextColor={colors.t4}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{1000 - message.length} characters remaining</Text>
          </Card>

          {latestScan && (
            <TouchableOpacity
              style={styles.attachRow}
              onPress={() => setAttachScan(!attachScan)}
            >
              <View style={[styles.checkbox, attachScan && styles.checkboxActive]}>
                {attachScan && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.attachLabel}>Attach my latest scan</Text>
                <Text style={styles.attachSub}>
                  {(latestScan as any).conditions?.[0]?.name ?? 'Recent scan'} ·{' '}
                  {new Date((latestScan as any).createdAt ?? Date.now()).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <Card variant="tint" style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ This is an asynchronous text consultation — not emergency care. For urgent concerns, visit a hospital immediately.
            </Text>
          </Card>

          <GradientButton
            label={submitting ? 'Sending…' : 'Send consultation 💜'}
            onPress={handleSubmit}
            variant="primary"
            disabled={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },

  doctorBanner: { gap: 2 },
  doctorLabel: { fontSize: fontSize.xs, color: colors.t3, textTransform: 'uppercase', letterSpacing: 0.5 },
  doctorName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },

  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.t2 },

  subjectOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.bdr,
  },
  subjectActive: { borderColor: colors.pur, backgroundColor: colors.purLt },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: colors.t4,
  },
  radioActive: { borderColor: colors.pur, backgroundColor: colors.pur },
  subjectText: { fontSize: fontSize.md, color: colors.t2 },

  inputCard: { gap: spacing.sm },
  input: {
    fontSize: fontSize.md, color: colors.t1, lineHeight: 24,
    minHeight: 140, fontFamily: 'Inter_400Regular',
  },
  charCount: { fontSize: fontSize.xs, color: colors.t4, textAlign: 'right' },

  attachRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, backgroundColor: colors.white,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.bdr,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: colors.t4,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.pur, borderColor: colors.pur },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: fontWeight.bold },
  attachLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.t1 },
  attachSub: { fontSize: fontSize.xs, color: colors.t3 },

  disclaimer: { borderColor: 'rgba(220,38,38,0.2)', backgroundColor: 'rgba(220,38,38,0.04)' },
  disclaimerText: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },
  tipsCard: { gap: spacing.xs },
  tipsHeader: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.pur },
  tipsText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
});
