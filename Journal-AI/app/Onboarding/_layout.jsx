import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'black' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="features" />
      <Stack.Screen name="frequency" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="personalize" />
      <Stack.Screen name="ai" />
      <Stack.Screen name="insights" />
      <Stack.Screen name="templates" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="final" />
    </Stack>
  );
} 