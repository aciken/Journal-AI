import { View, Text, TouchableOpacity, SafeAreaView, Animated, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from './Context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

// Simple, elegant icons
const PenIcon = () => (
  <Ionicons name="pencil-outline" size={22} color="#fff" />
);

const InsightIcon = () => (
  <Ionicons name="analytics-outline" size={22} color="#fff" />
);

const AIIcon = () => (
  <Ionicons name="sparkles-outline" size={22} color="#fff" />
);

export default function WelcomePage() {

  const { isAuthenticated, user,setUser } = useGlobalContext();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  // State to track if we have a photo to display
  const [hasPhoto, setHasPhoto] = useState(false);
  // You can replace this with your actual photo URL or require statement
  const photoSource = null; // Set to null to demonstrate empty state
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Loading animation
  const fadeLoadingAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Simple fade in/out animation for loading
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeLoadingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeLoadingAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check if we have a valid photo
    if (photoSource) {
      setHasPhoto(true);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        console.log('User data:', userData);
        
        if (userData) {
          console.log('Setting user:', JSON.parse(userData));
          setUser(JSON.parse(userData));
          // User is logged in, redirect to Home
          setTimeout(() => {
            router.replace('/Home');
          }, 500); // Small delay for smoother transition
        } else {
          // No user found, show welcome page
          setIsLoading(false);
          
          // Start welcome page animations
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
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setIsLoading(false);
        
        // Start welcome page animations even if there was an error
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
      }
    };
    
    fetchUser();
  }, []);

  // If still loading, show simple loading animation
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <StatusBar style="light" />
        <Animated.View style={{ opacity: fadeLoadingAnim }}>
          <Text className="text-white text-2xl font-medium">Journal AI</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      
      <Animated.View 
        className="flex-1 px-6 justify-between items-center"
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* Photo Section - Will be empty if no photo */}
        <View className="items-center mt-12 mb-4">
          {hasPhoto ? (
            <Image
              source={photoSource}
              style={{
                width: width * 0.85,
                height: width * 1.2,
                borderRadius: 20,
              }}
              resizeMode="cover"
            />
          ) : (
            // Empty view when no photo is available
            <View style={{ width: width * 0.85, height: width * 0.5 }} />
          )}
        </View>

        {/* Bottom Section - Welcome Text and Buttons */}
        <View className="w-full items-center mb-10">
          <Text className="text-white text-4xl font-bold mb-3 text-center">
            Welcome to AI Journal
          </Text>
          
          <Text className="text-gray-300 text-center text-lg mb-10">
            Starting today, let's capture your thoughts and discover your patterns.
          </Text>
          
          <TouchableOpacity 
            className="bg-white w-full py-4 rounded-full mb-4"
            onPress={() => router.push('/Onboarding')}
            style={{
              shadowColor: "#fff",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Text className="text-black text-center text-lg font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/Modal/Signin')}
          >
            <Text className="text-gray-400 text-center text-base">
              Already have an account?
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, title, description }) => (
  <View className="flex-row items-start space-x-4">
    <View className="bg-zinc-800 w-10 h-10 rounded-lg items-center justify-center">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-base font-medium text-white mb-1">{title}</Text>
      <Text className="text-zinc-400 text-sm">{description}</Text>
    </View>
  </View>
);
