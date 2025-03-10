import { View, TextInput, SafeAreaView, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGlobalContext } from '../Context/GlobalProvider';

// Cover designs using gradients instead of image patterns
const COVER_DESIGNS = [
  { 
    id: 'blue', 
    name: 'Ocean', 
    color: '#3b82f6',
    gradientColors: ['#3b82f6', '#1d4ed8']
  },
  { 
    id: 'purple', 
    name: 'Twilight', 
    color: '#8b5cf6',
    gradientColors: ['#8b5cf6', '#6d28d9'] 
  },
  { 
    id: 'pink', 
    name: 'Sunset', 
    color: '#ec4899',
    gradientColors: ['#ec4899', '#be185d'] 
  },
  { 
    id: 'green', 
    name: 'Forest', 
    color: '#10b981',
    gradientColors: ['#10b981', '#047857'] 
  },
  { 
    id: 'amber', 
    name: 'Autumn', 
    color: '#f59e0b',
    gradientColors: ['#f59e0b', '#d97706'] 
  },
];

export default function CreateJournal() {
  const { setUser, user } = useGlobalContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [newJournalName, setNewJournalName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(params.folderId || null);
  const { height, width } = Dimensions.get('window');
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  
  // Predefined folder colors - 10 distinct colors
  const folderColors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6366f1'  // Indigo
  ];
  
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      setUser(JSON.parse(userData));
    };
    fetchUser();
  }, []);
  
  // Fetch user data and folders from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          // Check if user has folders property and it's an array
          if (user.folders && Array.isArray(user.folders)) {
            // Assign colors to folders based on their index
            const foldersWithColors = user.folders.map((folder, index) => {
              // Use the folder's existing color or assign one based on index
              const colorIndex = index % folderColors.length;
              return {
                ...folder,
                color: folder.color || folderColors[colorIndex]
              };
            });
            setFolders(foldersWithColors);
          } else {
            // Default empty folders array if not found
            setFolders([]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setFolders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
  // Animate in when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate input focus
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);
  
  const confirmJournalCreation = () => {
    if (!newJournalName.trim()) {
      return; // Don't proceed if name is empty
    }
    
    // Create a new journal entry
    const newEntry = {
      id: Date.now().toString(),
      title: newJournalName.trim(),
      date: new Date().toISOString(),
      content: '',
      folderId: selectedFolder,
      lastUpdated: new Date().toISOString()
    };

    axios.put('https://a68e-109-245-199-118.ngrok-free.app/addjournal', {
      userId: user._id,
      journal: newEntry
    }).then((response) => {
      AsyncStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      router.back();
    }).catch((error) => {
      console.log(error);
    });
  };

  // Get folder color - either from the folder object or from our predefined colors
  const getFolderColor = (folder, index) => {
    if (folder.color) return folder.color;
    return folderColors[index % folderColors.length];
  };
  
  // Get the border color for the input based on animation
  const getInputBorderColor = () => {
    return inputFocusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(63, 63, 70, 0.5)', 'rgba(59, 130, 246, 0.5)']
    });
  };
  
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
        className="absolute inset-0"
      />
      
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <Animated.View 
            className="flex-1"
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {/* Header */}
            <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
              <View>
                <Text className="text-zinc-400 text-sm font-medium">NEW</Text>
                <Text className="text-white text-3xl font-bold">Journal</Text>
              </View>
              <TouchableOpacity 
                className="bg-zinc-800/80 rounded-full p-3"
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={24} color="#e4e4e7" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* Journal Name Input with animated focus */}
              <View className="mt-8 mb-10">
                <Text className="text-zinc-300 text-xl font-semibold mb-3">
                  What will you call your journal?
                </Text>
                
                <Animated.View
                  style={{
                    borderColor: getInputBorderColor(),
                    borderWidth: 1,
                    borderRadius: 16,
                    backgroundColor: 'rgba(39, 39, 42, 0.6)',
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5
                  }}
                >
                  <TextInput
                    value={newJournalName}
                    onChangeText={setNewJournalName}
                    placeholder="Enter journal name"
                    placeholderTextColor="#71717a"
                    className="text-white text-xl px-5 py-5"
                    maxLength={50}
                    autoFocus={true}
                    onFocus={() => {
                      Animated.timing(inputFocusAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                      }).start();
                    }}
                    onBlur={() => {
                      Animated.timing(inputFocusAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: false,
                      }).start();
                    }}
                  />
                </Animated.View>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-zinc-400 text-sm">
                    Give your journal a meaningful name
                  </Text>
                  <Text className={`text-sm ${newJournalName.length > 40 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {newJournalName.length}/50
                  </Text>
                </View>
              </View>
              
              {/* Quick Suggestions */}
              <View className="mb-10">
                <Text className="text-zinc-400 text-base font-medium mb-3">Suggestions</Text>
                <View className="flex-row flex-wrap">
                  {["Daily Reflections", "Gratitude Journal", "My Thoughts", "Dream Journal"].map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      className="bg-zinc-800/60 rounded-full px-4 py-2 mr-2 mb-2"
                      onPress={() => setNewJournalName(suggestion)}
                    >
                      <Text className="text-zinc-300">{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Folder Selection */}
              <View className="mb-10">
                <Text className="text-zinc-300 text-xl font-semibold mb-3">
                  Where would you like to save it?
                </Text>
                
                {isLoading ? (
                  <View className="bg-zinc-800/60 rounded-2xl p-6 items-center">
                    <Text className="text-zinc-400 text-base">Loading folders...</Text>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      className={`mb-4 px-5 py-4 rounded-xl flex-row items-center ${
                        selectedFolder === null 
                          ? 'bg-blue-500/20 border border-blue-500/40' 
                          : 'bg-zinc-800/60 border border-zinc-800/40'
                      }`}
                      onPress={() => setSelectedFolder(null)}
                      style={{ 
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5
                      }}
                    >
                      <Ionicons 
                        name="library-outline" 
                        size={22} 
                        color={selectedFolder === null ? "#60a5fa" : "#d6d3d1"} 
                        style={{ marginRight: 12 }} 
                      />
                      <View>
                        <Text 
                          className={`font-medium text-lg ${
                            selectedFolder === null ? 'text-blue-300' : 'text-white'
                          }`}
                        >
                          Main Library
                        </Text>
                        <Text className="text-zinc-500 text-sm">
                          Default location for all journals
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    {folders.map((folder, index) => {
                      const folderColor = getFolderColor(folder, index);
                      const isSelected = selectedFolder === folder.id;
                      return (
                        <TouchableOpacity
                          key={folder.id}
                          className={`mb-4 px-5 py-4 rounded-xl flex-row items-center ${
                            isSelected
                              ? `border border-opacity-40`
                              : 'bg-zinc-800/60 border border-zinc-800/40'
                          }`}
                          style={{
                            backgroundColor: isSelected ? `${folderColor}20` : undefined,
                            borderColor: isSelected ? folderColor : undefined,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 5
                          }}
                          onPress={() => setSelectedFolder(folder.id)}
                        >
                          <View
                            className="w-5 h-5 rounded-full mr-3"
                            style={{ backgroundColor: folderColor }}
                          />
                          <View>
                            <Text 
                              className="font-medium text-lg"
                              style={{ color: isSelected ? folderColor : '#ffffff' }}
                            >
                              {folder.title || folder.name}
                            </Text>
                            <Text className="text-zinc-500 text-sm">
                              {folder.description || `${folder.journals?.length || 0} journals`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    
                    {folders.length === 0 && (
                      <View className="bg-zinc-800/40 rounded-2xl p-6 items-center">
                        <Ionicons name="folder-outline" size={40} color="#71717a" className="mb-2" />
                        <Text className="text-zinc-400 text-base text-center">
                          You don't have any folders yet.
                        </Text>
                        <Text className="text-zinc-500 text-sm text-center mt-1">
                          Your journal will be saved in the main library.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
            
            {/* Create Button - Fixed at bottom with gradient */}
            <View className="absolute bottom-0 left-0 right-0">
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
                className="pt-10 pb-6 px-6"
              >
                <TouchableOpacity
                  className={`py-4 rounded-xl ${
                    newJournalName.trim() 
                      ? 'bg-blue-600' 
                      : 'bg-zinc-700'
                  }`}
                  onPress={confirmJournalCreation}
                  disabled={!newJournalName.trim()}
                  style={{ 
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 5
                  }}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    Create Journal
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
} 