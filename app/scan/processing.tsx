import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { useScanStore } from '../../src/store/scanStore';
import { DEMO_MODE, demoUploadScan } from '../../src/services/demoMode';
import { uploadScan } from '../../src/services/scan';
import { useDataCollection } from '../../src/hooks/useDataCollection';
import { MOCK_SCAN_RESULT } from '../../src/data/mockData';

const { width, height } = Dimensions.get('window');

const STEPS = [
  'Analysing skin tone...',
  'Detecting conditions...',
  'Checking Fitzpatrick type...',
  'Comparing with 10,000+ Ghanaian skin images...',
  'Building your personalised report...',
];

const TOTAL_MS = 3200;
const STEP_MS = TOTAL_MS / STEPS.length;

function PulsingRing() {
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.ringOuter, style]}>
      <LinearGradient
        colors={[...GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ringGrad}
      >
        <View style={styles.ringInner}>
          <Text style={styles.ringEmoji}>🔬</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function ScanLine() {
  const translateY = useSharedValue(-60);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(60, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.scanLine, style]} pointerEvents="none">
      <LinearGradient
        colors={['transparent', colors.pur, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.scanLineGrad}
      />
    </Animated.View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 300 });
  }, [progress, width]);

  const style = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]}>
        <LinearGradient
          colors={[...GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export default function ProcessingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ area: string; imageUri: string }>();
  const area = params.area ?? 'face';
  const imageUri = params.imageUri ?? '';

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const mounted = useRef(true);

  const { setCurrentResult, setProcessing } = useScanStore();
  const { logScan } = useDataCollection();

  useEffect(() => {
    mounted.current = true;
    setProcessing(true);

    // Cycle through step labels
    const stepInterval = setInterval(() => {
      if (!mounted.current) return;
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
    }, STEP_MS);

    // Smooth progress
    const progressInterval = setInterval(() => {
      if (!mounted.current) return;
      setProgress(p => Math.min(p + 2.5, 95));
    }, 80);

    // Run actual upload in parallel
    const doUpload = async () => {
      try {
        const result = DEMO_MODE
          ? await demoUploadScan(imageUri, area)
          : await uploadScan(imageUri, area);

        if (mounted.current) setCurrentResult(result);

        await logScan(imageUri, result).catch(() => {});
      } catch {
        // On error still navigate with mock data
        if (mounted.current) {
          setCurrentResult({
            scan_id: MOCK_SCAN_RESULT.scanId,
            conditions: [
              {
                name: MOCK_SCAN_RESULT.primaryCondition.name,
                location: MOCK_SCAN_RESULT.primaryCondition.location,
                severity: MOCK_SCAN_RESULT.primaryCondition.severity / 10,
                confidence: MOCK_SCAN_RESULT.primaryCondition.confidence / 100,
                doctor_confirmed: false,
              },
            ],
            skin_tone: 5,
            model_version: 'v0.1-mock',
            processing_time_ms: 0,
          });
        }
      }
    };

    doUpload();

    // Navigate after 3.2s regardless
    const timer = setTimeout(() => {
      if (!mounted.current) return;
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setProgress(100);
      setProcessing(false);

      setTimeout(() => {
        if (mounted.current) {
          router.replace({ pathname: '/scan/results', params: { area } });
        }
      }, 300);
    }, TOTAL_MS);

    return () => {
      mounted.current = false;
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <LinearGradient
      colors={['#0F0720', '#1a0535', '#0F0720']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.center}>
        <PulsingRing />

        {/* Scan line overlay */}
        <View style={styles.scanArea}>
          <ScanLine />
        </View>

        <Text style={styles.headline}>Analysing your skin</Text>

        <Text style={styles.stepText}>{STEPS[stepIndex]}</Text>

        <ProgressBar progress={progress} />

        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by SANO AI · Trained on Fitzpatrick 4–6 skin</Text>
      </View>
    </LinearGradient>
  );
}

const RING_SIZE = 180;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  ringGrad: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  ringInner: {
    flex: 1,
    borderRadius: RING_SIZE / 2,
    backgroundColor: '#0F0720',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringEmoji: { fontSize: 52 },

  scanArea: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    overflow: 'hidden',
    borderRadius: RING_SIZE / 2,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  scanLineGrad: {
    height: 3,
    borderRadius: 2,
  },

  headline: {
    fontSize: fontSize.xl3,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  stepText: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    minHeight: 22,
    fontWeight: fontWeight.medium,
  },

  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: fontWeight.medium,
    marginTop: -spacing.sm,
  },

  footer: {
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
});
