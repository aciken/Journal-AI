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

export default function OnboardingFinal() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Particle animations
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Main content animation
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
    
    // Success icon animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Rotating animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
    
    // Particle animations
    const animateParticles = () => {
      Animated.stagger(150, [
        Animated.timing(particle1, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particle2, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particle3, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(particle4, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset and repeat
        particle1.setValue(0);
        particle2.setValue(0);
        particle3.setValue(0);
        particle4.setValue(0);
        animateParticles();
      });
    };
    
    animateParticles();
  }, []);

  const navigateToApp = () => {
    router.push('/Modal/Signup');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <Animated.View 
        className="flex-1 px-6 pt-14 justify-between"
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <View className="flex-1 items-center justify-center">
          {/* Celebration animation */}
          <View className="relative mb-8">
            {/* Rotating background glow */}
            <Animated.View 
              className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30"
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }}
            />
            
            {/* Success icon */}
            <Animated.View
              className="w-28 h-28 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full items-center justify-center"
              style={{
                transform: [{ scale: scaleAnim }]
              }}
            >
              <Ionicons name="checkmark" size={64} color="#fff" />
            </Animated.View>
            
            {/* Particles */}
            <Animated.View
              className="absolute w-4 h-4 bg-yellow-400 rounded-full"
              style={{
                top: -10,
                left: '50%',
                opacity: particle1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0]
                }),
                transform: [
                  {
                    translateY: particle1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50]
                    })
                  },
                  {
                    translateX: particle1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20]
                    })
                  },
                  { scale: particle1.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5]
                    })
                  }
                ]
              }}
            />
            
            <Animated.View
              className="absolute w-3 h-3 bg-green-400 rounded-full"
              style={{
                top: 20,
                right: -10,
                opacity: particle2.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0]
                }),
                transform: [
                  {
                    translateY: particle2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30]
                    })
                  },
                  {
                    translateX: particle2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 40]
                    })
                  },
                  { scale: particle2.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5]
                    })
                  }
                ]
              }}
            />
            
            <Animated.View
              className="absolute w-5 h-5 bg-pink-400 rounded-full"
              style={{
                bottom: 10,
                left: -10,
                opacity: particle3.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0]
                }),
                transform: [
                  {
                    translateY: particle3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 40]
                    })
                  },
                  {
                    translateX: particle3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30]
                    })
                  },
                  { scale: particle3.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5]
                    })
                  }
                ]
              }}
            />
            
            <Animated.View
              className="absolute w-4 h-4 bg-blue-400 rounded-full"
              style={{
                bottom: 0,
                right: 0,
                opacity: particle4.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0]
                }),
                transform: [
                  {
                    translateY: particle4.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 30]
                    })
                  },
                  {
                    translateX: particle4.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 30]
                    })
                  },
                  { scale: particle4.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5]
                    })
                  }
                ]
              }}
            />
          </View>
          
          {/* Title */}
          <Text className="text-white text-3xl font-bold text-center mb-4">
            You're All Set!
          </Text>
          
          <Text className="text-gray-400 text-base text-center mb-8 px-6">
            Your journal is ready for your thoughts, reflections, and moments of clarity.
          </Text>
          
          {/* Features summary */}
          <View className="bg-zinc-900 rounded-2xl p-5 mb-8 w-full">
            <Text className="text-white text-xl font-semibold mb-4 text-center">
              What's Next
            </Text>
            
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="create" size={16} color="#3b82f6" />
              </View>
              <Text className="text-white">Create your first journal entry</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="sparkles" size={16} color="#8b5cf6" />
              </View>
              <Text className="text-white">Explore AI-powered insights</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-amber-500/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="document-text" size={16} color="#f59e0b" />
              </View>
              <Text className="text-white">Try different journal templates</Text>
            </View>
          </View>
        </View>
        
        <View>
          {/* Get Started button */}
          <TouchableOpacity 
            className="py-3 rounded-full flex-row justify-center items-center mb-16 bg-gradient-to-r from-purple-500 to-blue-500"
            onPress={navigateToApp}
          >
            <Text className="text-base font-semibold mr-2 text-white">
              Get Started
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          {/* Progress indicator */}
          <View className="flex-row justify-center space-x-1 mb-4">
            {[...Array(10)].map((_, i) => (
              <View 
                key={i} 
                className={`h-1 rounded-full ${i === 9 ? 'bg-white w-6' : i < 9 ? 'bg-white/50 w-2' : 'bg-zinc-800 w-2'}`}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
} 