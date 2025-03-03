import { Stack } from 'expo-router';
import { GlobalProvider } from './Context/GlobalProvider';

export default function Layout() {
    return (
        <GlobalProvider>
        <Stack
        screenOptions={{
            headerShown: false,
          }}>
            <Stack.Screen name="index" />  
            <Stack.Screen name="(Main)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="Modal" 
              options={{
                headerShown: false,
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
        </GlobalProvider>
    )
}
