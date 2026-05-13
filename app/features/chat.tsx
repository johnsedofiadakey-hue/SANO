import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useScanStore } from '../../src/store/scanStore';
import { useProfileStore } from '../../src/store/profileStore';
import { useCycleStore } from '../../src/store/cycleStore';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import { DEMO_MODE, demoChatReply } from '../../src/services/demoMode';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function getQuickReplies(conditionName?: string): string[] {
  const name = (conditionName ?? '').toLowerCase();
  if (name.includes('hyperpigment') || name.includes('dark spot')) {
    return [
      'Why does it get worse in summer?',
      'Best products for dark spots?',
      'How long to see results?',
      'Does Vitamin C help?',
    ];
  }
  if (name.includes('acne') || name.includes('breakout')) {
    return [
      'What triggers breakouts?',
      'Niacinamide or Salicylic acid?',
      'Should I pop pimples?',
      'Best routine for acne-prone skin?',
    ];
  }
  if (name.includes('eczema') || name.includes('dermatitis')) {
    return [
      'What soothes eczema flares?',
      'Best moisturiser for eczema?',
      'Are steroids safe long-term?',
      'What triggers my flares?',
    ];
  }
  if (name.includes('razor') || name.includes('bump')) {
    return [
      'How to prevent razor bumps?',
      'Best shaving technique?',
      'Chemical vs blade exfoliation?',
      'How to treat existing bumps?',
    ];
  }
  return [
    'What causes hyperpigmentation?',
    'Best SPF for dark skin?',
    'Morning vs evening routine?',
    'How to fade dark spots?',
  ];
}

const GREETING: Message = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm SANO AI. I've reviewed your recent scan and cycle data. I can help with your skincare questions, product recommendations, and routine advice. What's on your mind?",
  timestamp: new Date(),
};

function TypingDot({ delay }: { delay: number }) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return <Animated.View style={[styles.typingDot, style]} />;
}

function TypingIndicator() {
  return (
    <View style={[styles.msgRow, styles.msgRowAI]}>
      <LinearGradient colors={[...GRADIENT]} style={styles.aiBubbleAvatar}>
        <Text style={{ fontSize: 12 }}>🤖</Text>
      </LinearGradient>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const { currentResult, scans } = useScanStore();
  const { fitzpatrick, skinConcerns, glowScore, name: userName } = useProfileStore();
  const { currentCycleDay, currentPhase } = useCycleStore();
  const { logEvent } = useDataCollection();

  const topCondition = currentResult?.conditions?.[0]?.name;
  const quickReplies = getQuickReplies(topCondition);

  useEffect(() => {
    logEvent('feature_opened', { feature: 'chat' });
  }, [logEvent]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    scrollToBottom();

    await logEvent('chat_message_sent', { hasContext: !!currentResult });

    try {
      let reply: string;

      if (DEMO_MODE) {
        reply = await demoChatReply(text.trim());
      } else {
        // Try real API; fall back to local matcher if unavailable
        try {
          const { api } = await import('../../src/services/api');
          const userContext = {
            userName: userName || 'User',
            fitzpatrick: fitzpatrick ?? null,
            skinConcerns,
            glowScore,
            cycleDay: currentCycleDay,
            cyclePhase: currentPhase,
            latestScan: currentResult
              ? {
                  condition: currentResult.conditions[0]?.name ?? null,
                  severity: currentResult.conditions[0]?.severity ?? 0,
                  confidence: currentResult.conditions[0]?.confidence ?? 0,
                }
              : null,
            scanCount: scans.length,
          };
          const { data } = await api.post<{ response: string }>('/ai/chat', {
            message: text.trim(),
            history: messages.map(msg => ({ me: msg.role === 'user', txt: msg.content })),
            userContext,
          });
          reply = data.response;
        } catch (e: any) {
          reply = `Error: Failed to connect to AI service. (${e.message || 'Unknown error'})`;
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }, [isTyping, currentResult, logEvent, scrollToBottom]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient colors={[...GRADIENT]} style={styles.aiAvatar}>
            <Text style={styles.aiAvatarEmoji}>🤖</Text>
          </LinearGradient>
          <View>
            <Text style={styles.aiName}>SANO AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>
        {currentResult && (
          <View style={styles.contextBadge}>
            <Text style={styles.contextText}>Scan context</Text>
          </View>
        )}
      </View>

      {currentResult && (
        <View style={styles.contextBanner}>
          <Text style={styles.contextBannerText}>
            📊 Using your latest scan + cycle data for personalised advice
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.msgRow,
                msg.role === 'user' ? styles.msgRowUser : styles.msgRowAI,
              ]}
            >
              {msg.role === 'assistant' && (
                <LinearGradient colors={[...GRADIENT]} style={styles.aiBubbleAvatar}>
                  <Text style={{ fontSize: 12 }}>🤖</Text>
                </LinearGradient>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
                ]}
              >
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && <TypingIndicator />}

          {messages.length === 1 && !isTyping && (
            <View style={styles.quickReplies}>
              <Text style={styles.quickLabel}>QUICK QUESTIONS</Text>
              <View style={styles.quickGrid}>
                {quickReplies.map(q => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => sendMessage(q)}
                    style={styles.quickChip}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickChipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask SANO anything..."
            placeholderTextColor={colors.t4}
            style={styles.textInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={input.trim() && !isTyping ? [...GRADIENT] : ['#C4B8D8', '#C4B8D8']}
              style={styles.sendBtn}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarEmoji: { fontSize: 18 },
  aiName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.t1 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.grn },
  onlineText: { fontSize: fontSize.xs2, color: colors.grn },
  contextBadge: {
    backgroundColor: colors.purMid,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  contextText: { fontSize: fontSize.xs2, color: colors.pur, fontWeight: fontWeight.bold },

  contextBanner: {
    backgroundColor: colors.bg3,
    padding: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bdr,
  },
  contextBannerText: { fontSize: fontSize.xs, color: colors.t2, fontWeight: fontWeight.medium },

  messagesScroll: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },

  msgRow: { flexDirection: 'row', gap: spacing.sm, maxWidth: '88%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowAI: { alignSelf: 'flex-start' },
  aiBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  bubble: {
    borderRadius: radius.lg,
    padding: spacing.md,
    maxWidth: '90%',
  },
  bubbleUser: { backgroundColor: colors.pur },
  bubbleAI: {
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  bubbleText: { fontSize: fontSize.md, color: colors.t2, lineHeight: 22 },
  bubbleTextUser: { color: colors.white },

  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.t3,
  },

  quickReplies: { gap: spacing.sm, marginTop: spacing.md },
  quickLabel: {
    fontSize: fontSize.xs,
    color: colors.t4,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  quickChipText: { fontSize: fontSize.sm, color: colors.t2, fontWeight: fontWeight.medium },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.bdr,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.t1,
    borderWidth: 1,
    borderColor: colors.bdr,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: colors.white, fontSize: 18, fontWeight: fontWeight.bold },
});
