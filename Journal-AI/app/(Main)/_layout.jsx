import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack
        screenOptions={{
            headerShown: false,
          }}>
            <Stack.Screen name="Home" />  
            <Stack.Screen name="JournalPage" />
            <Stack.Screen name="BlurTestPage" />
            <Stack.Screen name="AskJournal"
            options={{
                animation: 'slide_from_bottom',
            }}
            />
        </Stack>
    )
}
