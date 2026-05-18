import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, fontSize, fontWeight, radius, shadows, GRADIENT } from '../../src/theme';
import { communityService, type CommunityPost, type PostReply } from '../../src/services/community';
import { useAuthStore } from '../../src/store/authStore';
import { useProfileStore } from '../../src/store/profileStore';
import { LinearGradient } from 'expo-linear-gradient';

const FITZPATRICK_COLORS = ['#F5DEB3', '#D2A679', '#C68642', '#A0522D', '#7B3F00', '#3B1A08'];

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function PostDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const postId = params.id ?? '';

  const { user } = useAuthStore();
  const { name } = useProfileStore();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<PostReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const uid = user?.uid ?? 'demo';

  useEffect(() => {
    Promise.all([
      communityService.getPost(postId),
      communityService.fetchReplies(postId),
    ]).then(([p, r]) => {
      setPost(p);
      setReplies(r);
    }).finally(() => setLoading(false));
  }, [postId]);

  const handleLike = useCallback(async () => {
    if (!post || !user) return;
    const liked = !post.likedBy.includes(uid);
    setPost(prev => prev ? {
      ...prev,
      likeCount: prev.likeCount + (liked ? 1 : -1),
      likedBy: liked ? [...prev.likedBy, uid] : prev.likedBy.filter(id => id !== uid),
    } : prev);
    await communityService.toggleLike(postId, uid, liked);
  }, [post, uid, user, postId]);

  const handleFlag = useCallback(() => {
    Alert.alert('Report post', 'Are you sure you want to report this post for review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          await communityService.flagPost(postId, uid);
          Alert.alert('Reported', 'Thank you. Our team will review this post.');
        },
      },
    ]);
  }, [postId, uid]);

  const handleReply = useCallback(async () => {
    const trimmed = replyText.trim();
    if (trimmed.length < 2 || !user) return;
    setSubmitting(true);
    try {
      const authorName = name?.split(' ')[0] ?? 'Anonymous';
      await communityService.addReply(postId, uid, authorName, trimmed);
      setReplyText('');
      const updated = await communityService.fetchReplies(postId);
      setReplies(updated);
      setPost(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev);
    } catch {
      Alert.alert('Error', 'Could not post reply. Try again.');
    } finally {
      setSubmitting(false);
    }
  }, [replyText, user, postId, uid, name]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.pur} style={{ marginTop: spacing.xxxl }} />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.errorText}>Post not found.</Text>
      </SafeAreaView>
    );
  }

  const liked = post.likedBy.includes(uid);
  const fitz = post.authorFitzpatrick ?? 5;
  const skinColor = FITZPATRICK_COLORS[Math.min(fitz - 1, 5)];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <TouchableOpacity onPress={handleFlag}>
            <Text style={styles.flagBtn}>⚑</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={replies}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
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

              <Text style={styles.postText}>{post.text}</Text>

              {post.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {post.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.likeRow} onPress={handleLike}>
                <Text style={styles.likeIcon}>{liked ? '💜' : '🤍'}</Text>
                <Text style={[styles.likeCount, liked && { color: colors.pur }]}>
                  {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.repliesLabel}>
                {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <View style={styles.replyCard}>
              <View style={[styles.replyAvatar, { backgroundColor: FITZPATRICK_COLORS[4] }]}>
                <Text style={styles.avatarText}>{item.authorName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyAuthor}>{item.authorName}</Text>
                  <Text style={styles.replyTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.replyText}>{item.text}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.noReplies}>No replies yet. Be the first!</Text>
          }
        />

        <View style={styles.replyBar}>
          <TextInput
            style={styles.replyInput}
            placeholder="Add a reply…"
            placeholderTextColor={colors.t4}
            value={replyText}
            onChangeText={setReplyText}
            maxLength={300}
            multiline
          />
          <TouchableOpacity
            onPress={handleReply}
            disabled={replyText.trim().length < 2 || submitting}
          >
            <LinearGradient
              colors={replyText.trim().length >= 2 ? [...GRADIENT] : ['#C4B8D8', '#C4B8D8']}
              style={styles.sendBtn}
            >
              {submitting
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.sendText}>Send</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

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
  flagBtn: { fontSize: 18, color: colors.t4 },

  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
  errorText: { textAlign: 'center', marginTop: spacing.xl, color: colors.t3 },

  postCard: { gap: spacing.sm, padding: spacing.lg, ...shadows.xs },
  postHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  authorName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.t1 },
  timestamp: { fontSize: fontSize.xs, color: colors.t4 },
  postText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: colors.purMid,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: { fontSize: fontSize.xs, color: colors.pur, fontWeight: fontWeight.medium },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  likeIcon: { fontSize: 18 },
  likeCount: { fontSize: fontSize.md, color: colors.t3, fontWeight: fontWeight.medium },
  repliesLabel: { fontSize: fontSize.sm, color: colors.t3, fontWeight: fontWeight.medium },

  replyCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bdr,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  replyContent: { flex: 1, gap: 2 },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  replyAuthor: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.t1 },
  replyTime: { fontSize: fontSize.xs, color: colors.t4 },
  replyText: { fontSize: fontSize.sm, color: colors.t2, lineHeight: 20 },
  noReplies: { textAlign: 'center', color: colors.t4, paddingVertical: spacing.xl },

  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bdr,
    backgroundColor: colors.white,
  },
  replyInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.t1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});
