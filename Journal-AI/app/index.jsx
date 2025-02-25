import { View, Text, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const PenIcon = () => (
  <View className="w-4 h-4 items-center justify-center">
    <View className="w-0.5 h-4 bg-white/90 rotate-45" />
    <View className="absolute bottom-0 w-2 h-2 border-b-2 border-r-2 border-white/90 rotate-45" />
  </View>
);

const InsightIcon = () => (
  <View className="w-4 h-4 items-center justify-center">
    <View className="absolute w-3 h-3 border-2 border-white/90 rounded-full" />
    <View className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white/90 rotate-45" />
  </View>
);

const AIIcon = () => (
  <View className="w-4 h-4 items-center justify-center">
    <View className="absolute w-3 h-3 border-2 border-white/90 rounded" />
    <View className="absolute w-1.5 h-1.5 bg-white/90 rounded-sm" style={{ top: 2 }} />
  </View>
);

export default function WelcomePage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(38, 38, 38, 0.3)', 'rgba(0, 0, 0, 0)']}
        className="absolute w-full h-96"
      />
      
      <Animated.View 
        className="flex-1 px-6 justify-between"
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Top Section */}
        <View className="items-center mt-16">
          <LinearGradient
            colors={['#1F1F1F', '#2D2D2D']}
            className="w-20 h-20 mb-6 rounded-2xl items-center justify-center shadow-lg"
            style={{ elevation: 5 }}
          >
            <Text className="text-white text-3xl font-bold">AJ</Text>
          </LinearGradient>
          <Text className="text-4xl font-bold text-white mb-3">
            AI Journal
          </Text>
          <Text className="text-base text-gray-400 text-center max-w-[280px] leading-5">
            Your intelligent journaling companion for meaningful self-reflection
          </Text>
        </View>

        {/* Middle Section - Features */}
        <View className="py-10">
          <View className="space-y-8">
            <FeatureItem 
              gradient={['#2D2D2D', '#1F1F1F']}
              title="Smart Journaling"
              description="Write freely with AI-powered prompts and guidance"
              icon={<PenIcon />}
            />
            <FeatureItem 
              gradient={['#2D2D2D', '#1F1F1F']}
              title="Personal Insights"
              description="Gain deeper understanding of your thoughts and patterns"
              icon={<InsightIcon />}
            />
            <FeatureItem 
              gradient={['#2D2D2D', '#1F1F1F']}
              title="AI Analysis"
              description="Receive thoughtful responses and perspectives"
              icon={<AIIcon />}
            />
          </View>
        </View>

        {/* Bottom Section - Buttons */}
        <View className="space-y-4 mb-10">
          <Link href="/signup" asChild>
            <TouchableOpacity className="shadow-lg">
              <LinearGradient
                colors={['#2D2D2D', '#1F1F1F']}
                className="w-full py-4 rounded-xl"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text className="text-white text-center text-base font-medium">
                  Start Journaling
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
          

            <TouchableOpacity
            onPress={() => router.push('/Home')}
            
            className="w-full border border-gray-800 py-4 rounded-xl bg-black/40 shadow-sm active:bg-gray-900">
              <Text className="text-gray-300 text-center text-base">
                Sign In
              </Text>
            </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ gradient, title, description, icon }) => (
  <View className="flex-row items-start space-x-4">
    <LinearGradient
      colors={gradient}
      className="w-10 h-10 rounded-xl items-center justify-center shadow-md"
      style={{ elevation: 3 }}
    >
      {icon}
    </LinearGradient>
    <View className="flex-1">
      <Text className="text-base font-medium text-white mb-1">{title}</Text>
      <Text className="text-gray-400 text-sm leading-5">{description}</Text>
    </View>
  </View>
);
