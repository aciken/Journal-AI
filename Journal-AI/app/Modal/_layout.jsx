import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="Settings" />
      <Stack.Screen name="CreateJournal" />
      <Stack.Screen name="Signin" />
      <Stack.Screen name="Signup" />
    </Stack>
  );
} 