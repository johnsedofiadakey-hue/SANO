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
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { Label } from '../../src/components/ui/Label';
import { Avatar } from '../../src/components/ui/Avatar';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius, shadows } from '../../src/theme';
import { MOCK_COMMUNITY_POSTS } from '../../src/data/mockData';

const { width } = Dimensions.get('window');

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
  id:          p.id,
  user:        p.user.name,
  location:    p.user.location,
  condition:   p.tag,
  duration:    p.timeAgo,
  emoji:       TAG_EMOJI[p.tag] ?? TAG_EMOJI.default,
  improvement: p.likes > 150 ? 62 : p.likes > 100 ? 45 : 30,
  likes:       p.likes,
  comments:    p.comments,
  caption:     p.text,
}));

function HeartIcon({ liked }: { liked: boolean }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill={liked ? colors.pink : 'none'}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke={liked ? colors.pink : colors.t3}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PostCard({ post, delay }: { post: typeof POSTS[0]; delay: number }) {
  const [liked, setLiked] = useState(false);
  const likeCount = post.likes + (liked ? 1 : 0);

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(20)}>
      <Card variant="white" style={styles.postCard} elevated>
        {/* User header */}
        <View style={styles.postHeader}>
          <Avatar name={post.user} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.postUser}>{post.user}</Text>
            <Text style={styles.postLocation}>📍 {post.location}</Text>
          </View>
          <View style={styles.conditionTag}>
            <Text style={styles.conditionTagText}>{post.condition}</Text>
          </View>
        </View>

        {/* Before / After panels */}
        <View style={styles.panelsRow}>
          <View style={[styles.panel, styles.panelBefore]}>
            <Text style={styles.panelEmoji}>😟</Text>
            <Text style={[styles.panelLabel, { color: colors.t3 }]}>Before</Text>
          </View>

          <View style={styles.panelCenter}>
            <LinearGradient colors={[...GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.improveBadge}>
              <Text style={styles.improveText}>+{post.improvement}%</Text>
            </LinearGradient>
          </View>

          <LinearGradient colors={[...GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.panel, styles.panelAfter]}>
            <Text style={styles.panelEmoji}>{post.emoji}</Text>
            <Text style={[styles.panelLabel, { color: 'rgba(255,255,255,0.85)' }]}>After {post.duration}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.caption}>{post.caption}</Text>

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction} onPress={() => setLiked(l => !l)} activeOpacity={0.7}>
            <HeartIcon liked={liked} />
            <Text style={[styles.postActionText, liked && { color: colors.pink }]}>{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction} activeOpacity={0.7}>
            <Text style={styles.postActionText}>💬  {post.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction} activeOpacity={0.7}>
            <Text style={styles.postActionText}>📤  Share</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );
}

export default function CommunityScreen() {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = POSTS.filter(p =>
    filter === 'All' || p.condition.toLowerCase() === filter.toLowerCase()
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.sub}>Real results from real people 🌍</Text>
        </Animated.View>

        {/* ── Challenge banner ── */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(20)}>
          <GradientCard style={styles.challengeCard}>
            <View style={styles.challengeTop}>
              <View style={styles.challengeLive}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.challengeParticipants}>847 members</Text>
            </View>
            <Label color="rgba(255,255,255,0.55)">This week's challenge</Label>
            <Text style={styles.challengeTitle}>7-Day SPF Challenge</Text>
            <Text style={styles.challengeText}>
              Apply SPF every morning for 7 days and share your before photo.
            </Text>
            <TouchableOpacity style={styles.joinBtn} activeOpacity={0.85}>
              <View style={styles.joinBtnInner}>
                <Text style={styles.joinBtnText}>Join challenge  →</Text>
              </View>
            </TouchableOpacity>
          </GradientCard>
        </Animated.View>

        {/* ── Filters ── */}
        <Animated.View entering={FadeInDown.delay(160).springify().damping(20)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map(f => (
              <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} color={colors.pur} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Posts ── */}
        <Label color={colors.t3}>Glow-up stories</Label>
        {filtered.map((post, i) => (
          <PostCard key={post.id} post={post} delay={200 + i * 60} />
        ))}

        {/* Tab bar padding */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.t1 },
  sub: { fontSize: fontSize.md, color: colors.t3, marginTop: 2 },

  // Challenge
  challengeCard: { gap: spacing.sm },
  challengeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeLive: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  liveText: { fontSize: fontSize.xs2, fontFamily: 'Inter_700Bold', color: '#4ADE80', letterSpacing: 1 },
  challengeParticipants: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium' },
  challengeTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  challengeText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.78)', lineHeight: 20 },
  joinBtn: { alignSelf: 'flex-start' },
  joinBtnInner: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  joinBtnText: { color: colors.white, fontFamily: 'Inter_700Bold', fontSize: fontSize.md },

  filterRow: { gap: spacing.sm, paddingBottom: spacing.xs },

  // Post card
  postCard: { gap: spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postUser: { fontSize: fontSize.md, fontFamily: 'Inter_700Bold', color: colors.t1 },
  postLocation: { fontSize: fontSize.xs, color: colors.t3, marginTop: 1 },
  conditionTag: {
    backgroundColor: colors.purMid, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  conditionTagText: { fontSize: fontSize.xs2, color: colors.pur, fontFamily: 'Inter_700Bold' },

  panelsRow: { flexDirection: 'row', height: 110, borderRadius: radius.lg, overflow: 'hidden', gap: 2 },
  panel: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  panelBefore: { backgroundColor: colors.bg3 },
  panelAfter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  panelCenter: { width: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg3 },
  improveBadge: { paddingHorizontal: spacing.xs, paddingVertical: 5, borderRadius: radius.sm },
  improveText: { color: colors.white, fontSize: fontSize.xs2, fontFamily: 'Inter_800ExtraBold' },
  panelEmoji: { fontSize: 28 },
  panelLabel: { fontSize: fontSize.xs, fontFamily: 'Inter_600SemiBold' },

  caption: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  postActions: {
    flexDirection: 'row', gap: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.bdr, paddingTop: spacing.sm,
  },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  postActionText: { fontSize: fontSize.sm, color: colors.t3, fontFamily: 'Inter_500Medium' },
});
