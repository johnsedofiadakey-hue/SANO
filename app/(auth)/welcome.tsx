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
import Svg, { Path } from 'react-native-svg';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { authService } from '../../src/services/auth';
import { DEMO_MODE } from '../../src/config/firebase';

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
  icon, label, onPress, bg, textColor, loading,
}: {
  icon: React.ReactNode; label: string; onPress: () => void;
  bg: string; textColor: string; loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
      style={[styles.socialBtn, { backgroundColor: bg, opacity: loading ? 0.7 : 1 }]}
    >
      <View style={styles.socialIcon}>
        {loading ? <ActivityIndicator size="small" color={textColor} /> : icon}
      </View>
      <Text style={[styles.socialLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Phone OTP modal
function PhoneModal({
  visible, onClose, onSuccess,
}: {
  visible: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [phone, setPhone] = useState('+233');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  const sendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo mode: skip Firebase, go straight to OTP step
        setConfirmation({ confirm: async (code: string) => ({ user: { uid: 'demo' } }) });
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
    if (otp.length < 6) {
      Alert.alert('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyPhoneOTP(confirmation, otp);
      onSuccess();
    } catch (e: any) {
      Alert.alert('Invalid code', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{step === 'phone' ? 'Enter your number' : 'Verify OTP'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {step === 'phone' ? (
          <>
            <Text style={styles.modalSub}>
              We'll send a one-time code to verify your number.{'\n'}
              {DEMO_MODE && '(Demo: any number works, code is 123456)'}
            </Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+233241234567"
              autoFocus
            />
            <GradientButton
              label={loading ? 'Sending…' : 'Send code'}
              onPress={sendOTP}
              variant="primary"
            />
          </>
        ) : (
          <>
            <Text style={styles.modalSub}>Enter the 6-digit code sent to {phone}</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              autoFocus
            />
            <GradientButton
              label={loading ? 'Verifying…' : 'Verify'}
              onPress={verifyOTP}
              variant="primary"
            />
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Email modal
function EmailModal({
  visible, onClose, onSuccess,
}: {
  visible: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      Alert.alert('Fill in both fields');
      return;
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        onSuccess();
        return;
      }
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
    // Check if onboarding complete — for now always go to onboarding
    goToOnboarding();
  };

  const handleGoogle = async () => {
    if (DEMO_MODE) {
      goToOnboarding();
      return;
    }
    // Google sign-in requires expo-auth-session + Google OAuth client ID
    // For now: show info and fall through to onboarding
    Alert.alert(
      'Google Sign-In',
      'To enable Google sign-in, add your Google OAuth client ID to the Firebase console and install expo-auth-session.',
      [
        { text: 'Continue as demo', onPress: goToOnboarding },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero */}
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
            <GradientButton label="Get started free ✦" onPress={goToOnboarding} variant="primary" />
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
              onPress={handleGoogle}
              bg={colors.white}
              textColor={colors.t1}
              loading={loadingGoogle}
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
              label="Phone"
              onPress={() => setPhoneModal(true)}
              bg="#25D366"
              textColor={colors.white}
            />
            <SocialButton
              icon={<Text style={{ fontSize: 18 }}>✉️</Text>}
              label="Email"
              onPress={() => setEmailModal(true)}
              bg={colors.bg3}
              textColor={colors.t1}
            />
          </View>

          <Text style={styles.privacy}>
            By continuing you agree to our Terms & Privacy Policy.{'\n'}
            Your data is never sold. Built in Ghana 🇬🇭
            {DEMO_MODE ? '\n\nRunning in demo mode — no account required.' : ''}
          </Text>
        </View>
      </ScrollView>

      <PhoneModal visible={phoneModal} onClose={() => setPhoneModal(false)} onSuccess={handleAuthSuccess} />
      <EmailModal visible={emailModal} onClose={() => setEmailModal(false)} onSuccess={handleAuthSuccess} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1 },
  heroBanner: {
    paddingTop: 60, paddingBottom: 50, paddingHorizontal: spacing.xxl,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
  },
  circle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -60,
  },
  circle2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -40,
  },
  logo: { fontSize: 52, fontWeight: fontWeight.extrabold, color: colors.white, letterSpacing: 8 },
  tagline: { fontSize: fontSize.xl2, fontWeight: fontWeight.bold, color: colors.white, marginTop: spacing.sm, textAlign: 'center' },
  subTagline: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.75)', marginTop: spacing.sm, textAlign: 'center' },
  body: { flex: 1, padding: spacing.xxl, gap: spacing.xxl },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  featureChip: {
    backgroundColor: colors.bg2, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.bdr,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    width: (width - spacing.xxl * 2 - spacing.sm) / 2,
  },
  featureLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.t1 },
  featureDesc: { fontSize: fontSize.xs, color: colors.t3, marginTop: 2 },
  ctaBlock: { gap: spacing.md },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.bdr },
  divText: { fontSize: fontSize.xs, color: colors.t3, fontWeight: fontWeight.medium },
  socials: { flexDirection: 'row', gap: spacing.sm },
  socialBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.bdr },
  socialIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  socialLabel: { fontSize: fontSize.xs2, fontWeight: fontWeight.semibold },
  privacy: { fontSize: fontSize.xs, color: colors.t4, textAlign: 'center', lineHeight: 18 },
  // Modal
  modal: { flex: 1, padding: spacing.xxl, gap: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.t1 },
  modalClose: { fontSize: fontSize.md, color: colors.pur, fontWeight: fontWeight.semibold },
  modalSub: { fontSize: fontSize.sm, color: colors.t3, lineHeight: 20 },
  input: {
    borderWidth: 1, borderColor: colors.bdr, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.t1, backgroundColor: colors.bg2,
  },
  switchMode: { fontSize: fontSize.sm, color: colors.pur, textAlign: 'center' },
});
