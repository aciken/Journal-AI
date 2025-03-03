import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingWelcome() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Journaling experience
  const [journalingExperience, setJournalingExperience] = useState(null);

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
    router.push('/Onboarding/features');
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
            Your Journaling Experience
          </Text>
          
          <Text className="text-gray-400 text-base mb-8">
            Have you kept a journal before?
          </Text>
          
          {/* Experience options */}
          <View className="space-y-3">
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingExperience === 'experienced' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingExperience('experienced')}
            >
              <Text className="text-white text-base">Yes, I journal regularly</Text>
              <Text className="text-gray-400 text-xs mt-1">I have an established journaling practice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingExperience === 'occasional' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingExperience('occasional')}
            >
              <Text className="text-white text-base">Sometimes</Text>
              <Text className="text-gray-400 text-xs mt-1">I journal occasionally but not consistently</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingExperience === 'beginner' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingExperience('beginner')}
            >
              <Text className="text-white text-base">I'm new to journaling</Text>
              <Text className="text-gray-400 text-xs mt-1">I've tried it a few times or never before</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`w-full py-3 px-4 rounded-xl border ${journalingExperience === 'interested' ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'}`}
              onPress={() => setJournalingExperience('interested')}
            >
              <Text className="text-white text-base">Never, but I'm interested</Text>
              <Text className="text-gray-400 text-xs mt-1">This will be my first journaling experience</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View>
          {/* Continue button - positioned above progress bar */}
          <TouchableOpacity 
            className={`py-3 rounded-full flex-row justify-center items-center mb-16 ${
              journalingExperience ? 'bg-white' : 'bg-gray-600'
            }`}
            onPress={navigateNext}
            disabled={!journalingExperience}
          >
            <Text className={`text-base font-semibold mr-2 ${
              journalingExperience ? 'text-black' : 'text-gray-400'
            }`}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={journalingExperience ? "#000" : "#666"} 
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
                className={`h-1 rounded-full ${i === 1 ? 'bg-white w-6' : i < 1 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 