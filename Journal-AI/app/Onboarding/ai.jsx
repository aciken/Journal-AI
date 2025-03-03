import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated, 
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingAI() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // AI preference
  const [aiPreference, setAiPreference] = useState(null);

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

  const navigateNext = () => {
    router.push('/Onboarding/insights');
  };

  const navigateBack = () => {
    router.back();
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
        <View>
          {/* Title */}
          <Text className="text-white text-3xl font-bold mb-2">
            AI Assistance
          </Text>
          
          <Text className="text-gray-400 text-base mb-8">
            How would you like AI to help with your journaling?
          </Text>
          
          {/* AI preference options */}
          <View className="space-y-3">
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${aiPreference === 'writing-help' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setAiPreference('writing-help')}
            >
              <Text className="text-white text-base">Writing assistance</Text>
              <Text className="text-gray-400 text-xs mt-1">Help me express my thoughts more clearly</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${aiPreference === 'insights' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setAiPreference('insights')}
            >
              <Text className="text-white text-base">Personal insights</Text>
              <Text className="text-gray-400 text-xs mt-1">Analyze patterns and provide meaningful feedback</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${aiPreference === 'prompts' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setAiPreference('prompts')}
            >
              <Text className="text-white text-base">Journaling prompts</Text>
              <Text className="text-gray-400 text-xs mt-1">Suggest topics when I'm not sure what to write</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${aiPreference === 'minimal' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setAiPreference('minimal')}
            >
              <Text className="text-white text-base">Minimal AI</Text>
              <Text className="text-gray-400 text-xs mt-1">I prefer to journal without AI assistance</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View>
          {/* Continue button - positioned above progress bar */}
          <TouchableOpacity 
            className={`py-3 rounded-full flex-row justify-center items-center mb-16 ${
              aiPreference ? 'bg-white' : 'bg-gray-600'
            }`}
            onPress={navigateNext}
            disabled={!aiPreference}
          >
            <Text className={`text-base font-semibold mr-2 ${
              aiPreference ? 'text-black' : 'text-gray-400'
            }`}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={aiPreference ? "#000" : "#666"} 
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
                className={`h-1 rounded-full ${i === 5 ? 'bg-white w-6' : i < 5 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 