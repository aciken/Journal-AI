import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack
        screenOptions={{
            headerShown: false,
          }}>
            <Stack.Screen name="index" />  
            <Stack.Screen name="(Main)" />
            <Stack.Screen name="Modal/Settings" 
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen name="(Main)/AskJournal"
              options={{
                animation: 'slide_from_bottom'
              }}
            />
        </Stack>
    )
}
