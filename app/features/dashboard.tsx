import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { Label } from '../../src/components/ui/Label';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useScanStore } from '../../src/store/scanStore';
import { useProfileStore } from '../../src/store/profileStore';

type Filter = 'All' | 'Face' | 'Neck' | 'Body';

const FILTERS: Filter[] = ['All', 'Face', 'Neck', 'Body'];

const STATUS_COLOR: Record<string, string> = {
  improving: colors.grn,
  stable:    colors.teal,
  worsening: colors.red,
};

const STATUS_LABEL: Record<string, string> = {
  improving: 'Improving',
  stable:    'Stable',
  worsening: 'Worsening',
};

export default function DashboardScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const { scans } = useScanStore();
  const { glowScore, skinConcerns, fitzpatrick } = useProfileStore();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (scans.length === 0 || fetched.current) return;
    fetched.current = true;
    setInsightLoading(true);
    import('../../src/services/aiChat').then(({ sendChatMessage }) =>
      sendChatMessage(
        `I have ${scans.length} skin scan${scans.length > 1 ? 's' : ''} recorded. My Glow Score is ${glowScore ?? 'not yet measured'}/100. Primary concern: ${skinConcerns?.[0] ?? 'general skincare'}. Fitzpatrick: ${fitzpatrick ?? 'unknown'}. Give me a warm 1-2 sentence summary of my skin health status and the single most impactful thing I can do to improve.`,
        [],
        { glowScore, skinConcerns, fitzpatrick, scanCount: scans.length }
      )
    ).then(setAiInsight).catch(() => {}).finally(() => setInsightLoading(false));
  }, [scans.length]);

  // Group real scans by body area
  const groups = scans.reduce((acc: any[], scan) => {
    const area = scan.body_area || 'Unknown';
    const existing = acc.find(g => g.name.toLowerCase() === area.toLowerCase());
    
    if (existing) {
      existing.scanCount += 1;
      const scanDate = new Date(scan.created_at);
      const existingDate = new Date(existing.lastScanDate);
      if (scanDate > existingDate) {
        existing.lastScanDate = scan.created_at;
        existing.lastScan = new Date(scan.created_at).toLocaleDateString();
      }
    } else {
      acc.push({
        id: `group_${area}`,
        name: area.charAt(0).toUpperCase() + area.slice(1),
        scanCount: 1,
        status: 'stable',
        lastScan: new Date(scan.created_at).toLocaleDateString(),
        lastScanDate: scan.created_at,
        color: colors.pur,
        improvement: 0,
      });
    }
    return acc;
  }, []);

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || g.name.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Scans</Text>
        <TouchableOpacity onPress={() => router.push('/scan/mannequin')} style={styles.newBtn}>
          <LinearGradient colors={[...GRADIENT]} style={styles.newBtnGrad}>
            <Text style={styles.newBtnText}>+ New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search scans..."
          placeholderTextColor={colors.t4}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <Chip
            key={f}
            label={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            color={colors.pur}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filteredGroups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔬</Text>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>Start your first scan to build your skin history</Text>
            <GradientButton
              label="Start first scan →"
              onPress={() => router.push('/scan/mannequin')}
            />
          </View>
        ) : (
          <>
            <Label color={colors.t3}>Scan history</Label>
            {(insightLoading || aiInsight) && (
              <Card variant="tint" style={styles.aiCard}>
                <View style={styles.aiHeader}>
                  <LinearGradient colors={[...GRADIENT]} style={styles.aiIcon}>
                    <Text style={{ fontSize: 14 }}>🤖</Text>
                  </LinearGradient>
                  <Text style={styles.aiTitle}>SANO AI Insight</Text>
                  {insightLoading && <ActivityIndicator color={colors.pur} size="small" />}
                </View>
                <Text style={styles.aiText}>
                  {insightLoading ? 'Analysing your scan history…' : aiInsight}
                </Text>
              </Card>
            )}
            {filteredGroups.map(g => (
              <TouchableOpacity
                key={g.id}
                onPress={() => router.push('/features/compare')}
                activeOpacity={0.85}
              >
                <Card variant="white" style={styles.groupCard}>
                  <View style={styles.groupRow}>
                    <LinearGradient colors={[g.color, g.color]} style={styles.groupIcon}>
                      <Text style={{ fontSize: 18, color: colors.white }}>
                        {g.status === 'improving' ? '📉' : g.status === 'worsening' ? '📈' : '📊'}
                      </Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.groupArea}>{g.name}</Text>
                      <Text style={styles.groupCount}>{g.scanCount} scan{g.scanCount > 1 ? 's' : ''} · {g.lastScan}</Text>
                    </View>
                    <View style={styles.groupRight}>
                      <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[g.status]}18` }]}>
                        <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[g.status] }]} />
                        <Text style={[styles.statusText, { color: STATUS_COLOR[g.status] }]}>{STATUS_LABEL[g.status]}</Text>
                      </View>
                      <Text style={styles.groupDate}>{g.improvement}% improved</Text>
                    </View>
                  </View>
                  <View style={styles.groupActions}>
                    <TouchableOpacity
                      onPress={() => router.push('/features/compare')}
                      style={styles.groupAction}
                    >
                      <Text style={styles.groupActionText}>📊 View progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.groupAction}>
                      <Text style={styles.groupActionText}>📄 Export PDF</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Family profiles */}
        <View style={styles.familySection}>
          <Label color={colors.t3}>Family profiles</Label>
          <Card variant="tint" style={styles.familyCard}>
            <Text style={styles.familyTitle}>Track skin for your family</Text>
            <Text style={styles.familyText}>
              Add family members (kids, parents) and track their skin history separately.
            </Text>
            <TouchableOpacity style={styles.addFamilyBtn}>
              <LinearGradient colors={[...GRADIENT]} style={styles.addFamilyGrad}>
                <Text style={styles.addFamilyText}>+ Add family member</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>
        </View>

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
  newBtn: { borderRadius: radius.md, overflow: 'hidden' },
  newBtnGrad: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  newBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.sm },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.t1, paddingVertical: spacing.md },

  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  scroll: { padding: spacing.lg, gap: spacing.md },

  empty: {
    alignItems: 'center',
    paddingVertical: spacing.x4,
    gap: spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.xl2, fontWeight: fontWeight.bold, color: colors.t1 },
  emptyText: { fontSize: fontSize.md, color: colors.t3, textAlign: 'center' },

  groupCard: { gap: spacing.md },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupArea: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  groupCount: { fontSize: fontSize.sm, color: colors.t3 },
  groupRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  groupDate: { fontSize: fontSize.xs2, color: colors.t4 },
  groupActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bdr,
    paddingTop: spacing.sm,
  },
  groupAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  groupActionText: { fontSize: fontSize.sm, color: colors.pur, fontWeight: fontWeight.medium },

  aiCard: { gap: spacing.sm },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiIcon: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.t1, flex: 1 },
  aiText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  familySection: { gap: spacing.sm, marginTop: spacing.md },
  familyCard: { gap: spacing.md },
  familyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  familyText: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },
  addFamilyBtn: { borderRadius: radius.md, overflow: 'hidden', alignSelf: 'flex-start' },
  addFamilyGrad: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  addFamilyText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.sm },
});
