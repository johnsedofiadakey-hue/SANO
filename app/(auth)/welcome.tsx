import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { Chip } from '../../src/components/ui/Chip';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';

const { width } = Dimensions.get('window');

const FEATURES = [
  { label: '🔬 AI Scan',          desc: 'Diagnose your skin in seconds' },
  { label: '💄 Foundation Match', desc: 'Find your exact shade' },
  { label: '🌙 Cycle Tracking',   desc: 'Predict skin changes' },
  { label: '💬 AI Chat',          desc: 'Your 24/7 skin expert' },
];

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
  bg,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  bg: string;
  textColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.socialBtn, { backgroundColor: bg }]}
    >
      <View style={styles.socialIcon}>{icon}</View>
      <Text style={[styles.socialLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  const goToOnboarding = () => router.push('/(auth)/onboarding');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero gradient banner */}
        <LinearGradient
          colors={[...GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <Text style={styles.logo}>SANO</Text>
          <Text style={styles.tagline}>Your skin. Your health. Your life.</Text>
          <Text style={styles.subTagline}>Ghana's AI-powered skincare companion</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Feature chips */}
          <View style={styles.chipsRow}>
            {FEATURES.map(f => (
              <View key={f.label} style={styles.featureChip}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.ctaBlock}>
            <GradientButton
              label="Get started free ✦"
              onPress={goToOnboarding}
              variant="primary"
            />
          </View>

          {/* Social logins */}
          <View style={styles.divRow}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or continue with</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.socials}>
            <SocialButton
              icon={<GoogleIcon />}
              label="Google"
              onPress={goToOnboarding}
              bg={colors.white}
              textColor={colors.t1}
            />
            <SocialButton
              icon={<Text style={{ fontSize: 18 }}>📘</Text>}
              label="Facebook"
              onPress={goToOnboarding}
              bg="#1877F2"
              textColor={colors.white}
            />
            <SocialButton
              icon={<Text style={{ fontSize: 18 }}>💬</Text>}
              label="WhatsApp"
              onPress={goToOnboarding}
              bg="#25D366"
              textColor={colors.white}
            />
            <SocialButton
              icon={<Text style={{ fontSize: 18 }}>✉️</Text>}
              label="Email"
              onPress={goToOnboarding}
              bg={colors.bg3}
              textColor={colors.t1}
            />
          </View>

          <Text style={styles.privacy}>
            By continuing you agree to our Terms & Privacy Policy.{'\n'}
            Your data is never sold. Built in Ghana 🇬🇭
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flexGrow: 1,
  },
  heroBanner: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -40,
    left: -40,
  },
  logo: {
    fontSize: 52,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: fontSize.xl2,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subTagline: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    padding: spacing.xxl,
    gap: spacing.xxl,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bdr,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: (width - spacing.xxl * 2 - spacing.sm) / 2,
  },
  featureLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.t1,
  },
  featureDesc: {
    fontSize: fontSize.xs,
    color: colors.t3,
    marginTop: 2,
  },
  ctaBlock: {
    gap: spacing.md,
  },
  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.bdr,
  },
  divText: {
    fontSize: fontSize.xs,
    color: colors.t3,
    fontWeight: fontWeight.medium,
  },
  socials: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.bdr,
  },
  socialIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    fontSize: fontSize.xs2,
    fontWeight: fontWeight.semibold,
  },
  privacy: {
    fontSize: fontSize.xs,
    color: colors.t4,
    textAlign: 'center',
    lineHeight: 18,
  },
});
