import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientCard } from './GradientCard';
import { GradientRing } from './GradientRing';
import { SeverityBar } from './SeverityBar';
import { colors, spacing, fontSize, fontWeight, radius } from '../../theme';
import type { ScanCondition } from '../../types/scan';

interface ScanResultCardProps {
  condition: ScanCondition;
  bodyArea: string;
  date?: string;
}

export function ScanResultCard({ condition, bodyArea, date }: ScanResultCardProps) {
  const severityLabel =
    condition.severity < 0.33 ? 'Mild' :
    condition.severity < 0.66 ? 'Moderate' : 'Severe';

  return (
    <GradientCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.label}>SANO SKIN SCAN</Text>
          <Text style={styles.condition}>{condition.name}</Text>
          <Text style={styles.area}>{bodyArea}</Text>
          {date && <Text style={styles.date}>{date}</Text>}
        </View>
        <View style={styles.ringWrapper}>
          <GradientRing
            progress={condition.severity}
            size={88}
            strokeWidth={8}
            gradientStart="#FFFFFF"
            gradientEnd="rgba(255,255,255,0.4)"
            trackColor="rgba(255,255,255,0.15)"
          />
          <View style={styles.ringCenter}>
            <Text style={styles.ringScore}>{Math.round(condition.severity * 100)}</Text>
            <Text style={styles.ringLabel}>{severityLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bars}>
        <SeverityBar label="Severity" value={condition.severity} />
        <SeverityBar label="Confidence" value={condition.confidence} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>your skin. your health. your life.</Text>
        <Text style={styles.brand}>SANO</Text>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
  },
  condition: {
    fontSize: fontSize.xl2,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    textTransform: 'capitalize',
  },
  area: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: fontSize.xs2,
    color: 'rgba(255,255,255,0.5)',
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringScore: {
    fontSize: fontSize.xl3,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
  },
  ringLabel: {
    fontSize: fontSize.xs2,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: fontWeight.medium,
  },
  bars: {
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: spacing.md,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  brand: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    letterSpacing: 2,
  },
});
