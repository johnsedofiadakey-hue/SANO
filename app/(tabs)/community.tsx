import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { Card } from '../../src/components/ui/Card';
import { Label } from '../../src/components/ui/Label';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(20)}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.sub}>Real results from real people 🌍</Text>
        </Animated.View>

        {/* ── Hero "Coming Soon" Card ── */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(20)}>
          <GradientCard style={styles.heroCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>
            <Text style={styles.heroTitle}>A safe space for your skin journey</Text>
            <Text style={styles.heroText}>
              We are building a supportive community where you can connect with others, share your glow-up stories, and learn from people with similar skin profiles.
            </Text>
            
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
              <View style={styles.actionBtnInner}>
                <Text style={styles.actionBtnText}>Notify me when active 🔔</Text>
              </View>
            </TouchableOpacity>
          </GradientCard>
        </Animated.View>

        {/* ── Features Preview ── */}
        <Label color={colors.t3}>What to expect</Label>
        
        <Animated.View entering={FadeInDown.delay(160).springify().damping(20)}>
          <Card variant="white" style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🤝</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Connect & Share</Text>
              <Text style={styles.featureDesc}>Share your routine and progress with others navigating similar skin concerns in Ghana.</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).springify().damping(20)}>
          <Card variant="white" style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔬</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Dermatologist Q&A</Text>
              <Text style={styles.featureDesc}>Get direct answers to your questions from verified local dermatologists.</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).springify().damping(20)}>
          <Card variant="white" style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🏆</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Skincare Challenges</Text>
              <Text style={styles.featureDesc}>Join weekly challenges to build healthy habits like consistent SPF use.</Text>
            </View>
          </Card>
        </Animated.View>

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

  // Hero Card
  heroCard: { gap: spacing.md, padding: spacing.xl },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: { color: colors.white, fontSize: fontSize.xs2, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  heroTitle: { fontSize: fontSize.xl2, fontFamily: 'Inter_800ExtraBold', color: colors.white },
  heroText: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  
  actionBtn: { alignSelf: 'flex-start', marginTop: spacing.xs },
  actionBtnInner: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: { color: colors.pur, fontFamily: 'Inter_700Bold', fontSize: fontSize.md },

  // Feature Cards
  featureCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.lg },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  icon: { fontSize: 24 },
  featureContent: { flex: 1, gap: 4 },
  featureTitle: { fontSize: fontSize.md, fontFamily: 'Inter_700Bold', color: colors.t1 },
  featureDesc: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },
});
