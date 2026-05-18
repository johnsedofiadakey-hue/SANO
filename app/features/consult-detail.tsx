import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { consultationService, type Consultation } from '../../src/services/consultations';

const STATUS_CONFIG: Record<string, { color: string; label: string; desc: string }> = {
  pending:  { color: colors.amber, label: 'Pending',    desc: 'Your question has been received and is awaiting a doctor.' },
  active:   { color: colors.teal,  label: 'In Review',  desc: 'A doctor is currently reviewing your case.' },
  answered: { color: colors.grn,   label: 'Answered',   desc: 'The doctor has replied to your consultation.' },
  closed:   { color: colors.t4,    label: 'Closed',     desc: 'This consultation is closed.' },
};

export default function ConsultDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [consult, setConsult] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consultationService.getConsultation(params.id ?? '')
      .then(setConsult)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleClose = async () => {
    if (!consult) return;
    Alert.alert('Close consultation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close', style: 'destructive',
        onPress: async () => {
          await consultationService.closeConsultation(consult.id);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.pur} style={{ marginTop: spacing.xxxl }} />
      </SafeAreaView>
    );
  }

  if (!consult) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>Consultation not found.</Text>
      </SafeAreaView>
    );
  }

  const statusCfg = STATUS_CONFIG[consult.status] ?? STATUS_CONFIG.pending;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation</Text>
        <View style={{ width: 55 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Status */}
        <Card variant="tint" style={[styles.statusCard, { borderColor: `${statusCfg.color}40` }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
            <Text style={[styles.statusLabel, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
          <Text style={styles.statusDesc}>{statusCfg.desc}</Text>
        </Card>

        {/* Patient question */}
        <Card variant="white" style={styles.messageCard}>
          <Text style={styles.messageLabel}>Your question</Text>
          <Text style={styles.subjectText}>{consult.subject}</Text>
          <Text style={styles.messageText}>{consult.message}</Text>
          <Text style={styles.messageDate}>
            Sent {consult.createdAt.toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </Card>

        {/* Doctor reply */}
        {consult.doctorReply ? (
          <Card variant="white" style={styles.replyCard}>
            <View style={styles.replyHeader}>
              <LinearGradient colors={[...GRADIENT]} style={styles.replyAvatar}>
                <Text style={styles.replyAvatarText}>Dr</Text>
              </LinearGradient>
              <View>
                <Text style={styles.replyDoctorName}>{consult.doctorName ?? 'SANO Dermatologist'}</Text>
                <Text style={styles.replyDate}>
                  {consult.repliedAt?.toLocaleDateString('en-GH', { day: 'numeric', month: 'long' }) ?? ''}
                </Text>
              </View>
            </View>
            <Text style={styles.replyText}>{consult.doctorReply}</Text>

            <Card variant="tint" style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                ⚠️ This is educational guidance only and not a formal medical diagnosis. Always follow up with an in-person visit for serious concerns.
              </Text>
            </Card>
          </Card>
        ) : (
          <Card variant="tint" style={styles.waitingCard}>
            <Text style={styles.waitingIcon}>⏳</Text>
            <Text style={styles.waitingTitle}>Awaiting response</Text>
            <Text style={styles.waitingText}>Doctors typically respond within 24–48 hours.</Text>
          </Card>
        )}

        {consult.status !== 'closed' && (
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close this consultation</Text>
          </TouchableOpacity>
        )}

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
  backBtn: { padding: spacing.lg },
  errorText: { textAlign: 'center', marginTop: spacing.xl, color: colors.t3, fontSize: fontSize.md },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  statusCard: { gap: spacing.xs },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  statusDesc: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },

  messageCard: { gap: spacing.sm },
  messageLabel: { fontSize: fontSize.xs, color: colors.t4, textTransform: 'uppercase', letterSpacing: 0.5 },
  subjectText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  messageText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 24 },
  messageDate: { fontSize: fontSize.xs, color: colors.t4 },

  replyCard: { gap: spacing.md },
  replyHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  replyAvatar: {
    width: 44, height: 44, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  replyAvatarText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  replyDoctorName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  replyDate: { fontSize: fontSize.xs, color: colors.t4 },
  replyText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 26 },
  disclaimer: { borderColor: 'rgba(220,38,38,0.2)', backgroundColor: 'rgba(220,38,38,0.04)' },
  disclaimerText: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 18 },

  waitingCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  waitingIcon: { fontSize: 32 },
  waitingTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  waitingText: { fontSize: fontSize.sm, color: colors.t3, textAlign: 'center' },

  closeBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  closeBtnText: { fontSize: fontSize.sm, color: colors.red, fontWeight: fontWeight.medium },
});
