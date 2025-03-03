import React, { useEffect, useRef } from 'react';
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

export default function OnboardingStart() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // First animate the logo
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Then animate the text
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Finally animate the button
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Background animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateNext = () => {
    router.push('/Onboarding/welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <Animated.View 
        className="flex-1 justify-center items-center px-8"
        style={{ 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
      >
        {/* Animated background elements */}
        <Animated.View 
          className="absolute"
          style={{
            width: width * 1.5,
            height: width * 1.5,
            borderRadius: width * 0.75,
            backgroundColor: '#111',
            opacity: 0.5,
            transform: [
              { scale: Animated.multiply(scaleAnim, 1.1) }
            ]
          }}
        />
        
        {/* Logo */}
        <Animated.View 
          className="items-center mb-16"
          style={{ 
            opacity: logoAnim,
            transform: [
              { translateY: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })}
            ]
          }}
        >
          <View className="w-24 h-24 bg-zinc-800 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-5xl font-bold">AJ</Text>
          </View>
        </Animated.View>
        
        {/* Text content */}
        <Animated.View 
          className="items-center mb-16"
          style={{ 
            opacity: textAnim,
            transform: [
              { translateY: textAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}
            ]
          }}
        >
          <Text className="text-white text-4xl font-bold text-center mb-4">
            Begin Your Journey
          </Text>
          <Text className="text-gray-400 text-center text-lg mb-2">
            Welcome to a new way of journaling
          </Text>
          <Text className="text-gray-400 text-center text-lg">
            Let's set up your experience in a few steps
          </Text>
        </Animated.View>
        
        {/* Button */}
        <Animated.View 
          className="w-full"
          style={{ 
            opacity: buttonAnim,
            transform: [
              { translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}
            ]
          }}
        >
          <TouchableOpacity 
            className="bg-white py-4 rounded-full flex-row justify-center items-center"
            onPress={navigateNext}
            style={{
              shadowColor: "#fff",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Text className="text-black text-lg font-semibold mr-2">
              Let's Begin
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Skip button */}
        <TouchableOpacity 
          className="absolute bottom-10 right-8"
          onPress={() => router.push('/Modal/Signup')}
        >
          <Text className="text-gray-500">Skip</Text>
        </TouchableOpacity>
        
        {/* Progress indicator */}
        <View className="absolute bottom-20 left-0 right-0 flex-row justify-center space-x-1">
          {[...Array(10)].map((_, i) => (
            <View 
              key={i} 
              className={`h-1 rounded-full ${i === 0 ? 'bg-white w-6' : 'bg-zinc-800 w-2'}`}
            />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 