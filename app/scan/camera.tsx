import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Rect, Path } from 'react-native-svg';
import { colors, overlay, GRADIENT, GRADIENT_DISABLED, spacing, fontSize, fontWeight, radius } from '../../src/theme';
import { BODY_ZONES } from '../../src/components/ui/BodyMannequin';
import type { BodyZone } from '../../src/components/ui/BodyMannequin';

const { width, height } = Dimensions.get('window');

function GuideOverlay({ area }: { area: BodyZone }) {
  if (area === 'face') {
    return (
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {/* Semi-transparent mask with face oval cutout */}
        <Rect x={0} y={0} width={width} height={height} fill="rgba(0,0,0,0)" />
        <Ellipse
          cx={width / 2}
          cy={height / 2 - 40}
          rx={110}
          ry={145}
          stroke={colors.purGlow}
          strokeWidth={2.5}
          strokeDasharray="8,6"
          fill="none"
        />
      </Svg>
    );
  }
  return null;
}

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ area: string }>();
  const area = (params.area ?? 'face') as BodyZone;

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const areaLabel = BODY_ZONES[area]?.label ?? area;

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo) return;

      // Navigate to processing screen — it handles the upload
      router.replace({
        pathname: '/scan/processing',
        params: { area, imageUri: photo.uri },
      });
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return <View style={styles.loading}><ActivityIndicator color={colors.pur} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permSub}>SANO needs camera access to analyse your skin</Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permBtn}
        >
          <LinearGradient colors={[...GRADIENT]} style={styles.permBtnGrad}>
            <Text style={styles.permBtnText}>Allow Camera →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
      />

      <GuideOverlay area={area} />

      {/* Top label */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={[...GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.areaLabel}
        >
          <Text style={styles.areaLabelText}>Scanning: {areaLabel}</Text>
        </LinearGradient>
        <TouchableOpacity onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')} style={styles.flashBtn}>
          <Text style={styles.flashText}>{flash === 'on' ? '⚡️' : '🔦'}</Text>
        </TouchableOpacity>
      </View>

      {/* Corner accents */}
      <View pointerEvents="none" style={[styles.corner, styles.cornerTL]} />
      <View pointerEvents="none" style={[styles.corner, styles.cornerTR, { borderTopColor: colors.pink, borderRightColor: colors.pink }]} />
      <View pointerEvents="none" style={[styles.corner, styles.cornerBL, { borderBottomColor: colors.pink, borderLeftColor: colors.pink }]} />
      <View pointerEvents="none" style={[styles.corner, styles.cornerBR]} />

      {/* Hint text */}
      <Text style={styles.hint}>
        {area === 'face'
          ? 'Center your face in the oval. Keep still.'
          : `Position your ${areaLabel.toLowerCase()} in the frame.`}
      </Text>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {/* Capture button */}
        <TouchableOpacity
          onPress={handleCapture}
          disabled={isCapturing}
          activeOpacity={0.85}
          style={styles.captureOuter}
        >
          <LinearGradient
            colors={isCapturing ? [...GRADIENT_DISABLED] : [...GRADIENT]}
            style={styles.captureBtn}
          >
            {isCapturing ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cam },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cam },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  permTitle: { fontSize: fontSize.xl2, fontWeight: fontWeight.bold, color: colors.t1, textAlign: 'center' },
  permSub: { fontSize: fontSize.md, color: colors.t3, textAlign: 'center' },
  permBtn: { width: '100%', borderRadius: radius.lg, overflow: 'hidden' },
  permBtnGrad: { padding: spacing.lg, alignItems: 'center' },
  permBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.lg },

  topOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: overlay.black40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: colors.white, fontSize: 16, fontWeight: fontWeight.bold },
  areaLabel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  areaLabelText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  flashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: overlay.black40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashText: { fontSize: 18 },

  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.pur,
    borderWidth: CORNER_WIDTH,
  },
  cornerTL: { top: '25%', left: '15%', borderBottomWidth: 0, borderRightWidth: 0 },
  cornerTR: { top: '25%', right: '15%', borderBottomWidth: 0, borderLeftWidth: 0 },
  cornerBL: { bottom: '30%', left: '15%', borderTopWidth: 0, borderRightWidth: 0 },
  cornerBR: { bottom: '30%', right: '15%', borderTopWidth: 0, borderLeftWidth: 0, borderColor: colors.pink },

  hint: {
    position: 'absolute',
    bottom: '28%',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: overlay.white80,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureOuter: {
    shadowColor: colors.pur,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
    borderRadius: 40,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  captureInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
});
