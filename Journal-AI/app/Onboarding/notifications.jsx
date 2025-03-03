import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  Switch
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingNotifications() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;
  
  // Notification settings
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(true);
  const [journalPrompts, setJournalPrompts] = useState(false);
  
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
    
    // Bell animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const navigateNext = () => {
    router.push('/Onboarding/final');
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
            Stay Consistent
          </Text>
          
          <Text className="text-gray-400 text-base mb-8">
            Set up notifications to build a journaling habit
          </Text>
          
          {/* Bell animation */}
          <View className="items-center mb-8">
            <Animated.View
              style={{
                transform: [
                  { rotate: bellAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-5deg', '5deg']
                    })
                  }
                ]
              }}
            >
              <View className="w-20 h-20 bg-blue-500/20 rounded-full items-center justify-center">
                <Ionicons name="notifications" size={36} color="#3b82f6" />
              </View>
            </Animated.View>
          </View>
          
          {/* Notification settings */}
          <View className="bg-zinc-900 rounded-2xl p-5 mb-6">
            <Text className="text-white text-xl font-semibold mb-6">Notification Settings</Text>
            
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                    <Ionicons name="time" size={16} color="#3b82f6" />
                  </View>
                  <Text className="text-white font-medium">Daily Reminder</Text>
                </View>
                <Switch
                  trackColor={{ false: "#3f3f46", true: "#3b82f640" }}
                  thumbColor={dailyReminder ? "#3b82f6" : "#71717a"}
                  onValueChange={setDailyReminder}
                  value={dailyReminder}
                />
              </View>
              <Text className="text-gray-400 text-sm pl-11">
                Receive a daily reminder to write in your journal
              </Text>
            </View>
            
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                    <Ionicons name="analytics" size={16} color="#8b5cf6" />
                  </View>
                  <Text className="text-white font-medium">Weekly Insights</Text>
                </View>
                <Switch
                  trackColor={{ false: "#3f3f46", true: "#8b5cf640" }}
                  thumbColor={weeklyInsights ? "#8b5cf6" : "#71717a"}
                  onValueChange={setWeeklyInsights}
                  value={weeklyInsights}
                />
              </View>
              <Text className="text-gray-400 text-sm pl-11">
                Get a weekly summary of your journaling patterns
              </Text>
            </View>
            
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-amber-500/20 rounded-full items-center justify-center mr-3">
                    <Ionicons name="bulb" size={16} color="#f59e0b" />
                  </View>
                  <Text className="text-white font-medium">Journal Prompts</Text>
                </View>
                <Switch
                  trackColor={{ false: "#3f3f46", true: "#f59e0b40" }}
                  thumbColor={journalPrompts ? "#f59e0b" : "#71717a"}
                  onValueChange={setJournalPrompts}
                  value={journalPrompts}
                />
              </View>
              <Text className="text-gray-400 text-sm pl-11">
                Receive occasional writing prompts for inspiration
              </Text>
            </View>
          </View>
          
          {/* Note */}
          <View className="bg-zinc-800/50 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text className="text-white font-medium ml-2">You're in Control</Text>
            </View>
            <Text className="text-gray-400 text-sm">
              You can change these notification settings at any time from the app settings.
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
                className={`h-1 rounded-full ${i === 8 ? 'bg-white w-6' : i < 8 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 