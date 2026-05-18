import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanResultCard } from '../../src/components/ui/ScanResultCard';
import { ShareableResultCard } from '../../src/components/ui/ShareableResultCard';
import { Card } from '../../src/components/ui/Card';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { SeverityBar } from '../../src/components/ui/SeverityBar';
import { Label } from '../../src/components/ui/Label';
import { Chip } from '../../src/components/ui/Chip';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useScanStore } from '../../src/store/scanStore';
import { useProfileStore } from '../../src/store/profileStore';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import { BODY_ZONES } from '../../src/components/ui/BodyMannequin';
import type { BodyZone } from '../../src/components/ui/BodyMannequin';

const WHAT_HELPS: Record<string, string[]> = {
  hyperpigmentation: ['Vitamin C serum', 'Niacinamide 10%', 'Kojic acid', 'SPF 50+ daily'],
  acne: ['Salicylic acid cleanser', 'Benzoyl peroxide', 'Retinol (PM)', 'Tea tree oil'],
  razor_bumps: ['Single-blade razor', 'Shave with grain', 'Glycolic acid toner', 'Aloe vera'],
  default: ['Consistent routine', 'Hydration', 'SPF daily', 'Gentle cleanser'],
};

const WHAT_AVOID: Record<string, string[]> = {
  hyperpigmentation: ['Sun without SPF', 'Harsh scrubs', 'Picking at skin', 'Alcohol toners'],
  acne: ['Heavy oils', 'Dairy overload', 'Over-washing', 'Popping pimples'],
  razor_bumps: ['Multi-blade razors', 'Shaving dry', 'Tight clothing', 'Fragrance products'],
  default: ['Skipping SPF', 'Hot water', 'Fragrance overload'],
};

const ACCRA_PRODUCTS: Record<string, { name: string; store: string; price: string }[]> = {
  hyperpigmentation: [
    { name: 'L\'Oreal Vitamin C Serum', store: 'Ernest Chemists', price: 'GHS 85' },
    { name: 'Neutrogena SPF 50', store: 'Melcom', price: 'GHS 65' },
  ],
  acne: [
    { name: 'CeraVe SA Cleanser', store: 'Ernest Chemists', price: 'GHS 120' },
    { name: 'Differin Gel (0.1%)', store: 'Vivo Pharmacy', price: 'GHS 90' },
  ],
  default: [
    { name: 'Cetaphil Gentle Cleanser', store: 'Ernest Chemists', price: 'GHS 75' },
    { name: 'Nivea SPF 30', store: 'Any pharmacy', price: 'GHS 45' },
  ],
};

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ area: string }>();
  const area = (params.area ?? 'face') as BodyZone;

  const { currentResult, isProcessing } = useScanStore();
  const { glowScore } = useProfileStore();
  const { logEvent } = useDataCollection();

  React.useEffect(() => {
    logEvent('result_viewed', { area });
  }, [area, logEvent]);

  if (isProcessing || !currentResult) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <LinearGradient colors={[...GRADIENT]} style={styles.loadingGrad}>
          <ActivityIndicator color={colors.white} size="large" />
          <Text style={styles.loadingText}>Analysing your skin...</Text>
          <Text style={styles.loadingSubText}>Powered by SANO AI</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const topCondition = currentResult.conditions[0];
  if (!topCondition) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Text style={styles.errorText}>No conditions detected. Try again with better lighting.</Text>
        <GradientButton label="Try again" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const conditionKey = topCondition.name.toLowerCase().replace(' ', '_') as keyof typeof WHAT_HELPS;
  const helps = WHAT_HELPS[conditionKey] ?? WHAT_HELPS.default;
  const avoids = WHAT_AVOID[conditionKey] ?? WHAT_AVOID.default;
  const products = ACCRA_PRODUCTS[conditionKey] ?? ACCRA_PRODUCTS.default;
  const areaLabel = BODY_ZONES[area]?.label ?? area;

  const handleShare = async () => {
    await logEvent('result_shared', { condition: topCondition.name, area });
    await Share.share({
      message: `My SANO skin scan found ${topCondition.name} on my ${areaLabel} with ${Math.round(topCondition.severity * 100)}% severity. Check out SANO — Ghana's AI skincare app! 💜`,
      title: 'My SANO Skin Scan',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backBtn}>
          <Text style={styles.backText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Results</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Shareable result card */}
        <ScanResultCard
          condition={topCondition}
          bodyArea={areaLabel}
          date={new Date().toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
        />

        {/* Multiple conditions */}
        {currentResult.conditions.length > 1 && (
          <>
            <Label color={colors.t3}>All conditions detected</Label>
            {currentResult.conditions.map((c, i) => (
              <Card key={i} variant="tint" style={styles.conditionRow}>
                <View style={styles.conditionHeader}>
                  <Text style={styles.conditionName}>{c.name}</Text>
                  <Text style={styles.conditionLoc}>{c.location}</Text>
                </View>
                <SeverityBar label="Severity" value={c.severity} />
              </Card>
            ))}
          </>
        )}

        {/* AI Explanation */}
        <Card variant="tint" style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <LinearGradient colors={[...GRADIENT]} style={styles.aiIcon}>
              <Text style={{ fontSize: 16 }}>🤖</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Label color={colors.teal}>AI Analysis</Label>
              <Text style={styles.aiTitle}>What SANO sees</Text>
            </View>
          </View>
          <Text style={styles.aiText}>
            The analysis suggests potential {topCondition.name} on your {areaLabel.toLowerCase()} with{' '}
            {Math.round(topCondition.severity * 100)}% severity. This is commonly observed in Fitzpatrick
            types 4–6. Consider consulting a dermatologist for a professional evaluation.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/features/chat')}
            style={styles.askAIChip}
          >
            <LinearGradient colors={[...GRADIENT]} style={styles.askAIGrad}>
              <Text style={styles.askAIText}>Ask AI a follow-up →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Card>

        {/* What helps */}
        <Card variant="white" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoEmoji}>✅</Text>
            <Text style={[styles.infoTitle, { color: colors.grn }]}>What helps</Text>
          </View>
          <View style={styles.itemsList}>
            {helps.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={[styles.itemDot, { backgroundColor: colors.grn }]} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* What to avoid */}
        <Card variant="white" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoEmoji}>🚫</Text>
            <Text style={[styles.infoTitle, { color: colors.red }]}>What to avoid</Text>
          </View>
          <View style={styles.itemsList}>
            {avoids.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={[styles.itemDot, { backgroundColor: colors.red }]} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Products in Accra */}
        <View>
          <Label color={colors.t3} style={styles.productsLabel}>Available in Accra</Label>
          {products.map((p, i) => (
            <Card key={i} variant="tint" style={styles.productCard}>
              <View style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productStore}>📍 {p.store}</Text>
                </View>
                <Text style={styles.productPrice}>{p.price}</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GradientButton
            label="💾 Save to My Scans"
            onPress={() => router.push('/features/dashboard')}
            variant="primary"
          />
          {/* Shareable image card + WhatsApp share */}
          <ShareableResultCard
            conditionName={topCondition.name}
            severity={topCondition.severity * 10}
            confidence={topCondition.confidence * 100}
            bodyArea={areaLabel}
            glowScore={glowScore}
            improving
            weekNumber={3}
          />
          <TouchableOpacity onPress={() => {}} style={styles.pdfLink} disabled>
            <Text style={[styles.pdfLinkText, { color: colors.t4 }]}>PDF report · coming soon</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Disclaimer */}
        <Card variant="tint" style={[styles.infoCard, { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', gap: spacing.sm }]}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoEmoji}>⚠️</Text>
            <Text style={[styles.infoTitle, { color: colors.red }]}>Medical Disclaimer</Text>
          </View>
          <Text style={[styles.itemText, { fontSize: fontSize.sm, color: colors.t2 }]}>
            SANO is an AI-powered educational tool and does NOT provide medical diagnoses. The results shown are suggestions based on image analysis and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.
          </Text>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  loadingGrad: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  loadingText: { color: colors.white, fontSize: fontSize.xl2, fontWeight: fontWeight.bold },
  loadingSubText: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.md },
  errorText: { fontSize: fontSize.md, color: colors.t2, textAlign: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bdr,
  },
  backBtn: {},
  backText: { fontSize: fontSize.md, color: colors.t3, fontWeight: fontWeight.medium },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  shareText: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.bold },

  scroll: { padding: spacing.lg, gap: spacing.lg },

  conditionRow: { gap: spacing.sm },
  conditionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conditionName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1, textTransform: 'capitalize' },
  conditionLoc: { fontSize: fontSize.sm, color: colors.t3, textTransform: 'capitalize' },

  aiCard: { gap: spacing.md },
  aiHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  aiText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  askAIChip: { borderRadius: radius.full, overflow: 'hidden', alignSelf: 'flex-start' },
  askAIGrad: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  askAIText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  infoCard: { gap: spacing.md },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoEmoji: { fontSize: 20 },
  infoTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  itemsList: { gap: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  itemDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  itemText: { flex: 1, fontSize: fontSize.md, color: colors.t2, lineHeight: 20 },

  productsLabel: { marginBottom: spacing.sm },
  productCard: { marginBottom: spacing.sm },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  productStore: { fontSize: fontSize.sm, color: colors.t3 },
  productPrice: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.pur },

  actions: { gap: spacing.sm },
  pdfLink: { alignItems: 'center', paddingVertical: spacing.sm },
  pdfLinkText: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },
});
