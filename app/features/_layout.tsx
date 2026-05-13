import { Stack } from 'expo-router';
import React from 'react';

export default function FeaturesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chat" />
      <Stack.Screen name="compare" />
      <Stack.Screen name="cycle" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="foundation" />
      <Stack.Screen name="product" />
      <Stack.Screen name="routine" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
