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

export default function OnboardingPrivacy() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;

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
    
    // Lock animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(lockAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(lockAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const navigateNext = () => {
    router.push('/Onboarding/personalize');
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
            Your Privacy Matters
          </Text>
          
          <Text className="text-gray-400 text-base mb-6">
            AI Journal is designed with your privacy as the top priority
          </Text>
          
          {/* Lock animation */}
          <View className="items-center justify-center mb-6">
            <Animated.View
              style={{
                opacity: lockAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1]
                }),
                transform: [
                  { scale: lockAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1.05]
                  })}
                ]
              }}
            >
              <View className="w-20 h-20 bg-zinc-900 rounded-full items-center justify-center">
                <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center">
                  <Ionicons name="shield-checkmark" size={30} color="#10b981" />
                </View>
              </View>
            </Animated.View>
          </View>
          
          {/* Privacy features */}
          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="phone-portrait" size={16} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium mb-1">Local Processing</Text>
                <Text className="text-gray-400 text-sm">
                  Your journal entries can be processed on-device for maximum privacy
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="finger-print" size={16} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium mb-1">Biometric Lock</Text>
                <Text className="text-gray-400 text-sm">
                  Secure your journal with fingerprint or face recognition
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="lock-closed" size={16} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium mb-1">End-to-End Encryption</Text>
                <Text className="text-gray-400 text-sm">
                  Your data is encrypted at all times, even when synced to the cloud
                </Text>
              </View>
            </View>
          </View>
          
          {/* Privacy commitment */}
          <View className="bg-zinc-800/50 rounded-xl p-4 mt-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text className="text-white font-medium ml-2">Our Privacy Commitment</Text>
            </View>
            <Text className="text-gray-400 text-sm">
              We never sell your data or share it with third parties. Your journal entries remain private and encrypted at all times.
            </Text>
          </View>
        </View>
        
        <View>
          {/* Continue button - positioned above progress bar */}
          <TouchableOpacity 
            className="py-3 rounded-full flex-row justify-center items-center mb-16 bg-white"
            onPress={navigateNext}
          >
            <Text className="text-base font-semibold mr-2 text-black">
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color="#000" 
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