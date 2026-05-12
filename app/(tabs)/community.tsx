import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { Label } from '../../src/components/ui/Label';
import { Avatar } from '../../src/components/ui/Avatar';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { MOCK_COMMUNITY_POSTS } from '../../src/data/mockData';

type Filter = 'All' | 'Hyperpigmentation' | 'Acne' | 'Razor Bumps' | 'Eczema';
const FILTERS: Filter[] = ['All', 'Hyperpigmentation', 'Acne', 'Razor Bumps', 'Eczema'];

const TAG_EMOJI: Record<string, string> = {
  Hyperpigmentation: '✨',
  'Razor Bumps':     '💪',
  'Foundation Match':'💄',
  Acne:              '🌟',
  default:           '💜',
};

const POSTS = MOCK_COMMUNITY_POSTS.map(p => ({
  id:         p.id,
  user:       p.user.name,
  location:   p.user.location,
  condition:  p.tag,
  duration:   p.timeAgo,
  emoji:      TAG_EMOJI[p.tag] ?? TAG_EMOJI.default,
  improvement: p.likes > 150 ? 62 : p.likes > 100 ? 45 : 30,
  likes:      p.likes,
  comments:   p.comments,
  caption:    p.text,
}));

export default function CommunityScreen() {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = POSTS.filter(p =>
    filter === 'All' || p.condition.toLowerCase() === filter.toLowerCase()
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.sub}>Real results from real people 🌍</Text>

        {/* Challenge banner */}
        <GradientCard style={styles.challengeCard}>
          <Label color="rgba(255,255,255,0.6)">This week's challenge</Label>
          <Text style={styles.challengeTitle}>7-Day SPF Challenge</Text>
          <Text style={styles.challengeText}>
            Apply SPF every morning for 7 days and share your before photo. 847 members participating.
          </Text>
          <TouchableOpacity style={styles.joinBtn}>
            <View style={styles.joinBtnInner}>
              <Text style={styles.joinBtnText}>Join challenge →</Text>
            </View>
          </TouchableOpacity>
        </GradientCard>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} color={colors.pur} />
          ))}
        </ScrollView>

        {/* Posts */}
        <Label color={colors.t3}>Glow-up stories</Label>
        {filtered.map(post => (
          <Card key={post.id} variant="white" style={styles.postCard}>
            {/* User header */}
            <View style={styles.postHeader}>
              <Avatar name={post.user} size={38} />
              <View style={{ flex: 1 }}>
                <Text style={styles.postUser}>{post.user}</Text>
                <Text style={styles.postLocation}>📍 {post.location}</Text>
              </View>
              <View style={styles.conditionTag}>
                <Text style={styles.conditionTagText}>{post.condition}</Text>
              </View>
            </View>

            {/* Before/after panels */}
            <View style={styles.panelsRow}>
              <View style={[styles.panel, styles.panelBefore]}>
                <Text style={styles.panelEmoji}>😟</Text>
                <Text style={styles.panelLabel}>Before</Text>
              </View>
              <View style={styles.panelDivider}>
                <LinearGradient colors={[...GRADIENT]} style={styles.arrowBadge}>
                  <Text style={styles.arrowText}>+{post.improvement}%</Text>
                </LinearGradient>
              </View>
              <View style={[styles.panel, styles.panelAfter]}>
                <Text style={styles.panelEmoji}>{post.emoji}</Text>
                <Text style={[styles.panelLabel, { color: colors.white }]}>After {post.duration}</Text>
              </View>
            </View>

            <Text style={styles.caption}>{post.caption}</Text>

            {/* Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postAction}>
                <Text style={styles.postActionText}>❤️ {post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Text style={styles.postActionText}>💬 {post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Text style={styles.postActionText}>📤 Share</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.t1 },
  sub: { fontSize: fontSize.md, color: colors.t3, marginTop: -spacing.md },

  challengeCard: { gap: spacing.md },
  challengeTitle: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  challengeText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  joinBtn: { alignSelf: 'flex-start' },
  joinBtnInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  joinBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.md },

  filterRow: { gap: spacing.sm, paddingBottom: spacing.xs },

  postCard: { gap: spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postUser: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  postLocation: { fontSize: fontSize.xs, color: colors.t3 },
  conditionTag: {
    backgroundColor: colors.purMid,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  conditionTagText: { fontSize: fontSize.xs, color: colors.pur, fontWeight: fontWeight.bold },

  panelsRow: { flexDirection: 'row', height: 100, borderRadius: radius.md, overflow: 'hidden' },
  panel: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  panelBefore: { backgroundColor: colors.bg3 },
  panelAfter: { backgroundColor: colors.pur },
  panelEmoji: { fontSize: 28 },
  panelLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.t2 },
  panelDivider: { width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg3, zIndex: 1 },
  arrowBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  arrowText: { color: colors.white, fontSize: fontSize.xs2, fontWeight: fontWeight.extrabold },

  caption: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  postActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bdr,
    paddingTop: spacing.sm,
  },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },
});
