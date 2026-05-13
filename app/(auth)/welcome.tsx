import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius, shadows } from '../../src/theme';
import { authService } from '../../src/services/auth';
import { DEMO_MODE } from '../../src/config/firebase';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.52;

const FEATURES = [
  { emoji: '🔬', label: 'AI Skin Scan' },
  { emoji: '💄', label: 'Foundation Match' },
  { emoji: '🌙', label: 'Cycle Tracking' },
  { emoji: '💬', label: 'AI Chat' },
];

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
        stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke={colors.t2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 6l-10 7L2 6" stroke={colors.t2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SocialButton({
  icon, label, onPress, bg, textColor, border, loading,
}: {
  icon: React.ReactNode; label: string; onPress: () => void;
  bg: string; textColor: string; border?: boolean; loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
      style={[
        styles.socialBtn,
        { backgroundColor: bg },
        border && { borderWidth: 1, borderColor: colors.bdr },
      ]}
    >
      <View style={styles.socialIcon}>
        {loading ? <ActivityIndicator size="small" color={textColor} /> : icon}
      </View>
      <Text style={[styles.socialLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PhoneModal({ visible, onClose, onSuccess }: { visible: boolean; onClose: () => void; onSuccess: () => void }) {
  const [phone, setPhone] = useState('+233');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  const sendOTP = async () => {
    if (phone.length < 10) { Alert.alert('Enter a valid phone number'); return; }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        setConfirmation({ confirm: async () => ({ user: { uid: 'demo' } }) });
        setStep('otp');
        Alert.alert('Demo Mode', 'Use code: 123456');
      } else {
        const result = await authService.sendPhoneOTP(phone);
        setConfirmation(result);
        setStep('otp');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length < 6) { Alert.alert('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await authService.verifyPhoneOTP(confirmation, otp);
      onSuccess();
    } catch {
      Alert.alert('Invalid code', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{step === 'phone' ? 'Your number' : 'Enter code'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSub}>
          {step === 'phone'
            ? `We'll send a one-time code.${DEMO_MODE ? '\n(Demo: any number, code is 123456)' : ''}`
            : `Code sent to ${phone}`}
        </Text>
        <TextInput
          style={styles.input}
          value={step === 'phone' ? phone : otp}
          onChangeText={step === 'phone' ? setPhone : setOtp}
          keyboardType={step === 'phone' ? 'phone-pad' : 'number-pad'}
          placeholder={step === 'phone' ? '+233241234567' : '123456'}
          maxLength={step === 'otp' ? 6 : undefined}
          autoFocus
        />
        <GradientButton
          label={loading ? (step === 'phone' ? 'Sending…' : 'Verifying…') : (step === 'phone' ? 'Send code' : 'Verify')}
          onPress={step === 'phone' ? sendOTP : verifyOTP}
          variant="primary"
        />
      </SafeAreaView>
    </Modal>
  );
}

function EmailModal({ visible, onClose, onSuccess }: { visible: boolean; onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) { Alert.alert('Fill in both fields'); return; }
    setLoading(true);
    try {
      if (DEMO_MODE) { onSuccess(); return; }
      if (isRegister) {
        await authService.registerWithEmail(email, password);
      } else {
        await authService.signInWithEmail(email, password);
      }
      onSuccess();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isRegister ? 'Create account' : 'Sign in'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="your@email.com"
          autoFocus
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
        />
        <GradientButton
          label={loading ? 'Loading…' : isRegister ? 'Create account' : 'Sign in'}
          onPress={submit}
          variant="primary"
        />
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={{ marginTop: spacing.md }}>
          <Text style={styles.switchMode}>
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [phoneModal, setPhoneModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const goToOnboarding = () => router.replace('/(auth)/onboarding');

  const handleAuthSuccess = () => {
    setPhoneModal(false);
    setEmailModal(false);
    goToOnboarding();
  };

  const handleGoogle = async () => {
    if (DEMO_MODE) { goToOnboarding(); return; }
    Alert.alert(
      'Google Sign-In',
      'Add your Google OAuth client ID to enable this. Continue as demo?',
      [
        { text: 'Continue', onPress: goToOnboarding },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* ── Immersive hero ── */}
      <LinearGradient
        colors={[...GRADIENT]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.hero}
      >
        {/* Decorative orbs */}
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={styles.orb3} />

        {/* Wordmark */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)} style={styles.wordmarkWrap}>
          <Text style={styles.wordmark}>SANO</Text>
          <View style={styles.wordmarkDot} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(200).springify().damping(18)} style={styles.tagline}>
          Your skin. Your health.{'\n'}Your life.
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(300).springify().damping(18)} style={styles.subTagline}>
          Ghana's AI-powered skincare companion
        </Animated.Text>

        {/* Feature pills */}
        <Animated.View entering={FadeInDown.delay(400).springify().damping(18)} style={styles.featurePills}>
          {FEATURES.map(f => (
            <View key={f.label} style={styles.featurePill}>
              <Text style={styles.featurePillEmoji}>{f.emoji}</Text>
              <Text style={styles.featurePillLabel}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Bottom shimmer */}
        <View style={styles.heroShimmer} />
      </LinearGradient>

      {/* ── CTA section ── */}
      <ScrollView
        style={styles.ctaSheet}
        contentContainerStyle={styles.ctaContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View entering={FadeInUp.delay(300).springify().damping(20)} style={styles.ctaBlock}>
          <GradientButton label="Get started free  ✦" onPress={goToOnboarding} variant="primary" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify().damping(20)} style={styles.divRow}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>or continue with</Text>
          <View style={styles.divLine} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).springify().damping(20)} style={styles.socialsGrid}>
          <SocialButton
            icon={<GoogleIcon />}
            label="Google"
            onPress={handleGoogle}
            bg={colors.white}
            textColor={colors.t1}
            border
            loading={loadingGoogle}
          />
          <SocialButton
            icon={<Text style={{ fontSize: 16 }}>📘</Text>}
            label="Facebook"
            onPress={goToOnboarding}
            bg="#1877F2"
            textColor={colors.white}
          />
          <SocialButton
            icon={<PhoneIcon />}
            label="Phone"
            onPress={() => setPhoneModal(true)}
            bg="#25D366"
            textColor={colors.white}
          />
          <SocialButton
            icon={<MailIcon />}
            label="Email"
            onPress={() => setEmailModal(true)}
            bg={colors.bg3}
            textColor={colors.t1}
            border
          />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(600).springify().damping(20)} style={styles.privacy}>
          By continuing you agree to our Terms & Privacy Policy.{'\n'}
          Your data is never sold. Built in Ghana 🇬🇭
          {DEMO_MODE ? '\n\nDemo mode — no account required.' : ''}
        </Animated.Text>
      </ScrollView>

      <PhoneModal visible={phoneModal} onClose={() => setPhoneModal(false)} onSuccess={handleAuthSuccess} />
      <EmailModal visible={emailModal} onClose={() => setEmailModal(false)} onSuccess={handleAuthSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },

  // Hero
  hero: {
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.x4,
    overflow: 'hidden',
    position: 'relative',
  },
  orb1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -80, right: -60,
  },
  orb2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -50, left: -40,
  },
  orb3: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)', top: 60, left: 40,
  },
  heroShimmer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },

  wordmarkWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  wordmark: {
    fontSize: 56,
    fontFamily: 'Inter_800ExtraBold',
    color: colors.white,
    letterSpacing: 10,
  },
  wordmarkDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },

  tagline: {
    fontSize: fontSize.xl2,
    fontFamily: 'Inter_700Bold',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  subTagline: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },

  featurePills: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  featurePillEmoji: { fontSize: 14 },
  featurePillLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },

  // CTA sheet
  ctaSheet: { flex: 1, backgroundColor: colors.white },
  ctaContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  ctaBlock: {},

  divRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.bdr },
  divText: { fontSize: fontSize.xs, color: colors.t4, fontFamily: 'Inter_500Medium' },

  socialsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  socialBtn: {
    width: (width - spacing.xxl * 2 - spacing.sm) / 2,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.xs,
  },
  socialIcon: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  socialLabel: { fontSize: fontSize.sm, fontFamily: 'Inter_600SemiBold' },

  privacy: {
    fontSize: fontSize.xs,
    color: colors.t4,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },

  // Modal
  modal: { flex: 1, padding: spacing.xxl, gap: spacing.lg, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: fontSize.xl, fontFamily: 'Inter_700Bold', color: colors.t1 },
  modalClose: { fontSize: fontSize.md, color: colors.pur, fontFamily: 'Inter_600SemiBold' },
  modalSub: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },
  input: {
    borderWidth: 1, borderColor: colors.bdr, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.t1, backgroundColor: colors.bg2,
  },
  switchMode: { fontSize: fontSize.sm, color: colors.pur, textAlign: 'center', fontFamily: 'Inter_500Medium' },
});
