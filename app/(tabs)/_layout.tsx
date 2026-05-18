import React from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, overlay, GRADIENT, shadows } from '../../src/theme';

const { width } = Dimensions.get('window');

// ── Icons ──────────────────────────────────────────────────────────

function HomeIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.pur : colors.t4;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.552 20.552 21 20 21H15V15H9V21H4C3.448 21 3 20.552 3 20V9.5Z"
        stroke={color}
        strokeWidth={focused ? 2.2 : 1.8}
        strokeLinejoin="round"
        fill={focused ? colors.purMid : 'none'}
      />
    </Svg>
  );
}

function CommunityIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.pur : colors.t4;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? colors.purMid : 'none'} />
      <Path d="M2 19.5C2 16.462 5.134 14 9 14C12.866 14 16 16.462 16 19.5"
        stroke={color} strokeWidth={focused ? 2.2 : 1.8} strokeLinecap="round" />
      <Circle cx="18" cy="9" r="2.5" stroke={color} strokeWidth={1.6} />
      <Path d="M21 19C21 17.067 19.657 15.5 18 15.5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function HealthIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.pur : colors.t4;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth={focused ? 2 : 1.7}
        fill={focused ? colors.pinkMid : 'none'}
        strokeLinejoin="round"
      />
      <Path d="M8 12h2l1.5-3 2 6 1.5-3H17" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.pur : colors.t4;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={focused ? 2.2 : 1.8}
        fill={focused ? colors.purMid : 'none'} />
      <Path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
        stroke={color} strokeWidth={focused ? 2.2 : 1.8} strokeLinecap="round" />
    </Svg>
  );
}

// ── Animated tab button ───────────────────────────────────────────

function TabButton({
  onPress, onLongPress, focused, icon,
}: {
  onPress: () => void;
  onLongPress: () => void;
  focused: boolean;
  icon: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const dot = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    dot.value = withSpring(focused ? 1 : 0, { damping: 18, stiffness: 200 });
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dot.value,
    transform: [{ scaleX: interpolate(dot.value, [0, 1], [0.3, 1]) }],
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        scale.value = withSpring(0.85, { damping: 10, stiffness: 400 }, () => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        });
        onPress();
      }}
      onLongPress={onLongPress}
      style={styles.tabBtn}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabBtnInner, animStyle]}>
        {focused && (
          <View style={styles.tabActive} />
        )}
        {icon}
      </Animated.View>
      <Animated.View style={[styles.dot, dotStyle]} />
    </TouchableOpacity>
  );
}

// ── Scan FAB ─────────────────────────────────────────────────────

function ScanFAB() {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.fabWrapper}>
      <Animated.View style={[styles.fabGlow, animStyle]}>
        <TouchableOpacity
          onPress={() => {
            scale.value = withSpring(0.9, { damping: 10, stiffness: 400 }, () => {
              scale.value = withSpring(1, { damping: 12, stiffness: 280 });
            });
            router.push('/scan/mannequin');
          }}
          activeOpacity={1}
          style={styles.fab}
        >
          <LinearGradient
            colors={[...GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                stroke="white" strokeWidth={2} strokeLinejoin="round" />
              <Circle cx="12" cy="13" r="4" stroke="white" strokeWidth={2} />
            </Svg>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Custom tab bar ────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarOuter} pointerEvents="box-none">
      <View style={styles.tabBarContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
        )}
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;

            if (route.name === 'scan-tab') {
              return <ScanFAB key={route.key} />;
            }

            const icon = (() => {
              if (route.name === 'index')     return <HomeIcon focused={focused} />;
              if (route.name === 'community') return <CommunityIcon focused={focused} />;
              if (route.name === 'health')    return <HealthIcon focused={focused} />;
              if (route.name === 'profile')   return <ProfileIcon focused={focused} />;
              return null;
            })();

            return (
              <TabButton
                key={route.key}
                focused={focused}
                icon={icon}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ── Layout ────────────────────────────────────────────────────────

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="scan-tab" />
      <Tabs.Screen name="scan-placeholder" options={{ href: null }} />
      <Tabs.Screen name="health" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const BAR_HEIGHT = 68;
const BAR_BOTTOM = Platform.OS === 'ios' ? 28 : 16;

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: BAR_BOTTOM,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: overlay.white90,
    ...shadows.tab,
    backgroundColor: Platform.OS === 'android' ? overlay.white97 : 'transparent',
  },
  androidBg: {
    backgroundColor: overlay.white97,
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 4,
  },
  tabBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 14,
    position: 'relative',
  },
  tabActive: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.purMid,
    borderRadius: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.pur,
    position: 'absolute',
    bottom: 6,
  },

  // FAB
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlow: {
    ...shadows.pur,
    borderRadius: 22,
  },
  fab: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
});
