import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import { api } from '../../src/services/api';

interface Ingredient {
  name: string;
  purpose: string;
  rating: 'safe' | 'caution' | 'avoid';
  forDarkSkin?: string;
}

const MOCK_PRODUCT = {
  name: 'The Ordinary Niacinamide 10% + Zinc 1%',
  brand: 'The Ordinary',
  barcode: '769915191076',
  authentic: true,
  compatibility: 82,
  ingredients: [
    { name: 'Niacinamide',       purpose: 'Brightening, pore minimising',   rating: 'safe'    as const, forDarkSkin: 'Excellent for hyperpigmentation on dark skin' },
    { name: 'Zinc PCA',          purpose: 'Oil control, anti-inflammatory',  rating: 'safe'    as const },
    { name: 'Aqua (Water)',      purpose: 'Solvent',                         rating: 'safe'    as const },
    { name: 'Tamarind Seed',     purpose: 'Humectant',                       rating: 'safe'    as const },
    { name: 'Isomalt',           purpose: 'Humectant',                       rating: 'safe'    as const },
    { name: 'Phenoxyethanol',    purpose: 'Preservative',                    rating: 'caution' as const },
  ] as Ingredient[],
};

const RATING_COLOR = { safe: colors.grn, caution: colors.amber, avoid: colors.red };
const RATING_BG    = { safe: colors.grnLt, caution: colors.amberLt, avoid: colors.redLt };

export default function ProductScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState(false);
  const [product, setProduct] = useState<any>(MOCK_PRODUCT);
  const [loading, setLoading] = useState(false);
  const { logEvent } = useDataCollection();

  const handleCheck = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const response = await api.post('/ai/product', { name: search.trim() });
      setProduct(response.data.product);
      setChecked(true);
      logEvent('product_checked', { name: response.data.product.name });
    } catch (error) {
      console.error('Failed to check product:', error);
      setProduct(MOCK_PRODUCT);
      setChecked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Product Checker</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Search / scan */}
        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search product name or barcode..."
            placeholderTextColor={colors.t4}
            style={styles.searchInput}
          />
          <TouchableOpacity
            onPress={() => router.push('/scan/camera')}
            style={styles.scanIconBtn}
          >
            <LinearGradient colors={[...GRADIENT]} style={styles.scanIconGrad}>
              <Text style={{ fontSize: 18 }}>📷</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <GradientButton label="Check product" onPress={handleCheck} variant="primary" />

        {checked && (
          <>
            {/* Authenticity */}
            <Card variant="tint" style={styles.authCard}>
              <View style={styles.authRow}>
                <View style={styles.authBadge}>
                  <Text style={styles.authEmoji}>✅</Text>
                  <Text style={styles.authText}>Authentic product</Text>
                </View>
                <Text style={styles.barcode}>#{product.barcode}</Text>
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.brandName}>{product.brand}</Text>
            </Card>

            {/* Compatibility score */}
            <Card variant="white" style={styles.compatCard}>
              <View style={styles.compatRow}>
                <View>
                  <Label color={colors.pur}>Skin compatibility</Label>
                  <Text style={styles.compatScore}>{product.compatibility}%</Text>
                  <Text style={styles.compatSub}>for your skin profile</Text>
                </View>
                <View style={styles.compatRing}>
                  <Text style={styles.compatRingNum}>{product.compatibility}</Text>
                  <Text style={styles.compatRingLabel}>%</Text>
                </View>
              </View>
              <Text style={styles.compatNote}>
                ✨ Great for hyperpigmentation. Pair with SPF for best results on Fitzpatrick 4–6.
              </Text>
            </Card>

            {/* Ingredient analysis */}
            <Label color={colors.t3}>Ingredient analysis</Label>
            {product.ingredients.map((ing: any, i: number) => (
              <Card key={i} variant="white" style={styles.ingCard}>
                <View style={styles.ingRow}>
                  <View style={[styles.ingBadge, { backgroundColor: RATING_BG[ing.rating] }]}>
                    <Text style={[styles.ingRating, { color: RATING_COLOR[ing.rating] }]}>
                      {ing.rating.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ingName}>{ing.name}</Text>
                    <Text style={styles.ingPurpose}>{ing.purpose}</Text>
                    {ing.forDarkSkin && (
                      <Text style={styles.ingDarkSkin}>🌟 {ing.forDarkSkin}</Text>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}

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

  searchRow: { flexDirection: 'row', gap: spacing.sm },
  searchInput: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.t1,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  scanIconBtn: { borderRadius: radius.md, overflow: 'hidden' },
  scanIconGrad: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },

  authCard: { gap: spacing.sm },
  authRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  authEmoji: { fontSize: 18 },
  authText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.grn },
  barcode: { fontSize: fontSize.xs, color: colors.t4 },
  productName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  brandName: { fontSize: fontSize.sm, color: colors.t3 },

  compatCard: { gap: spacing.md },
  compatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compatScore: { fontSize: fontSize.xl5, fontWeight: fontWeight.extrabold, color: colors.pur },
  compatSub: { fontSize: fontSize.sm, color: colors.t3 },
  compatRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    borderColor: colors.purMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatRingNum: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.pur },
  compatRingLabel: { fontSize: fontSize.xs2, color: colors.t3 },
  compatNote: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },

  ingCard: { gap: spacing.xs },
  ingRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  ingBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs ?? 4,
    minWidth: 52,
    alignItems: 'center',
    marginTop: 2,
  },
  ingRating: { fontSize: fontSize.xs2, fontWeight: fontWeight.extrabold, letterSpacing: 0.5 },
  ingName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  ingPurpose: { fontSize: fontSize.sm, color: colors.t3 },
  ingDarkSkin: { fontSize: fontSize.xs, color: colors.pur, fontWeight: fontWeight.medium, marginTop: 2 },
});
