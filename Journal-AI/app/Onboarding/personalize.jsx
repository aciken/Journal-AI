import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingPersonalize() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Preview animation values
  const previewFadeAnim = useRef(new Animated.Value(0)).current;
  const previewSlideAnim = useRef(new Animated.Value(20)).current;
  
  // Theme preference
  const [themePreference, setThemePreference] = useState(null);
  
  // Theme definitions with colors
  const themes = {
    'dark': {
      name: 'Dark',
      background: '#000000',
      card: '#1c1c1e',
      text: '#ffffff',
      subtext: '#a0a0a0',
      accent: '#3b82f6',
      description: 'Classic dark theme with white text'
    },
    'midnight': {
      name: 'Midnight Blue',
      background: '#0f172a',
      card: '#1e293b',
      text: '#ffffff',
      subtext: '#94a3b8',
      accent: '#8b5cf6',
      description: 'Deep blue tones for a calming experience'
    },
    'forest': {
      name: 'Forest',
      background: '#064e3b',
      card: '#065f46',
      text: '#ffffff',
      subtext: '#a7f3d0',
      accent: '#10b981',
      description: 'Earthy green tones for a natural feel'
    },
    'sepia': {
      name: 'Sepia',
      background: '#422006',
      card: '#713f12',
      text: '#fef3c7',
      subtext: '#d4b996',
      accent: '#ca8a04',
      description: 'Warm, paper-like tones for a classic look'
    }
  };

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Animate preview when theme preference changes
  useEffect(() => {
    if (themePreference) {
      // Reset animations first
      previewFadeAnim.setValue(0);
      previewSlideAnim.setValue(20);
      
      // Start animations
      Animated.parallel([
        Animated.timing(previewFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(previewSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [themePreference]);

  const navigateNext = () => {
    router.push('/Onboarding/ai');
  };

  const navigateBack = () => {
    router.back();
  };
  
  // Get the current theme colors or default to dark
  const getCurrentTheme = () => {
    return themePreference ? themes[themePreference] : themes['dark'];
  };
  
  // Render theme preview for the selected theme
  const renderThemePreview = (themeKey) => {
    const theme = themes[themeKey];
    return (
      <Animated.View 
        className="mt-2 mb-4 rounded-xl overflow-hidden"
        style={{
          opacity: previewFadeAnim,
          transform: [{ translateY: previewSlideAnim }]
        }}
      >
        <View 
          style={{ 
            backgroundColor: theme.background,
            padding: 12,
            borderRadius: 12
          }}
        >
          <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>
            Theme Preview
          </Text>
          
          {/* Journal entry preview */}
          <View 
            style={{ 
              backgroundColor: theme.card,
              borderRadius: 8,
              padding: 12
            }}
          >
            <Text style={{ color: theme.subtext, fontSize: 12, marginBottom: 4 }}>
              Today, 9:30 AM
            </Text>
            <Text style={{ color: theme.text, fontWeight: '500', marginBottom: 8 }}>
              Morning Reflection
            </Text>
            <View style={{ height: 2, width: 20, backgroundColor: `${theme.text}40`, marginBottom: 4 }} />
            <View style={{ height: 2, width: '100%', backgroundColor: `${theme.text}40`, marginBottom: 4 }} />
            <View style={{ height: 2, width: '100%', backgroundColor: `${theme.text}40`, marginBottom: 4 }} />
            <View style={{ height: 2, width: '75%', backgroundColor: `${theme.text}40` }} />
          </View>
        </View>
      </Animated.View>
    );
  };
  
  // Handle theme selection with animation
  const handleThemeSelect = (key) => {
    setThemePreference(key);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Back button */}
      <TouchableOpacity 
        className="absolute top-12 left-6 z-10" 
        onPress={navigateBack}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <Animated.View 
        className="flex-1 px-6 pt-14 justify-between"
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text className="text-white text-3xl font-bold mb-2">
            Your Style
          </Text>
          
          <Text className="text-gray-400 text-base mb-6">
            Which theme do you prefer for your journal?
          </Text>
          
          {/* Theme options with preview under selected option */}
          <View className="space-y-3 mb-6">
            {Object.keys(themes).map((key) => (
              <View key={key}>
                <TouchableOpacity 
                  className={`w-full py-3 px-4 rounded-xl border ${themePreference === key ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
                  onPress={() => handleThemeSelect(key)}
                >
                  <Text className="text-white text-base">{themes[key].name}</Text>
                  <Text className="text-gray-400 text-xs mt-1">{themes[key].description}</Text>
                </TouchableOpacity>
                
                {/* Show preview only under the selected option */}
                {themePreference === key && renderThemePreview(key)}
              </View>
            ))}
          </View>
        </ScrollView>
        
        <View>
          {/* Continue button - positioned above progress bar */}
          <TouchableOpacity 
            className={`py-3 rounded-full flex-row justify-center items-center mb-16 ${
              themePreference ? 'bg-white' : 'bg-gray-600'
            }`}
            onPress={navigateNext}
            disabled={!themePreference}
          >
            <Text className={`text-base font-semibold mr-2 ${
              themePreference ? 'text-black' : 'text-gray-400'
            }`}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={themePreference ? "#000" : "#666"} 
            />
          </TouchableOpacity>
          
          {/* Skip button */}
          <TouchableOpacity 
            className="absolute bottom-4 right-0"
            onPress={() => router.push('/Modal/Signup')}
          >
            <Text className="text-gray-500 text-sm">Skip</Text>
          </TouchableOpacity>
          
          {/* Progress indicator */}
          <View className="flex-row justify-center space-x-1 mb-4">
            {[...Array(10)].map((_, i) => (
              <View 
                key={i} 
                className={`h-1 rounded-full ${i === 4 ? 'bg-white w-6' : i < 4 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 