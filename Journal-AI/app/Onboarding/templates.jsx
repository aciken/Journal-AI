import React, { useEffect, useRef } from 'react';
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

export default function OnboardingTemplates() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Template animations
  const template1Anim = useRef(new Animated.Value(0)).current;
  const template2Anim = useRef(new Animated.Value(0)).current;
  const template3Anim = useRef(new Animated.Value(0)).current;
  
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
    
    // Staggered animation for templates
    Animated.stagger(200, [
      Animated.timing(template1Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(template2Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(template3Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateNext = () => {
    router.push('/Onboarding/notifications');
  };

  const navigateBack = () => {
    router.back();
  };
  
  // Template data
  const templates = [
    {
      title: "Daily Reflection",
      description: "Guided prompts for your daily thoughts and experiences",
      icon: "sunny",
      color: "#f59e0b",
      animation: template1Anim
    },
    {
      title: "Gratitude Journal",
      description: "Focus on the positive aspects of your life",
      icon: "heart",
      color: "#ec4899",
      animation: template2Anim
    },
    {
      title: "Goal Tracker",
      description: "Track progress on your personal and professional goals",
      icon: "trophy",
      color: "#3b82f6",
      animation: template3Anim
    }
  ];

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
            Journal Templates
          </Text>
          
          <Text className="text-gray-400 text-base mb-6">
            Start journaling quickly with pre-designed templates
          </Text>
          
          {/* Templates icon */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-amber-500/20 rounded-full items-center justify-center mb-2">
              <Ionicons name="document-text" size={36} color="#f59e0b" />
            </View>
          </View>
          
          {/* Template cards */}
          <View className="space-y-4 mb-6">
            {templates.map((template, index) => (
              <Animated.View 
                key={index}
                className="bg-zinc-900 rounded-xl overflow-hidden"
                style={{
                  opacity: template.animation,
                  transform: [
                    { translateY: template.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ]
                }}
              >
                <View className="p-4">
                  <View className="flex-row items-start">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      <Ionicons name={template.icon} size={20} color={template.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium text-lg mb-1">{template.title}</Text>
                      <Text className="text-gray-400 text-sm">{template.description}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Template preview line */}
                <View 
                  className="h-1"
                  style={{ backgroundColor: template.color }}
                />
              </Animated.View>
            ))}
          </View>
          
          {/* Additional info */}
          <View className="bg-zinc-800/50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text className="text-white font-medium ml-2">Customizable</Text>
            </View>
            <Text className="text-gray-400 text-sm">
              All templates are fully customizable. You can also create your own templates tailored to your journaling needs.
            </Text>
          </View>
        </ScrollView>
        
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
                className={`h-1 rounded-full ${i === 7 ? 'bg-white w-6' : i < 7 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 