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

export default function OnboardingInsights() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Insight card animations
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  
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
    
    // Staggered animation for insight cards
    Animated.stagger(200, [
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(card3Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateNext = () => {
    router.push('/Onboarding/templates');
  };

  const navigateBack = () => {
    router.back();
  };
  
  // Insight cards data
  const insights = [
    {
      title: "Mood Patterns",
      description: "Visualize how your mood changes over time and identify patterns",
      icon: "analytics",
      color: "#ec4899",
      animation: card1Anim
    },
    {
      title: "Topic Analysis",
      description: "Discover recurring themes and topics in your journal entries",
      icon: "pie-chart",
      color: "#8b5cf6",
      animation: card2Anim
    },
    {
      title: "Reflection Prompts",
      description: "Receive personalized prompts based on your journaling history",
      icon: "bulb",
      color: "#f59e0b",
      animation: card3Anim
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
            Personalized Insights
          </Text>
          
          <Text className="text-gray-400 text-base mb-6">
            Discover patterns and gain deeper understanding of your thoughts
          </Text>
          
          {/* Insights visualization */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-purple-500/20 rounded-full items-center justify-center mb-2">
              <Ionicons name="sparkles" size={36} color="#8b5cf6" />
            </View>
          </View>
          
          {/* Insight cards */}
          <View className="space-y-4 mb-6">
            {insights.map((insight, index) => (
              <Animated.View 
                key={index}
                className="bg-zinc-900 rounded-xl p-4"
                style={{
                  opacity: insight.animation,
                  transform: [
                    { translateX: insight.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0]
                      })
                    }
                  ]
                }}
              >
                <View className="flex-row items-start">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${insight.color}20` }}
                  >
                    <Ionicons name={insight.icon} size={20} color={insight.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium text-lg mb-1">{insight.title}</Text>
                    <Text className="text-gray-400 text-sm">{insight.description}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
          
          {/* Additional info */}
          <View className="bg-zinc-800/50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text className="text-white font-medium ml-2">How It Works</Text>
            </View>
            <Text className="text-gray-400 text-sm">
              AI Journal analyzes your entries over time to provide meaningful insights. The more you journal, the more personalized your insights become.
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
                className={`h-1 rounded-full ${i === 6 ? 'bg-white w-6' : i < 6 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 