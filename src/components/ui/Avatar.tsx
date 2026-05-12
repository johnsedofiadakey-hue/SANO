import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, GRADIENT, radius, fontSize, fontWeight } from '../../theme';

interface AvatarProps {
  name?: string;
  imageUri?: string;
  size?: number;
}

export function Avatar({ name, imageUri, size = 40 }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const textSize = size * 0.38;

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        accessibilityLabel={`${name ?? 'User'} avatar`}
      />
    );
  }

  return (
    <LinearGradient
      colors={[...GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.initials, { fontSize: textSize }]}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  image: {
    resizeMode: 'cover',
  },
});
