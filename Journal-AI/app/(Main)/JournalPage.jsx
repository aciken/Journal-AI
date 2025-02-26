import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Image, Animated, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import TextIcon from '../../assets/Icons/TextIcon.png';
import VoiceIcon from '../../assets/Icons/VoiceIcon.png';
import { Easing } from 'react-native';
import { Asset } from 'expo-asset';

export default function JournalPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isBlurred, setIsBlurred] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  
  // Enhanced animations - simplified for elegance
  const blurAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  
  // Preload icons to prevent loading delay
  useEffect(() => {
    const preloadIcons = async () => {
      try {
        // Preload the icon images
        await Asset.loadAsync([TextIcon, VoiceIcon]);
        setIconsLoaded(true);
      } catch (error) {
        console.error("Failed to preload icons:", error);
        // Set loaded anyway to not block the UI
        setIconsLoaded(true);
      }
    };
    
    preloadIcons();
  }, []);
  
  // Elegant animation sequence
  useEffect(() => {
    // Reset animation values immediately when state changes
    if (isBlurred) {
      // Reset to initial values before starting open animation
      contentAnim.setValue(0);
      
      // Open animation - start blur immediately without waiting for icons
      Animated.timing(blurAnim, {
        toValue: 1,
        duration: 300, // Slightly faster blur
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
      
      // Then bring in the content with a subtle fade and rise
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
        // No delay - start immediately after blur begins
      }).start();
    } else {
      // More pronounced closing animation
      contentAnim.setValue(1); // Ensure we start from 1
      blurAnim.setValue(1); // Ensure we start from 1
      
      // Use parallel for more immediate visual feedback
      Animated.parallel([
        // Animate content out with more dramatic movement
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 250, // Slightly longer to be more noticeable
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        
        // Delay the blur fadeout slightly
        Animated.sequence([
          Animated.delay(50),
          Animated.timing(blurAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.in(Easing.ease),
          }),
        ]),
      ]).start(() => {
        // Ensure values are reset after animation completes
        if (!isBlurred) {
          blurAnim.setValue(0);
          contentAnim.setValue(0);
        }
      });
    }
  }, [isBlurred]);
  
  // Derived animations for content elements - simplified for opening
  const translateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });
  
  // More dramatic scale for better visibility
  const scale = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });
  
  // More pronounced upward movement for closing
  const translateYClose = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });
  
  // Blur intensity animation
  const blurIntensity = blurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });
  
  // Background opacity for a subtle fade effect
  const backdropOpacity = blurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  // Toggle menu function with animation reset
  const toggleMenu = () => {
    // If we're about to open the menu, ensure animations are reset
    if (!isBlurred) {
      blurAnim.setValue(0);
      contentAnim.setValue(0);
    }
    setIsBlurred(!isBlurred);
  };
  
  // Navigate to Blur Test Page
  const navigateToBlurTest = () => {
    router.push('/BlurTestPage');
  };
  
  // Menu options
  const menuOptions = [
    { icon: 'text-outline', label: 'Text Note', action: () => console.log('Text note selected') },
    { icon: 'mic-outline', label: 'Voice Note', action: () => console.log('Voice note selected') },
    { icon: 'image-outline', label: 'Add Image', action: () => console.log('Add image selected') },
  ];
  
  // This would normally fetch from a database
  // For now, we'll use mock data similar to what's in Home.jsx
  const journalEntries = useMemo(() => [
    {
      id: '1',
      title: 'New Project Kickoff',
      date: 'Today',
      time: '9:30 AM',
      content: 'Started working on my new project. Feeling excited about the possibilities!',
      mood: 'happy',
      type: 'text',
      folderId: '2'
    },
    {
      id: '2',
      title: 'Dinner with Friends',
      date: 'Yesterday',
      time: '8:45 PM',
      content: 'Had dinner with friends. We talked about our future plans and shared some great memories.',
      mood: 'relaxed',
      type: 'voice',
      folderId: '1'
    },
    {
      id: '3',
      title: 'Autumn Walk',
      date: 'Nov 12, 2023',
      time: '3:20 PM',
      content: 'Went for a long walk in the park. The autumn colors were beautiful.',
      mood: 'peaceful',
      type: 'text',
      folderId: '1'
    },
  ], []);
  
  const entry = useMemo(() => {
    return journalEntries.find(entry => entry.id === id) || {
      id: '0',
      title: 'Journal Title',
      date: 'Today',
      time: '12:00 PM',
      content: 'Text asd agdf dfg asd...',
      mood: 'default',
      type: 'text',
      folderId: null
    };
  }, [id, journalEntries]);
  
  const getMoodIcon = (mood) => {
    switch(mood) {
      case 'happy': return 'sunny-outline';
      case 'sad': return 'rainy-outline';
      case 'angry': return 'thunderstorm-outline';
      case 'relaxed': return 'partly-sunny-outline';
      case 'peaceful': return 'moon-outline';
      default: return 'ellipse-outline';
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Simple black header without blur */}
          <View 
            className="bg-black"
            style={{ 
              borderBottomWidth: 1, 
              borderBottomColor: 'rgba(39, 39, 42, 0.8)',
            }}
          >
            {/* Header content */}
            <View className="px-4 py-3 flex-row items-center">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="mr-3"
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              {/* Center element with TextIcon, Journal Title, and chevron */}
              <View className="flex-1 flex-row justify-center">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={toggleMenu}
                >
                  <Image 
                    source={entry.type === 'voice' ? VoiceIcon : TextIcon} 
                    className="w-7 h-7 mr-2"
                    resizeMode="contain"
                  />
                  <Text className="text-white text-lg font-medium mr-2">{entry.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={{ width: 24 }}
                onPress={navigateToBlurTest}
              >
                <Ionicons name="pencil-outline" size={20} color="#a8a29e" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Journal Content */}
          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 10 }}>
            {/* Journal metadata */}
            <View className="mt-3 mb-4 flex-row items-center">
              <Text className="text-zinc-400 text-sm">{entry.date}</Text>
              <Text className="text-zinc-600 text-sm mx-1">•</Text>
              <Text className="text-zinc-400 text-sm">{entry.time}</Text>
              <Text className="text-zinc-600 text-sm mx-1">•</Text>
              <Ionicons name={getMoodIcon(entry.mood)} size={14} color="#a8a29e" />
            </View>
            
            {/* Main journal content */}
            <Text className="text-white text-base leading-6 mb-10">
              {entry.content}
            </Text>
            
           
          </ScrollView>
          
          {/* Menu Modal with backdrop - beautiful animations */}
          <Modal
            visible={isBlurred}
            transparent={true}
            animationType="none"
            onRequestClose={() => setIsBlurred(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={() => setIsBlurred(false)}
            >
              {/* Beautiful blur animation */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0, 
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  opacity: backdropOpacity,
                }}
              />
              
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0, 
                  right: 0,
                  bottom: 0,
                  opacity: blurAnim,
                }}
              >
                <BlurView
                  intensity={50}
                  tint="dark"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Animated.View>
              
              {/* Menu container - elegant animations */}
              <SafeAreaView className="flex-1">
                <Animated.View 
                  className="flex-1 justify-start items-center px-6 pt-20"
                  style={{
                    opacity: contentAnim,
                    transform: [
                      { translateY: translateYClose }, // Use only one translateY for simplicity
                      { scale },
                    ]
                  }}
                >
                  {/* Journal Title Container */}
                  <View className="w-full mb-8">
                    <View className="bg-zinc-800/80 rounded-full border border-zinc-700/50 px-5 py-2 flex-row items-center">
                      <TextInput
                        value={entry.title}
                        placeholder="Journal Title"
                        placeholderTextColor="#a8a29e"
                        className="text-white text-base font-medium flex-1"
                      />
                      <TouchableOpacity>
                        <Ionicons name="pencil" size={18} color="#a8a29e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Journal Type Options - Preloaded images */}
                  <View className="w-full space-y-5 mb-8">
                    {/* Text Journal Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => console.log('Selected Text Journal')}
                    >
                      <View className="mr-3">
                        <Image 
                          source={TextIcon} 
                          className="h-12 w-12"
                          resizeMode="contain"
                          // Add default placeholder color while loading
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Text Journal</Text>
                        <Text className="text-zinc-400 text-sm">Write to your journal</Text>
                      </View>
                      
                      {entry.type === 'text' ? (
                        <View className="bg-blue-500 rounded-full h-5 w-5 items-center justify-center">
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                    
                    {/* Voice Journal Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => console.log('Selected Voice Journal')}
                    >
                      <View className="mr-3">
                        <Image 
                          source={VoiceIcon} 
                          className="h-12 w-12"
                          resizeMode="contain"
                          // Add default placeholder color while loading
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Voice Journal</Text>
                        <Text className="text-zinc-400 text-sm">Speak to your journal</Text>
                      </View>
                      
                      {entry.type === 'voice' ? (
                        <View className="bg-green-500 rounded-full h-5 w-5 items-center justify-center">
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  </View>
                  
                  {/* Additional Options */}
                  <View className="w-full space-y-4 border-t border-zinc-800 pt-6">
                    {/* Move to Folder Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => console.log('Move to folder')}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="folder-outline" size={20} color="#a8a29e" />
                      </View>
                      <Text className="text-white text-base">Move to folder</Text>
                    </TouchableOpacity>
                    
                    {/* Share Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => console.log('Share journal')}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="share-outline" size={20} color="#a8a29e" />
                      </View>
                      <Text className="text-white text-base">Share journal</Text>
                    </TouchableOpacity>
                    
                    {/* Export Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => console.log('Export journal')}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="download-outline" size={20} color="#a8a29e" />
                      </View>
                      <Text className="text-white text-base">Export as PDF</Text>
                    </TouchableOpacity>
                    
                    {/* Delete Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => console.log('Delete journal')}
                    >
                      <View className="bg-red-900/30 rounded-full p-2 mr-3">
                        <Ionicons name="trash-outline" size={20} color="#f87171" />
                      </View>
                      <Text className="text-red-400 text-base">Delete journal</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </SafeAreaView>
            </TouchableOpacity>
          </Modal>
        </View>
      </SafeAreaView>
    </View>
  );
} 