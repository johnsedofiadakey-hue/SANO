import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { Card } from '../../src/components/ui/Card';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { communityService } from '../../src/services/community';
import { useAuthStore } from '../../src/store/authStore';
import { useProfileStore } from '../../src/store/profileStore';

const SUGGESTED_TAGS = ['hyperpigmentation', 'acne', 'spf', 'routine', 'razor_bumps', 'eczema', 'pih', 'progress'];

export default function NewPostScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { name, fitzpatrick } = useProfileStore();

  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(0, 4),
    );
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      Alert.alert('Too short', 'Please write at least 10 characters.');
      return;
    }
    if (trimmed.length > 500) {
      Alert.alert('Too long', 'Posts are limited to 500 characters.');
      return;
    }
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to post.');
      return;
    }

    setSubmitting(true);
    try {
      const authorName = name?.split(' ')[0] ?? 'Anonymous';
      await communityService.createPost(
        user.uid,
        authorName,
        trimmed,
        selectedTags,
        fitzpatrick ?? undefined,
      );
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Could not post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = 500 - text.length;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 55 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Card variant="white" style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Share your skin journey, tip, or question…"
              placeholderTextColor={colors.t4}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              textAlignVertical="top"
              autoFocus
            />
            <Text style={[styles.charCount, remaining < 50 && { color: colors.red }]}>
              {remaining} characters remaining
            </Text>
          </Card>

          <Text style={styles.sectionLabel}>Add tags (optional)</Text>
          <View style={styles.tagsWrap}>
            {SUGGESTED_TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                >
                  <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card variant="tint" style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Community guidelines</Text>
            <Text style={styles.guidelinesText}>
              Be kind and supportive. No medical advice. No spam or promotional content. Posts with violations will be removed.
            </Text>
          </Card>

          <GradientButton
            label={submitting ? 'Posting…' : 'Share with community 💜'}
            onPress={handleSubmit}
            variant="primary"
            disabled={submitting || text.trim().length < 10}
          />
        </ScrollView>
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
  cancel: { fontSize: fontSize.md, color: colors.t3 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },

  scroll: { padding: spacing.lg, gap: spacing.lg },

  inputCard: { gap: spacing.sm },
  input: {
    fontSize: fontSize.md,
    color: colors.t1,
    lineHeight: 24,
    minHeight: 120,
    fontFamily: 'Inter_400Regular',
  },
  charCount: { fontSize: fontSize.xs, color: colors.t4, textAlign: 'right' },

  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.t2 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.purMid,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  tagChipActive: { backgroundColor: colors.pur, borderColor: colors.pur },
  tagChipText: { fontSize: fontSize.sm, color: colors.pur, fontWeight: fontWeight.medium },
  tagChipTextActive: { color: colors.white },

  guidelines: { gap: spacing.xs },
  guidelinesTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.t2 },
  guidelinesText: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },
});
