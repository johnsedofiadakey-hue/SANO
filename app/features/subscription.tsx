import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePaystack } from 'react-native-paystack-webview';
import { SUBSCRIPTION_PLANS } from '@/src/services/payments';
import { useAuthStore } from '@/src/store/authStore';
import { colors, GRADIENT, spacing, radius, fontSize, shadows } from '@/src/theme';

const PAYSTACK_LIVE = !!process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY;

const FEATURES = {
  free: [
    '3 skin scans per month',
    'Basic condition detection',
    'General skincare tips',
  ],
  plus: [
    'Unlimited skin scans',
    'Detailed condition reports',
    'Personalised skincare routine',
    'AI skin health chat',
    'Fitzpatrick-matched recommendations',
    'Export PDF reports',
  ],
  pro: [
    'Everything in Plus',
    'Priority AI analysis',
    'Dermatologist review queue',
    'Monthly skin progress tracking',
    'Pharmacy locator (Accra)',
    'Family account (up to 4 profiles)',
  ],
};

export default function SubscriptionScreen() {
  const [selected, setSelected] = useState<'plus' | 'pro'>('plus');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const user = useAuthStore(s => s.user);
  const { popup } = usePaystack();

  const plan = SUBSCRIPTION_PLANS[selected];
  // Display amount: divide pesewas by 100 → GHS
  const displayAmount = plan.amount / 100;

  const handleSubscribe = () => {
    setLoading(true);

    if (!PAYSTACK_LIVE) {
      // Demo: simulate 1.5s processing
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => router.back(), 2200);
      }, 1500);
      return;
    }

    popup.checkout({
      email: user?.email ?? 'user@getsano.com',
      amount: displayAmount,
      reference: `sano_${selected}_${Date.now()}`,
      onSuccess: () => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => router.back(), 2200);
      },
      onCancel: () => {
        setLoading(false);
      },
    });
  };

  if (success) {
    return (
      <LinearGradient colors={['#0A0A0F', '#1a0533']} style={styles.successScreen}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>You're in!</Text>
        <Text style={styles.successSub}>
          Welcome to SANO {selected === 'plus' ? 'Plus' : 'Pro'}.{'\n'}Your skin journey starts now.
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0A0F', '#110826']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Upgrade SANO</Text>
          <Text style={styles.subtitle}>Skin health built for melanin-rich skin.</Text>
        </View>

        {/* ── Plan toggle ── */}
        <View style={styles.toggle}>
          {(['plus', 'pro'] as const).map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => setSelected(p)}
              style={[styles.toggleBtn, selected === p && styles.toggleBtnActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, selected === p && styles.toggleTextActive]}>
                SANO {p === 'plus' ? 'Plus' : 'Pro'}
              </Text>
              {p === 'pro' && (
                <LinearGradient colors={[...GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>BEST</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Price card ── */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>GHS</Text>
            <Text style={styles.price}>{displayAmount}</Text>
            <Text style={styles.period}>/month</Text>
          </View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDesc}>{plan.description}</Text>
        </View>

        {/* ── Feature list ── */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>What's included</Text>
          {FEATURES[selected].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
          {selected === 'pro' && (
            <>
              <View style={styles.divider} />
              <Text style={styles.comparedTo}>All Plus features included</Text>
            </>
          )}
        </View>

        {/* ── Free plan note ── */}
        <View style={styles.freeRow}>
          <Text style={styles.freeLabel}>Free plan: </Text>
          <Text style={styles.freeItems}>{FEATURES.free.join(' · ')}</Text>
        </View>

        {/* ── CTA button ── */}
        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.88}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={[...GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.ctaBtn, loading && { opacity: 0.65 }]}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.ctaText}>Subscribe — GHS {displayAmount}/mo</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        {!PAYSTACK_LIVE && (
          <Text style={styles.demoNote}>Demo mode — no charge will occur</Text>
        )}

        <Text style={styles.legal}>
          Cancel anytime. Billed monthly via MTN MoMo, Vodafone, AirtelTigo, Visa or Mastercard.{'\n'}
          Secured by Paystack.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.xxl, paddingBottom: 56 },

  header: { marginBottom: 28 },
  backBtn: { marginBottom: 20 },
  backText: { color: colors.purGlow, fontSize: fontSize.md, fontFamily: 'Inter_600SemiBold' },
  title: { fontSize: 26, fontFamily: 'Inter_800ExtraBold', color: '#F5F3FF', marginBottom: 6 },
  subtitle: { fontSize: fontSize.md, color: '#9B8CB8', lineHeight: 20 },

  toggle: {
    flexDirection: 'row', backgroundColor: '#1A1030',
    borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6,
  },
  toggleBtnActive: { backgroundColor: '#2D1F4A' },
  toggleText: { fontSize: fontSize.md, fontFamily: 'Inter_600SemiBold', color: '#9B8CB8' },
  toggleTextActive: { color: '#F5F3FF' },
  bestBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  bestBadgeText: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: colors.white, letterSpacing: 0.6 },

  priceCard: {
    backgroundColor: '#1A1030', borderRadius: radius.xl,
    padding: spacing.xxl, marginBottom: spacing.md,
    borderWidth: 1, borderColor: '#7C3AED44',
    alignItems: 'center',
  },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: spacing.sm },
  currency: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#9B8CB8', marginBottom: 8 },
  price: { fontSize: 56, fontFamily: 'Inter_800ExtraBold', color: '#F5F3FF', lineHeight: 64 },
  period: { fontSize: fontSize.lg, color: '#9B8CB8', marginBottom: 12 },
  planName: { fontSize: fontSize.xl, fontFamily: 'Inter_700Bold', color: colors.purGlow, marginBottom: 4 },
  planDesc: { fontSize: fontSize.sm, color: '#9B8CB8', textAlign: 'center', lineHeight: 20 },

  featureCard: {
    backgroundColor: '#1A1030', borderRadius: radius.xl,
    padding: spacing.xl, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: '#2D1F4A',
  },
  featureTitle: {
    fontSize: fontSize.xs, fontFamily: 'Inter_700Bold', color: '#9B8CB8',
    marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 1,
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  featureCheck: { fontSize: fontSize.md, color: colors.grn, fontFamily: 'Inter_700Bold', marginTop: 1 },
  featureText: { fontSize: fontSize.md, color: '#C4B5D8', flex: 1, lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#2D1F4A', marginVertical: spacing.md },
  comparedTo: { fontSize: fontSize.xs, color: '#9B8CB8', textAlign: 'center', fontFamily: 'Inter_500Medium' },

  freeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xxl, gap: 2 },
  freeLabel: { fontSize: fontSize.xs, color: '#9B8CB8', fontFamily: 'Inter_600SemiBold' },
  freeItems: { fontSize: fontSize.xs, color: '#6B5E8A' },

  ctaWrap: { borderRadius: radius.lg, overflow: 'hidden' },
  ctaBtn: {
    paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.lg,
  },
  ctaText: { fontSize: fontSize.lg, fontFamily: 'Inter_800ExtraBold', color: colors.white, letterSpacing: 0.3 },

  demoNote: {
    textAlign: 'center', fontSize: fontSize.xs, color: '#9B8CB8',
    marginTop: spacing.sm, fontFamily: 'Inter_500Medium',
  },
  legal: {
    textAlign: 'center', fontSize: fontSize.xs2, color: '#6B5E8A',
    marginTop: spacing.lg, lineHeight: 17,
  },

  successScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl,
  },
  successEmoji: { fontSize: 60, marginBottom: spacing.lg },
  successTitle: { fontSize: 30, fontFamily: 'Inter_800ExtraBold', color: '#F5F3FF', marginBottom: spacing.sm },
  successSub: { fontSize: fontSize.lg, color: '#9B8CB8', textAlign: 'center', lineHeight: 26 },
});
