import React, { useEffect, useRef } from 'react';
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

export default function OnboardingFeatures() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const features = [
    {
      id: 0,
      title: "Smart Journaling",
      description: "AI assistance helps you express your thoughts more clearly",
      icon: "pencil",
      color: "#3b82f6"
    },
    {
      id: 1,
      title: "Mood Tracking",
      description: "Visualize emotional patterns over time",
      icon: "heart",
      color: "#ec4899"
    },
    {
      id: 2,
      title: "AI Insights",
      description: "Discover patterns and trends in your journal entries",
      icon: "sparkles",
      color: "#8b5cf6"
    },
    {
      id: 3,
      title: "Privacy Focus",
      description: "Your data stays private with local processing options",
      icon: "shield-checkmark",
      color: "#10b981"
    }
  ];

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
    router.push('/Onboarding/frequency');
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
            Key Features
          </Text>
          
          <Text className="text-gray-400 text-base mb-6">
            AI Journal helps you capture thoughts and gain insights
          </Text>
          
          {/* Features list */}
          <View className="space-y-4">
            {features.map((feature) => (
              <View key={feature.id} className="flex-row items-start">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-4 mt-0.5"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <Ionicons name={feature.icon} size={20} color={feature.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium text-lg mb-1">{feature.title}</Text>
                  <Text className="text-gray-400 text-sm">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Additional info */}
          <View className="bg-zinc-800/50 rounded-xl p-4 mt-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text className="text-white font-medium ml-2">Personalized Experience</Text>
            </View>
            <Text className="text-gray-400 text-sm">
              AI Journal adapts to your writing style and preferences over time, creating a uniquely personal journaling experience.
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
                className={`h-1 rounded-full ${i === 2 ? 'bg-white w-6' : i < 2 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 