import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../src/components/ui/Card';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius, shadows } from '../../src/theme';
import { communityService, type CommunityPost } from '../../src/services/community';
import { useAuthStore } from '../../src/store/authStore';
import { useProfileStore } from '../../src/store/profileStore';

const FITZPATRICK_COLORS = ['#F5DEB3', '#D2A679', '#C68642', '#A0522D', '#7B3F00', '#3B1A08'];

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function PostCard({ post, currentUid, onLike, onPress }: {
  post: CommunityPost;
  currentUid: string;
  onLike: (id: string, liked: boolean) => void;
  onPress: (id: string) => void;
}) {
  const liked = post.likedBy.includes(currentUid);
  const fitz = post.authorFitzpatrick ?? 5;
  const skinColor = FITZPATRICK_COLORS[Math.min(fitz - 1, 5)];

  return (
    <TouchableOpacity onPress={() => onPress(post.id)} activeOpacity={0.85}>
      <Card variant="white" style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={[styles.avatar, { backgroundColor: skinColor }]}>
            <Text style={styles.avatarText}>{post.authorName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Text style={styles.timestamp}>{timeAgo(post.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.postText} numberOfLines={4}>{post.text}</Text>

        {post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onLike(post.id, !liked)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.actionIcon, liked && styles.likedIcon]}>
              {liked ? '💜' : '🤍'}
            </Text>
            <Text style={[styles.actionCount, liked && { color: colors.pur }]}>
              {post.likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onPress(post.id)}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{post.replyCount}</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { name } = useProfileStore();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<any>(null);

  const uid = user?.uid ?? 'demo';

  const loadPosts = useCallback(async (reset = false) => {
    try {
      const { posts: newPosts, nextCursor } = await communityService.fetchPosts(
        reset ? undefined : cursorRef.current,
      );
      cursorRef.current = nextCursor;
      setHasMore(nextCursor !== null);
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
    } catch (e) {
      console.error('Community fetch failed:', e);
    }
  }, []);

  useEffect(() => {
    loadPosts(true).finally(() => setLoading(false));
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    cursorRef.current = null;
    await loadPosts(true);
    setRefreshing(false);
  }, [loadPosts]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadPosts(false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, loadPosts]);

  const handleLike = useCallback(async (postId: string, liked: boolean) => {
    if (!user) {
      Alert.alert('Sign in required', 'Create a free account to like posts.');
      return;
    }
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            likeCount: p.likeCount + (liked ? 1 : -1),
            likedBy: liked
              ? [...p.likedBy, uid]
              : p.likedBy.filter(id => id !== uid),
          }
        : p,
    ));
    await communityService.toggleLike(postId, uid, liked);
  }, [user, uid]);

  const handlePostPress = useCallback((postId: string) => {
    router.push(`/community/post?id=${postId}`);
  }, [router]);

  const ListHeader = (
    <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.sub}>Real results from real people in Ghana 🌍</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/community/new-post')}
          style={styles.newPostBtn}
        >
          <LinearGradient colors={[...GRADIENT]} style={styles.newPostGrad}>
            <Text style={styles.newPostText}>+ Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const ListFooter = loadingMore ? (
    <ActivityIndicator color={colors.pur} style={{ marginVertical: spacing.lg }} />
  ) : null;

  const ListEmpty = !loading ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Be the first to post</Text>
      <Text style={styles.emptyText}>Share your skin journey and help others in the community.</Text>
      <GradientButton
        label="Share your story"
        onPress={() => router.push('/community/new-post')}
        variant="primary"
        style={{ marginTop: spacing.lg }}
      />
    </View>
  ) : null;

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
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30).springify().damping(22)}>
            <PostCard
              post={item}
              currentUid={uid}
              onLike={handleLike}
              onPress={handlePostPress}
            />
          </Animated.View>
        )}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pur} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.t1 },
  sub: { fontSize: fontSize.sm, color: colors.t3, marginTop: 2 },

  newPostBtn: { borderRadius: radius.full, overflow: 'hidden' },
  newPostGrad: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  newPostText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  postCard: { gap: spacing.sm, padding: spacing.lg, ...shadows.xs },
  postHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  authorName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  timestamp: { fontSize: fontSize.xs, color: colors.t4 },

  postText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: colors.purMid,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: { fontSize: fontSize.xs, color: colors.pur, fontWeight: fontWeight.medium },

  postActions: { flexDirection: 'row', gap: spacing.lg, paddingTop: spacing.xs },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 16 },
  likedIcon: {},
  actionCount: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.t1 },
  emptyText: { fontSize: fontSize.md, color: colors.t3, textAlign: 'center', lineHeight: 22 },
});
