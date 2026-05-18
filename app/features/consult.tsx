import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../src/components/ui/Card';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius, shadows } from '../../src/theme';
import { consultationService, type Consultation, type Doctor } from '../../src/services/consultations';
import { useAuthStore } from '../../src/store/authStore';
import { useProfileStore } from '../../src/store/profileStore';

const STATUS_COLORS: Record<string, string> = {
  pending: colors.amber,
  active: colors.teal,
  answered: colors.grn,
  closed: colors.t4,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  active: 'In Review',
  answered: 'Answered',
  closed: 'Closed',
};

export default function ConsultScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { name } = useProfileStore();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consultationService.fetchDoctors(),
      user ? consultationService.fetchMyConsultations(user.uid) : Promise.resolve([]),
    ]).then(([docs, consults]) => {
      setDoctors(docs);
      setConsultations(consults);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.pur} style={{ marginTop: spacing.xxxl }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={doctors}
        keyExtractor={d => d.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.back}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Ask a Doctor</Text>
              <View style={{ width: 55 }} />
            </View>

            {/* Hero */}
            <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
              <LinearGradient colors={[...GRADIENT]} style={styles.heroCard}>
                <Text style={styles.heroTitle}>Verified Dermatologists</Text>
                <Text style={styles.heroText}>
                  Get async answers from Ghana's top skin specialists — typically within 24–48 hours.
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* My Consultations */}
            {consultations.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>My Consultations</Text>
                {consultations.map((c, i) => (
                  <Animated.View key={c.id} entering={FadeInDown.delay(80 + i * 40).springify().damping(20)}>
                    <TouchableOpacity onPress={() => router.push(`/features/consult-detail?id=${c.id}`)}>
                      <Card variant="white" style={styles.consultCard}>
                        <View style={styles.consultRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.consultSubject} numberOfLines={1}>{c.subject}</Text>
                            <Text style={styles.consultTime}>
                              {c.createdAt.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                            </Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[c.status]}20` }]}>
                            <Text style={[styles.statusText, { color: STATUS_COLORS[c.status] }]}>
                              {STATUS_LABELS[c.status]}
                            </Text>
                          </View>
                        </View>
                        {c.doctorReply && (
                          <Text style={styles.replyPreview} numberOfLines={2}>
                            Dr. {c.doctorName}: {c.doctorReply}
                          </Text>
                        )}
                      </Card>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </>
            )}

            <Text style={styles.sectionLabel}>Our Dermatologists</Text>
          </>
        }
        renderItem={({ item: doctor, index }) => (
          <Animated.View entering={FadeInDown.delay(160 + index * 60).springify().damping(20)}>
            <Card variant="white" style={styles.doctorCard}>
              <View style={styles.doctorHeader}>
                <LinearGradient colors={[...GRADIENT]} style={styles.doctorAvatar}>
                  <Text style={styles.doctorInitial}>{doctor.name.charAt(4).toUpperCase()}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <View style={styles.doctorNameRow}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    {doctor.verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
                  </View>
                  <Text style={styles.doctorSpec}>{doctor.specialty}</Text>
                  <Text style={styles.doctorLocation}>📍 {doctor.location}</Text>
                </View>
              </View>

              <Text style={styles.doctorBio} numberOfLines={3}>{doctor.bio}</Text>

              <View style={styles.doctorMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{doctor.yearsExp}</Text>
                  <Text style={styles.metaLabel}>Years exp.</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{doctor.avgResponseHours}h</Text>
                  <Text style={styles.metaLabel}>Avg response</Text>
                </View>
              </View>

              <GradientButton
                label="Ask a question →"
                onPress={() => router.push(`/features/consult-new?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}`)}
                variant="primary"
              />
            </Card>
          </Animated.View>
        )}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { gap: spacing.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bdr,
  },
  back: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.medium },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },

  heroCard: {
    margin: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  heroText: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.t3,
    paddingHorizontal: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  consultCard: { marginHorizontal: spacing.lg, gap: spacing.xs, ...shadows.xs },
  consultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  consultSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  consultTime: { fontSize: fontSize.xs, color: colors.t4 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  replyPreview: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 18, fontStyle: 'italic' },

  doctorCard: { marginHorizontal: spacing.lg, gap: spacing.md, ...shadows.xs },
  doctorHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  doctorAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInitial: { color: colors.white, fontSize: fontSize.xl2, fontWeight: fontWeight.bold },
  doctorNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  doctorName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  verifiedBadge: {
    fontSize: fontSize.xs,
    color: colors.grn,
    backgroundColor: colors.grnLt,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    fontWeight: fontWeight.bold,
  },
  doctorSpec: { fontSize: fontSize.sm, color: colors.pur, fontWeight: fontWeight.medium },
  doctorLocation: { fontSize: fontSize.xs, color: colors.t3, marginTop: 2 },
  doctorBio: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },
  doctorMeta: { flexDirection: 'row', gap: spacing.xl },
  metaItem: { alignItems: 'center' },
  metaValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  metaLabel: { fontSize: fontSize.xs, color: colors.t4 },
});
