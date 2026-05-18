import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
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
import * as Crypto from 'expo-crypto';

const DATA_SHARED = [
  { icon: '📸', title: 'Anonymised scan images', desc: 'Used to improve DermaAI accuracy for African skin types. Your face is never identifiable.' },
  { icon: '🧬', title: 'Skin condition labels', desc: 'Condition type and severity from your scans — anonymous and SHA-256 hashed.' },
  { icon: '🌍', title: 'Region & season', desc: 'Your region (e.g., Greater Accra) and Ghana season — for climate-aware research.' },
  { icon: '📱', title: 'Device model', desc: 'Phone model only — to understand camera quality effects on skin analysis.' },
];

const NOT_SHARED = [
  'Your name or email address',
  'Your exact location or GPS coordinates',
  'Payment information',
  'Any data that can identify you personally',
];

const REWARD_DETAILS = [
  '10 scans contributed = GHS 25 MoMo payout',
  'Paid monthly to your registered Mobile Money number',
  'Track contributions in your Profile → Research Rewards',
  'Opt out anytime — contributions stop immediately',
];

export default function DataConsentScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAccept = async () => {
    if (!user) { Alert.alert('Sign in required', 'Please sign in to enrol.'); return; }

    setSaving(true);
    try {
      const hashedUid = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        user.uid,
      );
      // Save consent record — immutable (Firestore rules: allow update: if false)
      await firestoreService.saveHealthEvent(user.uid, {
        type: 'research_consent',
        value: {
          consentVersion: '1.0',
          hashedUid,
          consentedAt: new Date().toISOString(),
          dataTypes: ['scan_image', 'condition', 'region', 'season', 'device'],
          rewardEnabled: true,
        },
        confidence: 1.0,
      });

      // Opt the user in at profile level
      await firestoreService.saveUserProfile(user.uid, {
        researchOptIn: true,
      });

      Alert.alert(
        'Enrolled! 🎉',
        'Thank you for contributing to SANO\'s research. Your first GHS 25 reward unlocks after 10 scans.',
        [{ text: 'Let\'s go!', onPress: () => router.replace('/(tabs)') }],
      );
    } catch (e) {
      Alert.alert('Error', 'Could not save consent. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'No problem',
      'You can enrol in research rewards anytime from Profile → Research Rewards.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
          <LinearGradient colors={[...GRADIENT]} style={styles.heroCard}>
            <Text style={styles.heroEmoji}>🔬</Text>
            <Text style={styles.heroTitle}>Help build AI for African skin</Text>
            <Text style={styles.heroText}>
              SANO is building the world's first AI dermatology dataset focused on Fitzpatrick IV–VI skin tones. Your anonymous scans directly fund this mission — and you earn GHS 25 for every 10 you contribute.
            </Text>
            <View style={styles.rewardPill}>
              <Text style={styles.rewardPillText}>💸 GHS 25 per 10 scans · Paid via MoMo</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* What's shared */}
        <Text style={styles.sectionLabel}>What we collect</Text>
        {DATA_SHARED.map((item, i) => (
          <Animated.View key={item.icon} entering={FadeInDown.delay(80 + i * 30).springify().damping(20)}>
            <Card variant="white" style={styles.dataCard}>
              <Text style={styles.dataIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dataTitle}>{item.title}</Text>
                <Text style={styles.dataDesc}>{item.desc}</Text>
              </View>
            </Card>
          </Animated.View>
        ))}

        {/* What's NOT shared */}
        <Card variant="tint" style={[styles.notShared, { borderColor: colors.grnLt, backgroundColor: colors.grnLt }]}>
          <Text style={styles.notSharedTitle}>🔒 We NEVER share</Text>
          {NOT_SHARED.map((item, i) => (
            <View key={i} style={styles.notSharedRow}>
              <Text style={styles.notSharedCheck}>✗</Text>
              <Text style={styles.notSharedText}>{item}</Text>
            </View>
          ))}
        </Card>

        {/* Reward details */}
        <Text style={styles.sectionLabel}>How rewards work</Text>
        <Card variant="white" style={{ gap: spacing.sm }}>
          {REWARD_DETAILS.map((d, i) => (
            <View key={i} style={styles.rewardRow}>
              <View style={styles.rewardDot} />
              <Text style={styles.rewardText}>{d}</Text>
            </View>
          ))}
        </Card>

        {/* Consent checkbox */}
        <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I consent to sharing anonymised scan data for dermatology research, and I understand I can withdraw at any time.
          </Text>
        </TouchableOpacity>

        <GradientButton
          label={saving ? 'Enrolling…' : 'Enrol & Earn Rewards 💜'}
          onPress={handleAccept}
          variant="primary"
          disabled={!agreed || saving}
        />

        <TouchableOpacity onPress={handleDecline} style={styles.declineBtn}>
          <Text style={styles.declineText}>No thanks — skip for now</Text>
        </TouchableOpacity>

        <Card variant="tint" style={styles.legalNote}>
          <Text style={styles.legalText}>
            Your data is processed under Ghana's Data Protection Act 2012 and anonymised using SHA-256 before storage. SANO is committed to ethical AI research for African communities.
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  heroCard: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'flex-start' },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  heroText: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.88)', lineHeight: 24 },
  rewardPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, alignSelf: 'flex-start',
  },
  rewardPillText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  sectionLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t2 },

  dataCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  dataIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  dataTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  dataDesc: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 18, marginTop: 2 },

  notShared: { gap: spacing.sm },
  notSharedTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.grn },
  notSharedRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  notSharedCheck: { color: colors.red, fontWeight: fontWeight.bold, marginTop: 1 },
  notSharedText: { fontSize: fontSize.sm, color: colors.t2, flex: 1 },

  rewardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  rewardDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.pur, marginTop: 7 },
  rewardText: { flex: 1, fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },

  checkRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: colors.t4,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkboxActive: { backgroundColor: colors.pur, borderColor: colors.pur },
  checkMark: { color: colors.white, fontSize: 13, fontWeight: fontWeight.bold },
  checkLabel: { flex: 1, fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },

  declineBtn: { alignItems: 'center', paddingVertical: spacing.xs },
  declineText: { fontSize: fontSize.md, color: colors.t3 },

  legalNote: {},
  legalText: { fontSize: fontSize.xs, color: colors.t3, lineHeight: 18 },
});
