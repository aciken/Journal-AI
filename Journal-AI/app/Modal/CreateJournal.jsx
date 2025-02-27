import { View, TextInput, SafeAreaView, TouchableOpacity, Text, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function CreateJournal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [newJournalName, setNewJournalName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(params.folderId || null);
  const { height } = Dimensions.get('window');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Parse folders from params
  const folders = JSON.parse(params.folders || '[]');
  
  // Animate in when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const templates = [
    { id: 'blank', name: 'Blank', icon: 'document-outline', description: 'Start with a clean slate', color: '#3b82f6' },
    { id: 'daily', name: 'Daily', icon: 'today-outline', description: 'Record your day', color: '#10b981' },
    { id: 'gratitude', name: 'Gratitude', icon: 'heart-outline', description: 'What are you thankful for?', color: '#f59e0b' },
    { id: 'ideas', name: 'Ideas', icon: 'bulb-outline', description: 'Capture your thoughts', color: '#8b5cf6' }
  ];
  
  // In a real app, this would be a global state or context
  // For this demo, we'll use a mock function to simulate adding to the journal entries
  const addJournalEntry = (newEntry) => {
    // In a real app, this would update a global state or make an API call
    // For now, we'll just navigate to the journal page
    
    // First go back to the home screen
    router.back();
    
    // Then navigate to the journal page with a slight delay
    // This ensures the home screen is fully loaded before navigating
    setTimeout(() => {
      router.push({
        pathname: "/JournalPage",
        params: { id: newEntry.id }
      });
    }, 100);
  };
  
  const confirmJournalCreation = () => {
    if (!newJournalName.trim()) {
      return; // Don't proceed if name is empty
    }
    
    // Create a new journal entry
    const newEntry = {
      id: Date.now().toString(),
      title: newJournalName.trim(),
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '',
      mood: 'default',
      folderId: selectedFolder,
      template: selectedTemplate || 'blank'
    };
    
    // In a real app, we would update a global state or context here
    // For this demo, we'll use our mock function
    addJournalEntry(newEntry);
  };
  
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View className="flex-1 justify-center items-center">
              <Animated.View 
                className="bg-black rounded-3xl overflow-hidden w-full max-w-md"
                style={{ 
                  maxHeight: height * 0.85,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.5,
                  shadowRadius: 15,
                  elevation: 10,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }}
              >
                {/* Header */}
                <View className="bg-black px-5 pt-5 pb-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white text-xl font-semibold">New Journal</Text>
                    <TouchableOpacity 
                      className="bg-zinc-800/80 rounded-full p-2.5"
                      onPress={() => router.back()}
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 3,
                      }}
                    >
                      <Ionicons name="close" size={20} color="#e4e4e7" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <ScrollView 
                  className="max-h-[500px]"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <View className="px-5 pb-3">
                    {/* Journal Name Input */}
                    <View className="mb-5">
                      <Text className="text-zinc-300 text-base font-medium mb-2.5">Journal Name</Text>
                      <View className="bg-zinc-900 rounded-xl px-4 py-3.5 mb-1 border border-zinc-800">
                        <TextInput
                          value={newJournalName}
                          onChangeText={setNewJournalName}
                          placeholder="Enter journal name"
                          placeholderTextColor="#71717a"
                          className="text-white text-base"
                          maxLength={50}
                        />
                      </View>
                      <View className="flex-row justify-between items-center mt-1.5">
                        <Text className="text-zinc-500 text-xs">Give your journal a meaningful name</Text>
                        <Text className={`text-xs ${newJournalName.length > 40 ? 'text-amber-500' : 'text-zinc-500'}`}>
                          {newJournalName.length}/50
                        </Text>
                      </View>
                    </View>
                    
                    {/* Template Selection */}
                    <View className="mb-5">
                      <Text className="text-zinc-300 text-base font-medium mb-3.5">Choose Template</Text>
                      <View className="flex-row flex-wrap justify-between">
                        {templates.map((template) => (
                          <TouchableOpacity
                            key={template.id}
                            className={`mb-4 p-4 rounded-xl ${
                              selectedTemplate === template.id 
                                ? 'bg-blue-900/20' 
                                : 'bg-zinc-900'
                            }`}
                            onPress={() => setSelectedTemplate(template.id)}
                            style={{ 
                              width: '48%',
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 3 },
                              shadowOpacity: 0.2,
                              shadowRadius: 3,
                              elevation: 3
                            }}
                          >
                            <View className="items-center">
                              <View className="w-12 h-12 rounded-full items-center justify-center mb-3" 
                                style={{ backgroundColor: `${template.color}20` }}>
                                <View className="w-9 h-9 rounded-full items-center justify-center"
                                  style={{ backgroundColor: `${template.color}30` }}>
                                  <Ionicons name={template.icon} size={22} color={template.color} />
                                </View>
                              </View>
                              <Text className="text-white font-medium text-base">{template.name}</Text>
                              <Text className="text-zinc-500 text-xs text-center mt-1">{template.description}</Text>
                              {selectedTemplate === template.id && (
                                <View className="absolute top-1 right-1">
                                  <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    {/* Folder Selection */}
                    <View className="mb-4">
                      <Text className="text-zinc-300 text-base font-medium mb-3.5">Select Folder</Text>
                      <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false} 
                          className="py-1"
                          contentContainerStyle={{ paddingRight: 12 }}
                        >
                          <TouchableOpacity
                            className={`mr-3 px-4 py-3 rounded-lg flex-row items-center ${
                              selectedFolder === null 
                                ? 'bg-zinc-800' 
                                : 'bg-zinc-800/70'
                            }`}
                            onPress={() => setSelectedFolder(null)}
                            style={{ 
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 2,
                            }}
                          >
                            <Ionicons name="albums-outline" size={16} color="#d6d3d1" className="mr-2" />
                            <Text className="text-white font-medium">None</Text>
                          </TouchableOpacity>
                          
                          {folders.map((folder) => (
                            <TouchableOpacity
                              key={folder.id}
                              className={`mr-3 px-4 py-3 rounded-lg flex-row items-center ${
                                selectedFolder === folder.id 
                                  ? 'bg-zinc-800' 
                                  : 'bg-zinc-800/70'
                              }`}
                              onPress={() => setSelectedFolder(folder.id)}
                              style={{ 
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                              }}
                            >
                              <View
                                className="w-3.5 h-3.5 rounded-full mr-2.5"
                                style={{ backgroundColor: folder.color }}
                              />
                              <Text className="text-white font-medium">{folder.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                
                {/* Action Button */}
                <View className="bg-black px-5 py-4">
                  <TouchableOpacity
                    className={`py-4 rounded-xl ${
                      newJournalName.trim() 
                        ? 'bg-blue-600' 
                        : 'bg-zinc-800'
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
                    <Text className="text-white text-center font-semibold text-base">
                      Create Journal
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
    </View>
  );
} 