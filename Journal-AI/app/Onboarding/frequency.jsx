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

export default function OnboardingFrequency() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Journaling frequency
  const [journalingFrequency, setJournalingFrequency] = useState(null);

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
    router.push('/Onboarding/privacy');
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
            Your Journaling Routine
          </Text>
          
          <Text className="text-gray-400 text-base mb-8">
            How often would you like to journal?
          </Text>
          
          {/* Journaling frequency options */}
          <View className="space-y-3">
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingFrequency === 'daily' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingFrequency('daily')}
            >
              <Text className="text-white text-base">Daily</Text>
              <Text className="text-gray-400 text-xs mt-1">I want to journal every day</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingFrequency === 'few-times-week' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingFrequency('few-times-week')}
            >
              <Text className="text-white text-base">A few times a week</Text>
              <Text className="text-gray-400 text-xs mt-1">I'll journal 2-3 times per week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingFrequency === 'weekly' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingFrequency('weekly')}
            >
              <Text className="text-white text-base">Weekly</Text>
              <Text className="text-gray-400 text-xs mt-1">I'll journal about once a week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingFrequency === 'occasionally' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingFrequency('occasionally')}
            >
              <Text className="text-white text-base">Occasionally</Text>
              <Text className="text-gray-400 text-xs mt-1">I'll journal when I feel like it</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View>
          {/* Continue button - positioned above progress bar */}
          <TouchableOpacity 
            className={`py-3 rounded-full flex-row justify-center items-center mb-16 ${
              journalingFrequency ? 'bg-white' : 'bg-gray-600'
            }`}
            onPress={navigateNext}
            disabled={!journalingFrequency}
          >
            <Text className={`text-base font-semibold mr-2 ${
              journalingFrequency ? 'text-black' : 'text-gray-400'
            }`}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={journalingFrequency ? "#000" : "#666"} 
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
                className={`h-1 rounded-full ${i === 3 ? 'bg-white w-6' : i < 3 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 