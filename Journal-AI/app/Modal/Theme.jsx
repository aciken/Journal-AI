import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../Context/GlobalProvider';

export default function Theme() {
  const router = useRouter();
  const { user, setUser } = useGlobalContext();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;
  const [isClosing, setIsClosing] = useState(false);
  
  // Theme state
  const [selectedTheme, setSelectedTheme] = useState('dark');
  
  // Theme definitions
  const themes = {
    'dark': { name: 'Dark', background: '#000000', card: '#1c1c1e', text: '#ffffff', subtext: '#a0a0a0', accent: '#3b82f6', description: 'Classic dark theme with white text' },
    'midnight': { name: 'Midnight Blue', background: '#0f172a', card: '#1e293b', text: '#ffffff', subtext: '#94a3b8', accent: '#8b5cf6', description: 'Deep blue tones for a calming experience' },
    'forest': { name: 'Forest', background: '#064e3b', card: '#065f46', text: '#ffffff', subtext: '#a7f3d0', accent: '#10b981', description: 'Earthy green tones for a natural feel' },
    'sepia': { name: 'Sepia', background: '#422006', card: '#713f12', text: '#fef3c7', subtext: '#d4b996', accent: '#ca8a04', description: 'Warm, paper-like tones for a classic look' }
  };
  
  // Load current theme when component mounts
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme) {
          setSelectedTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(blurAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
    
    // Handle back button press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isClosing) {
        handleClose();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [isClosing]);
  
  // Handle closing the modal
  const handleClose = () => {
    setIsClosing(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      router.back();
    });
  };
  
  // Apply theme and save preference
  const applyTheme = async () => {
    try {
      // Save theme preference
      await AsyncStorage.setItem('themePreference', selectedTheme);
      
      // Update user object if it exists
      if (user) {
        const userData = typeof user === 'string' ? JSON.parse(user) : user;
        userData.themePreference = selectedTheme;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      
      // Close modal
      handleClose();
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Render theme color preview
  const renderThemeColor = (themeKey) => {
    const theme = themes[themeKey];
    return (
      <View className="flex-row items-center space-x-2 mt-1">
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.accent }} />
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.card }} />
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.background }} />
      </View>
    );
  };
  
  const currentTheme = themes[selectedTheme] || themes.dark;
  
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <Animated.View 
        style={{ 
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="w-full py-4 px-6 border-b border-zinc-800 flex-row justify-between items-center">
              <Text className="text-white text-xl font-medium">Select Theme</Text>
              <TouchableOpacity onPress={handleClose} className="bg-zinc-800 rounded-full p-1.5">
                <Ionicons name="close" size={20} color="#d6d3d1" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="w-full" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View className="px-6 pt-6 pb-4">
                <Text className="text-white text-base font-medium mb-3">Preview:</Text>
                <View className="rounded-lg overflow-hidden" style={{ backgroundColor: currentTheme.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <View className="p-4">
                    <View className="mb-3">
                      <Text style={{ color: currentTheme.text, fontWeight: 'bold', fontSize: 16 }}>Journal Preview</Text>
                      <Text style={{ color: currentTheme.subtext, fontSize: 12, marginTop: 2 }}>Today, 10:30 AM</Text>
                    </View>
                    <View className="space-y-2">
                      <View className="h-3 rounded-full w-full" style={{ backgroundColor: `${currentTheme.text}20` }} />
                      <View className="h-3 rounded-full w-3/4" style={{ backgroundColor: `${currentTheme.text}20` }} />
                      <View className="h-3 rounded-full w-5/6" style={{ backgroundColor: `${currentTheme.text}20` }} />
                      <View className="h-3 rounded-full w-2/3" style={{ backgroundColor: `${currentTheme.text}20` }} />
                    </View>
                  </View>
                </View>
              </View>
              
              <View className="px-6 pb-4">
                <Text className="text-white text-base font-medium mb-3">Available Themes:</Text>
                <View className="space-y-3">
                  {Object.keys(themes).map((key) => (
                    <TouchableOpacity 
                      key={key} 
                      className={`w-full py-3 px-4 rounded-xl border ${selectedTheme === key ? 'border-white' : 'border-zinc-800'}`} 
                      onPress={() => setSelectedTheme(key)} 
                      style={{ backgroundColor: selectedTheme === key ? 'rgba(82, 82, 82, 0.3)' : 'rgba(39, 39, 42, 0.5)' }}
                    >
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-white text-base font-medium">{themes[key].name}</Text>
                          {renderThemeColor(key)}
                        </View>
                        {selectedTheme === key && (
                          <View className="bg-white rounded-full p-1.5">
                            <Ionicons name="checkmark" size={14} color="#000" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <View className="px-6 py-4 border-t border-zinc-800">
              <TouchableOpacity 
                className="w-full py-3 rounded-full" 
                onPress={applyTheme} 
                style={{ 
                  backgroundColor: '#ffffff', 
                  shadowColor: "#000", 
                  shadowOffset: { width: 0, height: 2 }, 
                  shadowOpacity: 0.2, 
                  shadowRadius: 4, 
                  elevation: 3 
                }}
              >
                <Text className="text-black text-center font-medium">Apply Theme</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </BlurView>
      </Animated.View>
    </View>
  );
} 