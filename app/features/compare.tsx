import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { colors, GRADIENT, spacing, fontSize, fontWeight, radius } from '../../src/theme';

export default function CompareScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Before / After</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        <LinearGradient
          colors={[...GRADIENT]}
          style={styles.iconWrap}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.icon}>📸</Text>
        </LinearGradient>

        <Text style={styles.headline}>Progress tracking{'\n'}coming soon</Text>
        <Text style={styles.sub}>
          Complete a few skin scans first. Once your scan history builds up, SANO will automatically
          compare your results over time — no manual effort needed.
        </Text>

        <GradientButton
          label="Start a skin scan →"
          onPress={() => router.push('/scan/mannequin')}
          variant="primary"
        />
      </View>
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
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.t1 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.xl,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 48 },
  headline: {
    fontSize: 26,
    fontWeight: fontWeight.extrabold,
    color: colors.t1,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: fontSize.md,
    color: colors.t3,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
});
