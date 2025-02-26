import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  Modal, 
  FlatList, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  BackHandler,
  Easing
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Sample data for folders and journal entries (in a real app, this would come from a database or context)
const sampleFolders = [
  { id: '1', name: 'Personal', color: '#3b82f6' },
  { id: '2', name: 'Work', color: '#10b981' },
  { id: '3', name: 'Travel', color: '#f59e0b' },
  { id: '4', name: 'Ideas', color: '#8b5cf6' },
];

const sampleJournalEntries = [
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
  {
    id: '4',
    title: 'Project Ideas',
    date: 'Nov 10, 2023',
    time: '11:15 AM',
    content: 'Brainstormed some new project ideas. I think the AI journal concept has a lot of potential.',
    mood: 'happy',
    type: 'text',
    folderId: '4'
  },
  {
    id: '5',
    title: 'Client Meeting',
    date: 'Nov 8, 2023',
    time: '2:00 PM',
    content: 'Met with the client to discuss project requirements. They seem excited about our approach.',
    mood: 'relaxed',
    type: 'text',
    folderId: '2'
  },
];

// Sample AI responses for demo purposes
const sampleAIResponses = [
  "Based on your journal entries, you seem to enjoy outdoor activities most when you're with friends.",
  "I noticed you've been writing about work stress frequently in the past month. Consider trying meditation.",
  "Your mood tends to improve after social gatherings, according to your journal patterns.",
  "You've mentioned feeling creative in the mornings in several entries. Perhaps schedule creative tasks earlier in the day?",
  "Your journal shows you've been reading more books lately, which correlates with improved mood entries.",
  "I've observed that your journal entries are more positive on days when you exercise.",
  "You seem to write longer entries when discussing personal goals and aspirations.",
  "Based on your entries, you appear to be more productive on Tuesdays and Wednesdays.",
  "Your journal indicates you've been exploring new recipes recently. This coincides with more positive evening reflections.",
  "I've noticed a pattern of increased gratitude in your entries following family conversations."
];

export default function AskJournal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // In a real app, you would get this data from a context or database
  // For now, we'll use the sample data
  const folders = sampleFolders;
  const journalEntries = sampleJournalEntries;
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFolderFilter, setSearchFolderFilter] = useState(null);
  const [searchDateFilter, setSearchDateFilter] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // AI thinking state
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiResponse, setAIResponse] = useState('');
  const [showAIResponse, setShowAIResponse] = useState(false);
  
  // Animation values
  const blurAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const searchInputAnim = useRef(new Animated.Value(0)).current;
  
  // AI thinking animations
  const aiThinkingAnim = useRef(new Animated.Value(0)).current;
  const aiGlowAnim = useRef(new Animated.Value(0)).current;
  const aiGlowJSAnim = useRef(new Animated.Value(0)).current;
  const aiPulseAnim = useRef(new Animated.Value(1)).current;
  const aiRotateAnim = useRef(new Animated.Value(0)).current;
  
  // Derived animations
  const backdropOpacity = blurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  const translateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  
  const scale = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  
  const searchInputTranslateY = searchInputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  const searchInputScale = searchInputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  
  // AI thinking animation - pulsing effect
  const startAIThinkingAnimation = () => {
    // Reset animation values
    aiThinkingAnim.setValue(0);
    aiGlowAnim.setValue(0);
    aiGlowJSAnim.setValue(0);
    aiPulseAnim.setValue(1);
    aiRotateAnim.setValue(0);
    
    // Sequence of animations for thinking effect
    Animated.parallel([
      // Fade in the thinking UI
      Animated.timing(aiThinkingAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      
      // Glow effect - using JS animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(aiGlowJSAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
            easing: Easing.ease,
          }),
          Animated.timing(aiGlowJSAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: false,
            easing: Easing.ease,
          }),
        ])
      ),
      
      // Pulse effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(aiPulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(aiPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ])
      ),
      
      // Rotation effect for particles
      Animated.loop(
        Animated.timing(aiRotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ),
    ]).start();
  };
  
  // Stop AI thinking animation
  const stopAIThinkingAnimation = () => {
    // Fade out the thinking UI
    Animated.timing(aiThinkingAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(() => {
      // Stop all animations
      aiGlowJSAnim.stopAnimation();
      aiPulseAnim.stopAnimation();
      aiRotateAnim.stopAnimation();
    });
  };
  
  // Start animations when component mounts
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(blurAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.ease,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();
    
    // Animate search input with a spring effect for a bouncy feel
    Animated.spring(searchInputAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Set up keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );
    
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isKeyboardVisible) {
        Keyboard.dismiss();
        return true;
      } else {
        handleClose();
        return true;
      }
    });
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      backHandler.remove();
    };
  }, [isKeyboardVisible]);
  
  // Handle search submission with AI thinking animation
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Clear previous results and responses
    setSearchResults([]);
    setAIResponse('');
    setShowAIResponse(false);
    
    // Start AI thinking state and animation
    setIsSearching(true);
    setIsAIThinking(true);
    startAIThinkingAnimation();
    
    // Simulate AI processing delay (3-5 seconds)
    const thinkingTime = 3000 + Math.random() * 2000;
    
    setTimeout(() => {
      // First, find relevant journal entries
      const results = journalEntries.filter(entry => {
        // Check if entry matches search query
        const matchesQuery = 
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Check if entry matches folder filter
        const matchesFolder = 
          searchFolderFilter === null || entry.folderId === searchFolderFilter;
        
        // Check if entry matches date filter
        let matchesDate = true;
        if (searchDateFilter) {
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          switch (searchDateFilter) {
            case 'today':
              matchesDate = entry.date === 'Today';
              break;
            case 'yesterday':
              matchesDate = entry.date === 'Yesterday';
              break;
            case 'this_week':
              // Simple implementation - would need proper date handling in a real app
              matchesDate = entry.date === 'Today' || entry.date === 'Yesterday';
              break;
            case 'this_month':
              // Simple implementation - would need proper date handling in a real app
              matchesDate = true; // Assume all entries are from this month
              break;
            default:
              matchesDate = true;
          }
        }
        
        return matchesQuery && matchesFolder && matchesDate;
      });
      
      // Get a random AI response
      const randomResponse = sampleAIResponses[Math.floor(Math.random() * sampleAIResponses.length)];
      
      // Stop AI thinking animation
      stopAIThinkingAnimation();
      
      // Update state with results and AI response
      setTimeout(() => {
        setIsAIThinking(false);
        setAIResponse(randomResponse);
        setShowAIResponse(true);
        setSearchResults(results);
        setIsSearching(false);
      }, 500); // Small delay after animation stops
      
    }, thinkingTime);
  };
  
  // Clear search filters
  const clearSearchFilters = () => {
    setSearchFolderFilter(null);
    setSearchDateFilter(null);
  };
  
  // Handle closing the page with animation
  const handleClose = () => {
    // Animate closing
    Animated.parallel([
      // Animate content out
      Animated.timing(contentAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      
      // Animate search input out
      Animated.timing(searchInputAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      
      // Delay the blur fadeout slightly
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.ease,
        }),
      ]),
    ]).start(() => {
      router.back();
    });
  };
  
  // Render journal entry
  const renderJournalEntry = ({ item }) => {
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
    
    const getEntryTypeIcon = (type) => {
      switch(type) {
        case 'voice': return 'mic-outline';
        case 'image': return 'image-outline';
        default: return 'document-text-outline';
      }
    };
    
    const getFolderColor = (folderId) => {
      const folder = folders.find(f => f.id === folderId);
      return folder ? folder.color : '#a8a29e';
    };
    
    return (
      <TouchableOpacity 
        className="bg-zinc-900 rounded-xl p-4 mb-4"
        onPress={() => {
          // Close this page and navigate to the journal entry
          handleClose();
          // Add a small delay to ensure animations complete
          setTimeout(() => {
            router.push(`/JournalPage?id=${item.id}`);
          }, 300);
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-white text-lg font-medium">{item.title}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-zinc-500 text-xs">{item.date}</Text>
              <Text className="text-zinc-700 text-xs mx-1">•</Text>
              <Text className="text-zinc-500 text-xs">{item.time}</Text>
              <Text className="text-zinc-700 text-xs mx-1">•</Text>
              <Ionicons name={getMoodIcon(item.mood)} size={12} color="#a8a29e" />
            </View>
          </View>
          
          <View 
            className="w-8 h-8 rounded-full justify-center items-center"
            style={{ backgroundColor: `${getFolderColor(item.folderId)}20` }}
          >
            <Ionicons name={getEntryTypeIcon(item.type)} size={16} color={getFolderColor(item.folderId)} />
          </View>
        </View>
        
        <Text className="text-zinc-400 text-sm" numberOfLines={2}>
          {item.content}
        </Text>
        
        {item.folderId && (
          <View className="flex-row items-center mt-3">
            <View 
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: getFolderColor(item.folderId) }}
            />
            <Text className="text-zinc-500 text-xs">
              {folders.find(f => f.id === item.folderId)?.name || 'Folder'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // AI thinking component
  const AIThinkingComponent = () => (
    <Animated.View 
      style={{
        opacity: aiThinkingAnim,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Animated.View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(30, 30, 30, 0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: aiPulseAnim }],
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            opacity: aiGlowJSAnim,
          }}
        />
        
        <Animated.View
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(99, 102, 241, 0.2)',
            opacity: aiGlowJSAnim,
          }}
        />
        
        {/* Particles */}
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#6366f1',
              transform: [
                { 
                  translateX: aiRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.cos(Math.PI * 2 * (i / 6)) * 70],
                  }) 
                },
                { 
                  translateY: aiRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.sin(Math.PI * 2 * (i / 6)) * 70],
                  }) 
                },
                { scale: aiGlowJSAnim },
              ],
              opacity: aiGlowJSAnim,
            }}
          />
        ))}
        
        <Ionicons name="sparkles" size={40} color="#8b5cf6" />
      </Animated.View>
      
      <Text className="text-white text-lg font-medium mt-6">Thinking...</Text>
      <Text className="text-zinc-400 text-sm text-center mt-2">
        Analyzing your journal entries
      </Text>
    </Animated.View>
  );
  
  // AI response component
  const AIResponseComponent = () => (
    <Animated.View 
      className="bg-zinc-800/80 rounded-xl p-5 mb-6 border border-zinc-700/50"
      style={{
        opacity: showAIResponse ? 1 : 0,
      }}
    >
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center mr-3">
          <Ionicons name="sparkles" size={18} color="#a78bfa" />
        </View>
        <Text className="text-white text-lg font-medium">AI Insight</Text>
      </View>
      
      <Text className="text-zinc-300 leading-6">{aiResponse}</Text>
      
      <View className="mt-4 pt-3 border-t border-zinc-700/30">
        <Text className="text-zinc-500 text-xs">
          This is an AI-generated response based on your journal entries
        </Text>
      </View>
    </Animated.View>
  );
  
  return (
    <View className="flex-1 bg-black">
      {/* Dark overlay with animated opacity */}
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
      
      {/* Blur effect */}
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
      
      {/* Backdrop press handler */}
      <TouchableOpacity 
        activeOpacity={1}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
        onPress={() => {
          // First dismiss keyboard if visible, then close modal on second press
          if (isKeyboardVisible) {
            Keyboard.dismiss();
          } else {
            handleClose();
          }
        }}
      />
      
      {/* Modal content with animation */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, zIndex: 2 }}
      >
        <Animated.View 
          className="flex-1 justify-start items-center px-6 pt-10"
          style={{
            opacity: contentAnim,
            transform: [
              { translateY },
              { scale },
            ]
          }}
        >
          {/* Header with back button */}
          <View className="w-full flex-row items-center justify-between mb-6">
            <TouchableOpacity 
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-zinc-800 justify-center items-center"
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View className="flex-1 items-center">
              <Text className="text-white text-xl font-bold text-center">Ask Your Journal</Text>
            </View>
            
            <View style={{ width: 40 }} />
          </View>
          
          {/* Animated Search Input */}
          <Animated.View 
            className="w-full mb-6"
            style={{
              opacity: searchInputAnim,
              transform: [
                { translateY: searchInputTranslateY },
                { scale: searchInputScale }
              ]
            }}
          >
            <LinearGradient
              colors={['#44403c', '#78716c', '#a8a29e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-full p-[1.5px]"
            >
              <View className="flex-row items-center bg-[#1C1C1E] rounded-full px-4 py-3.5">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="What would you like to know?"
                  placeholderTextColor="#a8a29e"
                  className="flex-1 text-base text-gray-200 mr-2"
                  autoFocus={true}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity
                  className="bg-transparent"
                  activeOpacity={0.7}
                  onPress={handleSearch}
                >
                  <LinearGradient
                    colors={['#44403c', '#78716c', '#a8a29e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-full p-2"
                  >
                    <Ionicons name="search" size={20} color="#1C1C1E" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* Filter Options */}
          <View className="w-full mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-zinc-400 text-sm">Filter your search</Text>
              {(searchFolderFilter || searchDateFilter) && (
                <TouchableOpacity onPress={clearSearchFilters}>
                  <Text className="text-blue-400 text-sm">Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Folder Filter */}
            <View className="mb-4">
              <Text className="text-zinc-500 text-xs mb-2">Folders</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                <TouchableOpacity 
                  className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${searchFolderFilter === null ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                  onPress={() => setSearchFolderFilter(null)}
                >
                  <Ionicons name="albums-outline" size={16} color="#d6d3d1" style={{ marginRight: 6 }} />
                  <Text className="text-white text-sm">All Folders</Text>
                </TouchableOpacity>
                
                {folders.map(folder => (
                  <TouchableOpacity 
                    key={folder.id}
                    className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${searchFolderFilter === folder.id ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                    onPress={() => setSearchFolderFilter(folder.id)}
                    style={searchFolderFilter === folder.id ? { borderLeftWidth: 3, borderLeftColor: folder.color, paddingLeft: 8 } : {}}
                  >
                    <View 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: folder.color }}
                    />
                    <Text className="text-white text-sm">{folder.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Date Filter */}
            <View>
              <Text className="text-zinc-500 text-xs mb-2">Time Period</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                <TouchableOpacity 
                  className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${searchDateFilter === null ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                  onPress={() => setSearchDateFilter(null)}
                >
                  <Ionicons name="time-outline" size={16} color="#d6d3d1" style={{ marginRight: 6 }} />
                  <Text className="text-white text-sm">All Time</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${searchDateFilter === 'today' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                  onPress={() => setSearchDateFilter('today')}
                >
                  <Text className="text-white text-sm">Today</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${searchDateFilter === 'yesterday' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                  onPress={() => setSearchDateFilter('yesterday')}
                >
                  <Text className="text-white text-sm">Yesterday</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${searchDateFilter === 'this_week' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                  onPress={() => setSearchDateFilter('this_week')}
                >
                  <Text className="text-white text-sm">This Week</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${searchDateFilter === 'this_month' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                  onPress={() => setSearchDateFilter('this_month')}
                >
                  <Text className="text-white text-sm">This Month</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="mr-2 px-3 py-2 rounded-lg flex-row items-center bg-zinc-800/60"
                  onPress={() => console.log('Custom date range')}
                >
                  <Ionicons name="calendar-outline" size={16} color="#d6d3d1" style={{ marginRight: 6 }} />
                  <Text className="text-blue-400 text-sm">Custom Range</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
          
          {/* Search Results */}
          <View className="w-full flex-1">
            {isSearching ? (
              <View className="flex-1 justify-center items-center py-10">
                {isAIThinking ? (
                  <AIThinkingComponent />
                ) : (
                  <>
                    <Ionicons name="search" size={40} color="#4a4a4a" />
                    <Text className="text-gray-400 mt-4 text-base font-medium">
                      Searching your journal...
                    </Text>
                  </>
                )}
              </View>
            ) : searchQuery.trim() ? (
              <>
                {showAIResponse && <AIResponseComponent />}
                
                {searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderJournalEntry}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListHeaderComponent={
                      <Text className="text-white text-lg font-medium mb-4">
                        Related Entries ({searchResults.length})
                      </Text>
                    }
                  />
                ) : (
                  <View className="flex-1 justify-center items-center py-10">
                    <Ionicons name="search-outline" size={40} color="#4a4a4a" />
                    <Text className="text-gray-400 mt-4 text-base font-medium">
                      No journal entries found
                    </Text>
                    <Text className="text-gray-600 text-center mt-2 px-10 text-sm">
                      Try different keywords or filters
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="chatbubble-ellipses-outline" size={40} color="#4a4a4a" />
                <Text className="text-gray-400 mt-4 text-base font-medium">
                  Ask your journal anything
                </Text>
                <Text className="text-gray-600 text-center mt-2 px-10 text-sm">
                  Search for memories, thoughts, or specific entries
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
} 