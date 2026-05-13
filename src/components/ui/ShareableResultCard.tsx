import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';

interface ShareableResultCardProps {
  conditionName: string;
  severity: number;       // 0–10
  confidence: number;     // 0–100
  bodyArea: string;
  glowScore: number;
  improving?: boolean;
  weekNumber?: number;
  userName?: string;
  fitzpatrick?: number;
}

function MiniRing({ value, max = 10 }: { value: number; max?: number }) {
  const pct = value / max;
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <View style={{ width: size, height: size }}>
      {/* Simple ring using border — no SVG dependency here so card captures cleanly */}
      <View
        style={[
          styles.ringBg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: 'rgba(255,255,255,0.2)',
          },
        ]}
      />
      <View style={styles.ringCenter}>
        <Text style={styles.ringValue}>{value.toFixed(1)}</Text>
        <Text style={styles.ringMax}>/10</Text>
      </View>
    </View>
  );
}

export function ShareableResultCard({
  conditionName,
  severity,
  confidence,
  bodyArea,
  glowScore,
  improving = true,
  weekNumber = 1,
  userName: propUserName,
  fitzpatrick,
}: ShareableResultCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shotRef = useRef<any>(null);

  const firebaseUser = useAuthStore((state) => state.user);
  const userName = propUserName || firebaseUser?.displayName || 'SANO User';

  const handleShare = useCallback(async () => {
    try {
      const uri = await (shotRef.current as unknown as { capture: () => Promise<string> }).capture();
      await Share.share({
        url: uri,
        message: 'My skin report from SANO 💜\nDownload free: getsano.com',
        title: 'My SANO Skin Report',
      });
    } catch {
      // Fallback: text-only share
      await Share.share({
        message: `My SANO skin scan: ${conditionName} on ${bodyArea}, severity ${severity}/10. Glow Score: ${glowScore}. Download SANO free: getsano.com 💜`,
      });
    }
  }, [conditionName, bodyArea, severity, glowScore]);

  return (
    <>
      {/* Off-screen capture target */}
      <ViewShot
        ref={shotRef}
        options={{ format: 'png', quality: 1.0 }}
        style={styles.captureWrapper}
      >
        <LinearGradient
          colors={[...GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative circles */}
          <View style={[styles.deco, styles.decoTR]} />
          <View style={[styles.deco, styles.decoBL]} />

          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.logoText}>SANO</Text>
            <Text style={styles.reportLabel}>Your Skin Report</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Glow score section */}
          <View style={styles.glowSection}>
            <Text style={styles.glowLabel}>GLOW SCORE</Text>
            <View style={styles.glowRow}>
              <View style={styles.glowCircle}>
                <Text style={styles.glowNum}>{glowScore}</Text>
                <Text style={styles.glowSub}>/ 100</Text>
              </View>
              <View style={styles.glowRight}>
                <Text style={styles.glowTrend}>↑ +6 this week</Text>
                <Text style={styles.glowName}>{userName}</Text>
                {fitzpatrick && (
                  <Text style={styles.glowFitz}>Fitzpatrick Type {fitzpatrick}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Primary finding */}
          <View style={styles.findingSection}>
            <Text style={styles.findingLabel}>PRIMARY FINDING</Text>
            <Text style={styles.findingName}>{conditionName}</Text>
            <Text style={styles.findingArea}>{bodyArea}</Text>

            {/* Severity bar */}
            <View style={styles.sevRow}>
              <Text style={styles.sevLabel}>Severity</Text>
              <Text style={styles.sevValue}>{severity.toFixed(1)}/10</Text>
            </View>
            <View style={styles.sevTrack}>
              <View
                style={[styles.sevFill, { width: `${(severity / 10) * 100}%`, backgroundColor: 'rgba(255,255,255,0.9)' }]}
              />
            </View>

            {improving && (
              <View style={styles.improvingChip}>
                <Text style={styles.improvingText}>✓ Improving — Week {weekNumber} of routine</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerLeft}>💜 Powered by SANO</Text>
            <Text style={styles.footerRight}>getsano.com · Download free</Text>
          </View>
        </LinearGradient>
      </ViewShot>

      {/* Visible trigger button */}
      <TouchableOpacity onPress={handleShare} activeOpacity={0.85} style={styles.shareBtn}>
        <LinearGradient
          colors={['#25D366', '#128C7E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareBtnGrad}
        >
          <Text style={styles.shareBtnText}>📤 Share to WhatsApp</Text>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  captureWrapper: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    width: 360,
  },
  card: {
    width: 360,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  deco: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decoTR: { width: 160, height: 160, top: -50, right: -50 },
  decoBL: { width: 100, height: 100, bottom: -30, left: -30 },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    letterSpacing: 4,
  },
  reportLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  glowSection: { gap: spacing.md },
  glowLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
  },
  glowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  glowCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowNum: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  glowSub: { fontSize: fontSize.xs2, color: 'rgba(255,255,255,0.6)' },
  glowRight: { gap: 4 },
  glowTrend: { fontSize: fontSize.sm, color: '#4ADE80', fontWeight: fontWeight.bold },
  glowName: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.white },
  glowFitz: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.65)' },

  findingSection: { gap: spacing.sm },
  findingLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
  },
  findingName: { fontSize: fontSize.xl2, fontWeight: fontWeight.extrabold, color: colors.white },
  findingArea: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.65)', textTransform: 'capitalize' },
  sevRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  sevLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)' },
  sevValue: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.white },
  sevTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sevFill: { height: '100%', borderRadius: 4 },
  improvingChip: {
    backgroundColor: 'rgba(74,222,128,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.4)',
    marginTop: spacing.xs,
  },
  improvingText: { fontSize: fontSize.xs, color: '#4ADE80', fontWeight: fontWeight.bold },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)' },
  footerRight: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' },

  ringBg: { position: 'absolute' },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontSize: fontSize.md, fontWeight: fontWeight.extrabold, color: colors.white },
  ringMax: { fontSize: fontSize.xs2, color: 'rgba(255,255,255,0.6)' },

  shareBtn: { borderRadius: radius.lg, overflow: 'hidden', width: '100%' },
  shareBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  shareBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.lg },
});
