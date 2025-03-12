import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Image, Animated, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import JournalIcon from '../../assets/Icons/TextIcon.png';
import { Easing } from 'react-native';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { format } from 'date-fns';
import { useGlobalContext } from '../Context/GlobalProvider';

export default function JournalPage() {
  const { user,setUser } = useGlobalContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  
  console.log('JournalPage - Received ID:', id, 'Type:', typeof id);
  
  const [isBlurred, setIsBlurred] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [entry, setEntry] = useState({
    id: '',
    title: '',
    content: '',
    date: '',
    time: '',
    lastUpdated: new Date().toISOString()
  });
  const [journalContent, setJournalContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [contentChanged, setContentChanged] = useState(false);
  
  // Enhanced animations - simplified for elegance
  const blurAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const addMenuBlurAnim = useRef(new Animated.Value(0)).current;
  const addMenuContentAnim = useRef(new Animated.Value(0)).current;
  
  // Add a new animated value for the button
  const [buttonAnimation] = useState(new Animated.Value(0));
  
  // Fetch journal entry from AsyncStorage
  useEffect(() => {
    const fetchJournalEntry = async () => {
      try {
        setIsLoading(true);
        // Make sure we have a valid ID
        const journalId = id?.toString();
        console.log('Fetching journal entry with ID:', journalId, 'Type:', typeof journalId);
        
        if (!journalId) {
          console.log('No journal ID provided');
          setIsLoading(false);
          return;
        }
        
        const userData = await AsyncStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log('User data retrieved, looking for journal entry');
          
          // Look for the journal entry in user.Journal
          if (user.Journal && Array.isArray(user.Journal)) {
            console.log('Found Journal array with', user.Journal.length, 'entries');
            console.log('Journal IDs:', user.Journal.map(j => `${j.id} (${typeof j.id})`).join(', '));
            
            // Find the journal entry by ID - try different comparison methods
            let foundEntry = null;
            
            // First try exact match
            foundEntry = user.Journal.find(journal => journal.id === journalId);
            console.log('Exact match result:', foundEntry ? 'Found' : 'Not found');
            
            // If not found, try string comparison
            if (!foundEntry) {
              foundEntry = user.Journal.find(journal => String(journal.id) === String(journalId));
              console.log('String comparison result:', foundEntry ? 'Found' : 'Not found');
            }
            
            // If still not found, try loose comparison
            if (!foundEntry) {
              foundEntry = user.Journal.find(journal => journal.id == journalId);
              console.log('Loose comparison result:', foundEntry ? 'Found' : 'Not found');
            }
            
            // If still not found, try numeric comparison (in case IDs are numbers stored as strings)
            if (!foundEntry) {
              const numericId = Number(journalId);
              if (!isNaN(numericId)) {
                foundEntry = user.Journal.find(journal => Number(journal.id) === numericId);
                console.log('Numeric comparison result:', foundEntry ? 'Found' : 'Not found');
              }
            }
            
            if (foundEntry) {
              console.log('Found journal entry:', foundEntry);
              // Format date and time for display
              let displayDate = 'Unknown date';
              let displayTime = '';
              
              try {
                if (foundEntry.date) {
                  const journalDate = new Date(foundEntry.date);
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  
                  // Check if the date is today or yesterday
                  if (journalDate.toDateString() === today.toDateString()) {
                    displayDate = 'Today';
                  } else if (journalDate.toDateString() === yesterday.toDateString()) {
                    displayDate = 'Yesterday';
                  } else {
                    // Format as Month Day, Year
                    displayDate = journalDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }
                  
                  // Format time as HH:MM AM/PM
                  displayTime = journalDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                }
              } catch (e) {
                console.log('Error formatting date:', e);
              }
              
              // Set the entry with formatted date and time
              const updatedEntry = {
                ...foundEntry,
                displayDate: displayDate,
                time: displayTime,
              };
              
              console.log('Setting entry state:', updatedEntry);
              setEntry(updatedEntry);
              
              // Set the journal content for editing
              console.log('Setting journal content:', foundEntry.content);
              setJournalContent(foundEntry.content || '');
            } else {
              console.log('Journal entry not found with ID:', journalId);
              console.log('Available IDs:', user.Journal.map(j => j.id).join(', '));
              
              // Set default values if entry not found
              setEntry({
                id: journalId,
                title: 'New Journal Entry',
                content: '',
                date: format(new Date(), 'MMM d, yyyy'),
                time: format(new Date(), 'h:mm a'),
                lastUpdated: new Date().toISOString()
              });
              setJournalContent('');
            }
          } else {
            console.log('No journal entries found in user data');
          }
        } else {
          console.log('No user data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching journal entry:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJournalEntry();
  }, [id]);
  
  // Save journal content to AsyncStorage
  const saveJournalContent = async () => {
    try {
      setIsSaving(true);
      // Make sure we have a valid ID
      const journalId = id?.toString();
      console.log('Saving journal content for ID:', journalId);
      
      if (!journalContent.trim()) {
        console.log('Journal content is empty, not saving');
        setIsSaving(false);
        return;
      }
      
      if (!journalId) {
        console.log('No journal ID provided for saving');
        setIsSaving(false);
        return;
      }
      
      const userData = await AsyncStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data retrieved for saving');
        
        // Update the journal entry in user.Journal
        if (user.Journal && Array.isArray(user.Journal)) {
          console.log('Found Journal array with', user.Journal.length, 'entries');
          console.log('Looking for journal with ID:', journalId);
          
          // Check if the journal entry exists - try different comparison methods
          let journalIndex = user.Journal.findIndex(journal => journal.id === journalId);
          
          if (journalIndex === -1) {
            journalIndex = user.Journal.findIndex(journal => String(journal.id) === String(journalId));
          }
          
          if (journalIndex === -1) {
            journalIndex = user.Journal.findIndex(journal => journal.id == journalId);
          }
          
          if (journalIndex === -1) {
            const numericId = Number(journalId);
            if (!isNaN(numericId)) {
              journalIndex = user.Journal.findIndex(journal => Number(journal.id) === numericId);
            }
          }
          
          if (journalIndex !== -1) {
            console.log('Found journal at index:', journalIndex);
            
            // Create updated journal entry
            const updatedJournal = {
              ...user.Journal[journalIndex],
              content: journalContent,
              lastUpdated: new Date().toISOString()
            };
            
            console.log('Updating journal with new content:', updatedJournal.content.substring(0, 50) + '...');
            
            // Update the journal in the array
            user.Journal[journalIndex] = updatedJournal;
            
            // Save updated user data to AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(user));
            
            // Update entry state
            setEntry(prev => ({
              ...prev,
              content: journalContent,
              lastUpdated: new Date().toISOString()
            }));
            
            console.log('Journal content saved successfully');
          } else {
            console.log('Journal entry not found for saving, ID:', journalId);
            console.log('Available journal IDs:', user.Journal.map(j => j.id).join(', '));
          }
        } else {
          console.log('No Journal array found in user data for saving');
        }
      } else {
        console.log('No user data found in AsyncStorage for saving');
      }
    } catch (error) {
      console.error('Error saving journal content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveJournalServer = async () => {
    try {
      // Safely parse user data if it's a string, or use it directly if it's already an object
      const userData = typeof user === 'string' ? JSON.parse(user) : user;
      
      // Check if userData exists and has _id property
      if (!userData || !userData._id) {
        console.error('Invalid user data for saving to server');
        return;
      }
      
      console.log(userData._id, id, journalContent);
      const response = await axios.put('https://eb3f-109-245-199-118.ngrok-free.app/savejournal', {
        userId: userData._id,
        journalId: id,
        content: journalContent
      });
      console.log('Journal content saved on server:', response.data);
    } catch (error) {
      console.error('Error saving journal content on server:', error);
    }
  };
  


  
  // Auto-save when leaving the page
  useEffect(() => {
    return () => {
      if (journalContent !== entry.content) {
        console.log('Auto-saving journal content before unmounting');
        saveJournalContent();
      }
    };
  }, [journalContent, entry.content, id]);
  
  // Preload icons to prevent loading delay
  useEffect(() => {
    const preloadIcons = async () => {
      try {
        // Preload the icon images
        await Asset.loadAsync([JournalIcon]);
        setIconsLoaded(true);
      } catch (error) {
        console.error("Failed to preload icons:", error);
        // Set loaded anyway to not block the UI
        setIconsLoaded(true);
      }
    };
    
    preloadIcons();
  }, []);
  
  // Elegant animation sequence - only for opening now
  useEffect(() => {
    // Only handle opening animation here
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
    }
    // Closing is now handled in toggleMenu and modal handlers
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
    // If we're about to open the menu, ensure animations are reset and open immediately
    if (!isBlurred) {
      blurAnim.setValue(0);
      contentAnim.setValue(0);
      setIsBlurred(true);
    } else {
      // For closing, animate first, then update state
      // Use parallel for more immediate visual feedback
      Animated.parallel([
        // Animate content out with more dramatic movement
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 250,
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
        // Only update state after animation completes
        setIsBlurred(false);
      });
    }
  };
  
  // Toggle add menu function with animation
  const toggleAddMenu = () => {
    if (!showAddMenu) {
      // Reset animation values for opening
      addMenuBlurAnim.setValue(0);
      addMenuContentAnim.setValue(0);
      setShowAddMenu(true);
      
      // Open animation - start blur immediately
      Animated.timing(addMenuBlurAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
      
      // Then bring in the content
      Animated.timing(addMenuContentAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      // For closing, animate first, then update state
      Animated.parallel([
        // Animate content out
        Animated.timing(addMenuContentAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        
        // Delay the blur fadeout slightly
        Animated.sequence([
          Animated.delay(50),
          Animated.timing(addMenuBlurAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.in(Easing.ease),
          }),
        ]),
      ]).start(() => {
        setShowAddMenu(false);
      });
    }
  };
  
  // Derived animations for add menu
  const addMenuScale = addMenuContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  
  const addMenuTranslateY = addMenuContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  // Background opacity for add menu
  const addMenuBackdropOpacity = addMenuBlurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
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

  const handleContentChange = (text) => {
    setJournalContent(text);
    // Only show button if content is different from original
    if (text !== entry?.content) {
      setContentChanged(true);
      // Animate button in
      Animated.spring(buttonAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 40
      }).start();
      console.log("Content changed, showing save button");
    } else {
      setContentChanged(false);
      // Animate button out
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
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
            <View className="px-4 py-3 flex-row items-center justify-between">
              <TouchableOpacity 
                onPress={() => {
                  // Save content before navigating back
                  const journalId = id?.toString();
                  
                  // Safely parse user data if it's a string, or use it directly if it's already an object
                  try {
                    const userData = typeof user === 'string' ? JSON.parse(user) : user;
                    if (userData && userData._id) {
                      console.log(userData._id);
                    } else {
                      console.log('No valid user data found');
                    }
                  } catch (error) {
                    console.error('Error parsing user data:', error);
                  }
                  
                  console.log('aaaa',journalId, journalContent, entry.content)
                  // Normalize both strings for comparison (trim whitespace and handle null/undefined)
                  const normalizedJournalContent = (journalContent || '').trim();
                  const normalizedEntryContent = (entry?.content || '').trim();
                  
                  // Log the normalized values for debugging
                  console.log('Normalized comparison:', 
                    `journalContent: "${normalizedJournalContent.substring(0, 20)}..."`, 
                    `entry.content: "${normalizedEntryContent.substring(0, 20)}..."`
                  );
                  
                  if (journalId && normalizedJournalContent !== normalizedEntryContent) {
                    console.log('Saving content before navigating back');
                    // Use async/await with a timeout to ensure content is saved
                    console.log('back button pressed');
                    (async () => {
                      setIsSaving(true);
                      await saveJournalContent();
                      await saveJournalServer();
                      setTimeout(() => {
                        router.back();
                      }, 300);
                    })();
                  } else {
                    console.log('No changes detected or missing journalId, navigating back without saving');
                    router.back();
                  }
                }}
                className="mr-3"
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              {/* Center element with Journal Icon, Journal Title, and chevron */}
              <View className="flex-1 flex-row justify-center">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={toggleMenu}
                >
                  <Image 
                    source={JournalIcon} 
                    style={{ width: 18, height: 18, tintColor: '#fff' }} 
                    className="mr-2"
                  />
                  <Text className="text-white font-medium mr-1">
                    {entry?.title || 'Journal Entry'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#71717a" />
                </TouchableOpacity>
              </View>
              
              {/* Save Button - Fixed width container to prevent layout shifts */}
              <View className="flex-row items-center" style={{ minWidth: 70, justifyContent: 'flex-end' }}>
                {contentChanged ? (
                  <Animated.View
                    style={{
                      transform: [
                        { scale: buttonAnimation }
                      ],
                      opacity: buttonAnimation,
                      position: 'absolute',
                      right: 40
                    }}
                  >
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => {
                        console.log("Save button pressed");
                        saveJournalContent();
                        // Animate button out after saving
                        Animated.timing(buttonAnimation, {
                          toValue: 0,
                          duration: 200,
                          useNativeDriver: true
                        }).start(() => setContentChanged(false));
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text className="text-white font-medium">Save</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ) : null}
                
                {/* Plus button */}
                <TouchableOpacity
                  onPress={toggleAddMenu}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="add" size={24} color="#a8a29e" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Journal Content */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-white text-lg">Loading journal...</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 10 }}>
              {/* Journal metadata */}
              <View className="mt-3 mb-4 flex-row items-center">
                <Text className="text-zinc-400 text-sm">{entry.displayDate || entry.date}</Text>
                <Text className="text-zinc-600 text-sm mx-1">•</Text>
                <Text className="text-zinc-400 text-sm">{entry.time}</Text>
                <Text className="text-zinc-600 text-sm mx-1">•</Text>
                <Ionicons name={getMoodIcon(entry.mood)} size={14} color="#a8a29e" />
                {isSaving && (
                  <Text className="text-zinc-400 text-xs ml-2">Saving...</Text>
                )}
              </View>
              
              {/* Main journal content - editable */}
              <TextInput
                className="text-white text-base leading-6 mb-10"
                multiline={true}
                value={journalContent}
                onChangeText={handleContentChange}
                placeholder="Start writing your thoughts here..."
                placeholderTextColor="#71717a"
                style={{ minHeight: 300 }}
                autoFocus={false}
                onBlur={() => {
                  console.log('Saving journal content on blur');
                  saveJournalContent();
                }}
              />
            </ScrollView>
          )}
          
          {/* Menu Modal with backdrop - beautiful animations */}
          <Modal
            visible={isBlurred}
            transparent={true}
            animationType="none"
            onRequestClose={() => {
              // Handle back button press with animation
              if (isBlurred) {
                Animated.parallel([
                  // Animate content out with more dramatic movement
                  Animated.timing(contentAnim, {
                    toValue: 0,
                    duration: 250,
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
                  // Only update state after animation completes
                  setIsBlurred(false);
                });
                return true;
              }
              return false;
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={() => {
                // Animate closing when backdrop is pressed
                Animated.parallel([
                  // Animate content out with more dramatic movement
                  Animated.timing(contentAnim, {
                    toValue: 0,
                    duration: 250,
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
                  // Only update state after animation completes
                  setIsBlurred(false);
                });
              }}
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
                  
                  {/* Journal Options - Simplified to a single journal type */}
                  <View className="w-full space-y-5 mb-8">
                    {/* Journal Option */}
                    <View className="flex-row items-center">
                      <View className="mr-3">
                        <Image 
                          source={JournalIcon} 
                          className="h-12 w-12"
                          resizeMode="contain"
                          // Add default placeholder color while loading
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Journal</Text>
                        <Text className="text-zinc-400 text-sm">Write or record your thoughts</Text>
                      </View>
                    </View>
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
          
          {/* Add Content Menu Modal */}
          <Modal
            visible={showAddMenu}
            transparent={true}
            animationType="none"
            onRequestClose={() => {
              if (showAddMenu) {
                toggleAddMenu();
                return true;
              }
              return false;
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={toggleAddMenu}
            >
              {/* Beautiful blur animation - same as title modal */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0, 
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  opacity: addMenuBackdropOpacity,
                }}
              />
              
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0, 
                  right: 0,
                  bottom: 0,
                  opacity: addMenuBlurAnim,
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
              
              {/* Menu container - elegant animations like title modal */}
              <SafeAreaView className="flex-1">
                <Animated.View 
                  className="flex-1 justify-start items-center px-6 pt-20"
                  style={{
                    opacity: addMenuContentAnim,
                    transform: [
                      { translateY: addMenuTranslateY },
                      { scale: addMenuScale },
                    ]
                  }}
                >
                  {/* Add to Journal Title Container */}
                  <View className="w-full mb-8">
                    <View className="flex-row items-center justify-center">
                      <Text className="text-white text-xl font-medium">Add Content</Text>
                    </View>
                  </View>
                  
                  {/* Add Options - Styled like the journal options */}
                  <View className="w-full space-y-5 mb-8">
                    {/* Text Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => {
                        toggleAddMenu();
                        console.log('Add text');
                      }}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="text-outline" size={20} color="#d6d3d1" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base">Add Text</Text>
                        <Text className="text-zinc-400 text-xs">Write more thoughts</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Voice Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => {
                        toggleAddMenu();
                        console.log('Add voice recording');
                      }}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="mic-outline" size={20} color="#d6d3d1" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base">Voice Recording</Text>
                        <Text className="text-zinc-400 text-xs">Record your thoughts</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Video Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => {
                        toggleAddMenu();
                        console.log('Add video');
                      }}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="videocam-outline" size={20} color="#d6d3d1" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base">Add Video</Text>
                        <Text className="text-zinc-400 text-xs">Record a video clip</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Image Option */}
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => {
                        toggleAddMenu();
                        console.log('Add image');
                      }}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="image-outline" size={20} color="#d6d3d1" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-base">Add Image</Text>
                        <Text className="text-zinc-400 text-xs">Include a photo</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Cancel Option */}
                  <View className="w-full space-y-4 border-t border-zinc-800 pt-6">
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={toggleAddMenu}
                    >
                      <View className="bg-zinc-800 rounded-full p-2 mr-3">
                        <Ionicons name="close-outline" size={20} color="#a8a29e" />
                      </View>
                      <Text className="text-white text-base">Cancel</Text>
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