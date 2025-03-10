import { View, TextInput, SafeAreaView, TouchableOpacity, Keyboard, Text, Animated, Easing, FlatList, ScrollView, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Vibration } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, subWeeks, subDays, startOfYear, subMonths } from 'date-fns';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import JournalIcon from '../../assets/Icons/TextIcon.png';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../Context/GlobalProvider';

export default function Home() {  
  const router = useRouter();
  const { user,setUser } = useGlobalContext();

  console.log('type of user', typeof user)

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
  
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOptionsOverlay, setShowOptionsOverlay] = useState(false);
  const [showThemeOverlay, setShowThemeOverlay] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [newJournalType, setNewJournalType] = useState('');
  const [folderSelectionAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for journal folder management
  const [showFolderManagementModal, setShowFolderManagementModal] = useState(false);
  const [selectedJournalForFolder, setSelectedJournalForFolder] = useState(null);
  
  // New state for context menu
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedJournalForContext, setSelectedJournalForContext] = useState(null);
  
  // Theme definitions with colors (same as in onboarding)
  const themes = {
    'dark': {
      name: 'Dark',
      background: '#000000',
      card: '#1c1c1e',
      text: '#ffffff',
      subtext: '#a0a0a0',
      accent: '#3b82f6',
      description: 'Classic dark theme with white text'
    },
    'midnight': {
      name: 'Midnight Blue',
      background: '#0f172a',
      card: '#1e293b',
      text: '#ffffff',
      subtext: '#94a3b8',
      accent: '#8b5cf6',
      description: 'Deep blue tones for a calming experience'
    },
    'forest': {
      name: 'Forest',
      background: '#064e3b',
      card: '#065f46',
      text: '#ffffff',
      subtext: '#a7f3d0',
      accent: '#10b981',
      description: 'Earthy green tones for a natural feel'
    },
    'sepia': {
      name: 'Sepia',
      background: '#422006',
      card: '#713f12',
      text: '#fef3c7',
      subtext: '#d4b996',
      accent: '#ca8a04',
      description: 'Warm, paper-like tones for a classic look'
    }
  };
  
  // Fetch user data and folders from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);

          // Check if user has folders property and it's an array
          if (user.folders && Array.isArray(user.folders)) {
            // Assign colors to folders based on their index
            const foldersWithColors = user.folders.map((folder, index) => {
              // Use the folder's existing color or assign one based on index
              const colorIndex = index % folderColors.length;
              return {
                ...folder,
                color: folder.color || folderColors[colorIndex],
                name: folder.title || folder.name // Support both title and name properties
              };
            });
            setFolders(foldersWithColors);
          } else {
            // Default folders if not found
            setFolders([
              { id: '1', name: 'Personal', color: folderColors[0] },
              { id: '2', name: 'Work', color: folderColors[1] },
              { id: '3', name: 'Ideas', color: folderColors[2] }
            ]);
          }
          
          // Load journal entries from user data - using user.Journal (capital J)
          if (user.Journal && Array.isArray(user.Journal)) {
            // Format journal entries for display
            const formattedEntries = user.Journal.map(journal => {
              // Format the date and time for display
              let displayDate = 'Unknown date';
              let displayTime = '';
              
              try {
                if (journal.date) {
                  const journalDate = new Date(journal.date);
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
              
              return {
                ...journal,
                date: journal.date, // Keep the original date for filtering
                displayDate: displayDate, // Add formatted date for display
                time: displayTime,
                // Remove the default mood fallback
                lastUpdated: journal.lastUpdated || new Date().toISOString()
              };
            });
            
            setJournalEntries(formattedEntries);
            console.log('Loaded journal entries:', formattedEntries.length);
          } else {
            console.log('No journal entries found in user data');
            setJournalEntries([]);
          }
        } else {
          // Default folders if no user data
          setFolders([
            { id: '1', name: 'Personal', color: folderColors[0] },
            { id: '2', name: 'Work', color: folderColors[1] },
            { id: '3', name: 'Ideas', color: folderColors[2] }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Default folders on error
        setFolders([
          { id: '1', name: 'Personal', color: folderColors[0] },
          { id: '2', name: 'Work', color: folderColors[1] },
          { id: '3', name: 'Ideas', color: folderColors[2] }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user,setUser]);
  
  // Animation values for folder modal
  const blurAnim = useRef(new Animated.Value(0)).current;
  const modalContentAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for create modal
  const createBlurAnim = useRef(new Animated.Value(0)).current;
  const createModalContentAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for calendar modal
  const calendarBlurAnim = useRef(new Animated.Value(0)).current;
  const calendarContentAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for options overlay
  const optionsBackdropOpacity = useRef(new Animated.Value(0)).current;
  const optionsBlurAnim = useRef(new Animated.Value(0)).current;
  const optionsContentAnim = useRef(new Animated.Value(0)).current;
  const optionsTranslateY = useRef(new Animated.Value(20)).current;
  const optionsScale = useRef(new Animated.Value(0.95)).current;
  
  // Animation values for theme overlay
  const themeBackdropOpacity = useRef(new Animated.Value(0)).current;
  const themeBlurAnim = useRef(new Animated.Value(0)).current;
  const themeContentAnim = useRef(new Animated.Value(0)).current;
  const themeTranslateY = useRef(new Animated.Value(20)).current;
  const themeScale = useRef(new Animated.Value(0.95)).current;
  
  // Toggle folder modal
  const toggleFolderModal = () => {
    setShowFolderModal(!showFolderModal);
  };
  
  // Toggle options overlay
  const toggleOptionsOverlay = () => {
    if (showOptionsOverlay) {
      // Hide overlay
      Animated.parallel([
        Animated.timing(optionsBackdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(optionsBlurAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(optionsContentAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowOptionsOverlay(false);
      });
    } else {
      // Show overlay
      setShowOptionsOverlay(true);
      Animated.parallel([
        Animated.timing(optionsBackdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(optionsBlurAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(optionsContentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  // Toggle theme overlay
  const toggleThemeOverlay = () => {
    setShowThemeOverlay(!showThemeOverlay);
  };
  
  // Animation for folder selection
  const animateFolderSelection = (folderId) => {
    // Reset animation value
    folderSelectionAnim.setValue(0);
    
    // Set the selected folder
    setSelectedFolder(folderId === selectedFolder ? null : folderId);
    
    // First run the animation, then close the modal
    Animated.sequence([
      Animated.timing(folderSelectionAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(folderSelectionAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => {
      // Close the modal after animation completes
      setShowFolderModal(false);
    });
  };
  
  // Create new journal entry
  const createNewJournal = (type) => {
    setNewJournalType(type);
    // Navigate to the CreateJournal modal page
    router.push({
      pathname: "/Modal/CreateJournal",
      params: { 
        folderId: selectedFolder
      }
    });
  };
  
  // Get folder color - either from the folder object or from our predefined colors
  const getFolderColor = (folder, index) => {
    if (folder.color) return folder.color;
    return folderColors[index % folderColors.length];
  };
  
  // Derived animations for folder modal
  const modalScale = modalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  
  const modalTranslateY = modalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  // Background opacity for a subtle fade effect
  const backdropOpacity = blurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  // Derived animations for create modal
  const createModalScale = createModalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  
  const createModalTranslateY = createModalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  // Background opacity for create modal
  const createBackdropOpacity = createBlurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  // Derived animations for options overlay
  const optionsOpacity = optionsContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const [journalEntries, setJournalEntries] = useState([
    // {
    //   id: '1',
    //   title: 'New Project Kickoff',
    //   date: 'Today',
    //   time: '9:30 AM',
    //   content: 'Started working on my new project. Feeling excited about the possibilities!',
    //   mood: 'happy',
    //   folderId: '2'
    // },
    // {
    //   id: '2',
    //   title: 'Dinner with Friends',
    //   date: 'Yesterday',
    //   time: '8:45 PM',
    //   content: 'Had dinner with friends. We talked about our future plans and shared some great memories.',
    //   mood: 'relaxed',
    //   folderId: '1'
    // },
    // {
    //   id: '3',
    //   title: 'Autumn Walk',
    //   date: 'Nov 12, 2023',
    //   time: '3:20 PM',
    //   content: 'Went for a long walk in the park. The autumn colors were beautiful.',
    //   mood: 'peaceful',
    //   folderId: '1'
    // },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleJournalSubmit = () => {
    if (!inputText.trim()) return;
    
    const newEntry = {
      id: Date.now().toString(),
      title: `Journal Entry ${journalEntries.length + 1}`,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: inputText,
      // Remove the default mood
      lastUpdated: new Date().toISOString(),
      folderId: selectedFolder
    };
    
    setJournalEntries([newEntry, ...journalEntries]);
    setInputText('');
    Keyboard.dismiss();
  };

  useEffect(() => {
    const animate = () => {
      animValue.setValue(-5);
      
      Animated.timing(animValue, {
        toValue: 22,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(animate, 200);
      });
    };
    
    animate();
    
    return () => {
      animValue.stopAnimation();
    };
  }, []);

  const handlePressOutside = useCallback(() => {
    Keyboard.dismiss();
    setIsFocused(false);
  }, []);

  const renderPlaceholderText = () => {
    const text = "Ask your journal...";
    
    return (
      <View style={{ position: 'absolute', left: 16, flexDirection: 'row' }}>
        {text.split('').map((char, index) => {
          const inputRange = [
            index - 6,
            index - 3,
            index,
            index + 3,
            index + 6
          ];
          
          const outputRange = ['#57534e', '#a8a29e', '#d6d3d1', '#a8a29e', '#57534e'];
          
          const scale = animValue.interpolate({
            inputRange,
            outputRange: [0.95, 1, 1.1, 1, 0.95],
            extrapolate: 'clamp'
          });
          
          return (
            <Animated.Text
              key={index}
              style={{
                fontSize: 16,
                color: animValue.interpolate({
                  inputRange,
                  outputRange,
                  extrapolate: 'clamp'
                }),
                transform: [{ scale }]
              }}
            >
              {char}
            </Animated.Text>
          );
        })}
      </View>
    );
  };

  const JournalHeader = () => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [showStreakTooltip, setShowStreakTooltip] = useState(false);
    const today = new Date();
    const tooltipAnim = useRef(new Animated.Value(0)).current;
    
    // Toggle streak tooltip
    const toggleStreakTooltip = () => {
      if (showStreakTooltip) {
        // Hide tooltip
        Animated.timing(tooltipAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowStreakTooltip(false);
        });
      } else {
        // Show tooltip
        setShowStreakTooltip(true);
        Animated.timing(tooltipAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          Animated.timing(tooltipAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowStreakTooltip(false);
          });
        }, 3000);
      }
    };
    
    // Toggle calendar modal with animation
    const toggleCalendarModal = () => {
      setShowCalendar(!showCalendar);
    };
    
    const generateCalendarDays = () => {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const dayOfWeek = monthStart.getDay();
      const paddingDays = Array(dayOfWeek).fill(null);
      
      return [...paddingDays, ...daysInMonth];
    };
    
    // Simplified date options
    const dateOptions = [
      { label: 'Today', date: new Date() },
      { label: 'Yesterday', date: subDays(new Date(), 1) },
      { label: 'This Week', date: startOfWeek(new Date()) },
      { label: 'This Month', date: startOfMonth(new Date()) },
      { label: 'Last Month', date: startOfMonth(subMonths(new Date(), 1)) },
    ];
    
    const getCurrentFolder = () => {
      if (!selectedFolder) return "All Journals";
      const folder = folders.find(f => f.id === selectedFolder);
      return folder ? folder.name : "All Journals";
    };
    
    const getFolderColor = () => {
      if (!selectedFolder) return null;
      const folder = folders.find(f => f.id === selectedFolder);
      return folder ? folder.color : null;
    };
    
    // Format date for display
    const formatHeaderDate = (date) => {
      return format(date, 'MMMM d, yyyy');
    };
    
    return (
      <View className="mb-6">
        {/* App title and menu row */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-xl mr-3 items-center justify-center"
              style={{
                backgroundColor: '#27272a',
                borderWidth: 1,
                borderColor: '#3f3f46',
              }}
            >
              <Ionicons name="journal" size={20} color="#e4e4e7" />
            </View>
            <Text className="text-white text-2xl font-bold">JourneyAI</Text>
          </View>
          
          <View className="flex-row items-center">
            {/* Streak Counter */}
            <TouchableOpacity onPress={toggleStreakTooltip} activeOpacity={0.7}>
              <View 
                className="bg-zinc-800/80 rounded-full px-3 py-2.5 mr-2 flex-row items-center justify-center"
                style={{
                  borderWidth: 1,
                  borderColor: '#3f3f46',
                  height: 40,
                  minWidth: 40,
                }}
              >
                <Ionicons name="flame" size={18} color="#ffffff" />
                <Text className="text-white font-medium ml-1">{currentStreak}</Text>
              </View>
              
              {/* Streak Tooltip */}
              {showStreakTooltip && (
                <Animated.View 
                  className="absolute top-12 right-0 bg-zinc-800 rounded-lg p-3 z-50"
                  style={{
                    opacity: tooltipAnim,
                    transform: [{ translateY: tooltipAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0]
                    })}],
                    width: 180,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <Text className="text-white font-medium mb-1">Daily Streak</Text>
                  <Text className="text-zinc-400 text-xs">
                    {currentStreak > 0 
                      ? `You've journaled for ${currentStreak} consecutive day${currentStreak > 1 ? 's' : ''}!` 
                      : 'Start journaling daily to build your streak!'}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2.5"
              onPress={toggleOptionsOverlay}
              style={{
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#3f3f46',
              }}
            >
              <Ionicons name="menu-outline" size={22} color="#d4d4d8" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Date and folder selection row */}
        <View className="flex-row justify-between items-center mb-5">
          {/* Date selector */}
          <TouchableOpacity 
            className="flex-row items-center bg-zinc-800/80 rounded-xl px-3.5 py-2.5"
            onPress={toggleCalendarModal}
          >
            <Ionicons name="calendar-outline" size={18} color="#d4d4d8" />
            <Text className="text-gray-300 text-base ml-2 font-medium">
              {formatHeaderDate(selectedDate)}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} color="#a8a29e" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          
          {/* Folder selector */}
          <TouchableOpacity 
            className="flex-row items-center bg-zinc-800/80 rounded-xl px-3.5 py-2.5"
            onPress={toggleFolderModal}
            style={selectedFolder ? { borderLeftWidth: 3, borderLeftColor: getFolderColor(), paddingLeft: 8 } : {}}
          >
            <Ionicons name="folder-outline" size={18} color="#d4d4d8" />
            <Text className="text-gray-300 text-base ml-2 font-medium">{getCurrentFolder()}</Text>
            <Ionicons name="chevron-down-outline" size={16} color="#a8a29e" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        
        {/* Create new journal button */}
        <TouchableOpacity 
          className="mb-4 flex-row items-center"
          onPress={() => createNewJournal('journal')}
        >
          <View 
            className="rounded-xl p-4 flex-row items-center flex-1"
            style={{
              backgroundColor: 'rgba(24, 24, 27, 0.7)',
              borderWidth: 1,
              borderColor: 'rgba(39, 39, 42, 0.8)',
            }}
          >
            <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(163, 163, 163, 0.2)' }}>
              <Ionicons name="add-outline" size={20} color="#e4e4e7" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-medium">Create New Journal</Text>
              <Text className="text-zinc-400 text-xs mt-1">Document your thoughts and experiences</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Calendar modal */}
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="fade"
          onRequestClose={toggleCalendarModal}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
              <SafeAreaView className="flex-1">
                <View className="flex-1 justify-start items-center px-6 pt-10">
                  {/* Calendar Title */}
                  <View className="w-full mb-6 flex-row justify-between items-center">
                    <Text className="text-white text-xl font-medium">Select Date</Text>
                    <TouchableOpacity onPress={toggleCalendarModal}>
                      <Ionicons name="close" size={24} color="#d6d3d1" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Calendar View */}
                  <View 
                    className="w-full rounded-xl p-4 mb-4"
                    style={{
                      backgroundColor: 'rgba(24, 24, 27, 0.7)',
                      borderWidth: 1,
                      borderColor: 'rgba(39, 39, 42, 0.8)',
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-4">
                      <TouchableOpacity
                        onPress={() => {
                          const prevMonth = new Date(selectedDate);
                          prevMonth.setMonth(prevMonth.getMonth() - 1);
                          setSelectedDate(prevMonth);
                        }}
                        className="p-2"
                      >
                        <Ionicons name="chevron-back" size={20} color="#d6d3d1" />
                      </TouchableOpacity>
                      
                      <Text className="text-white font-medium text-lg">
                        {format(selectedDate, 'MMMM yyyy')}
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => {
                          const nextMonth = new Date(selectedDate);
                          nextMonth.setMonth(nextMonth.getMonth() + 1);
                          setSelectedDate(nextMonth);
                        }}
                        className="p-2"
                      >
                        <Ionicons name="chevron-forward" size={20} color="#d6d3d1" />
                      </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row justify-between mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <Text key={index} className="text-gray-400 text-center" style={{ width: 36 }}>
                          {day}
                        </Text>
                      ))}
                    </View>
                    
                    <View className="flex-row flex-wrap">
                      {generateCalendarDays().map((date, index) => {
                        if (!date) {
                          return <View key={`empty-${index}`} style={{ width: 36, height: 36, margin: 2 }} />;
                        }
                        
                        const isToday = isSameDay(date, new Date());
                        const isSelected = isSameDay(date, selectedDate);
                        
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedDate(date)}
                            className={`items-center justify-center rounded-full m-1 ${
                              isSelected ? 'bg-zinc-600' : isToday ? 'bg-zinc-700' : ''
                            }`}
                            style={{ width: 36, height: 36 }}
                          >
                            <Text 
                              className={`text-center ${
                                isSelected ? 'text-white font-bold' : 
                                isToday ? 'text-white' : 'text-gray-300'
                              }`}
                            >
                              {date.getDate()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  
                  {/* Quick Date Options */}
                  <View 
                    className="w-full rounded-xl p-4 mb-4"
                    style={{
                      backgroundColor: 'rgba(24, 24, 27, 0.7)',
                      borderWidth: 1,
                      borderColor: 'rgba(39, 39, 42, 0.8)',
                    }}
                  >
                    <Text className="text-white font-medium mb-3">Quick Select</Text>
                    
                    <View className="flex-row flex-wrap">
                      {dateOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setSelectedDate(option.date)}
                          className="bg-zinc-700/60 rounded-full px-3 py-1.5 mr-2 mb-2"
                        >
                          <Text className="text-white text-sm">{option.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  {/* Confirm Button */}
                  <TouchableOpacity 
                    className="w-full rounded-xl py-3 items-center"
                    style={{
                      backgroundColor: 'rgba(39, 39, 42, 0.8)',
                      borderWidth: 1,
                      borderColor: 'rgba(63, 63, 70, 0.4)',
                    }}
                    onPress={toggleCalendarModal}
                  >
                    <Text className="text-white font-medium">Confirm</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </BlurView>
          </View>
        </Modal>
      </View>
    );
  };

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

    // Find the folder and its index to get the color
    const folderIndex = folders.findIndex(f => f.id === item.folderId);
    const folder = folderIndex !== -1 ? folders[folderIndex] : null;
    const folderColor = folder ? getFolderColor(folder, folderIndex) : '#a3a3a3'; // Default to neutral gray if no folder

    // Get mood color based on mood
    const getMoodColor = (mood) => {
      switch(mood) {
        case 'happy': return '#f59e0b'; // Amber
        case 'sad': return '#94a3b8'; // Slate
        case 'angry': return '#f97316'; // Orange
        case 'relaxed': return '#84cc16'; // Lime
        case 'peaceful': return '#a3a3a3'; // Gray
        default: return '#a8a29e'; // Default gray
      }
    };

    // Truncate content to a reasonable preview length
    const truncateContent = (text, maxLength = 120) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Format date for display
    const formatDate = (dateStr) => {
      if (dateStr === 'Today' || dateStr === 'Yesterday') return dateStr;
      return dateStr;
    };

    // Ensure the journal ID is a string
    const journalId = item.id?.toString();
    console.log('Journal entry in list:', { id: journalId, title: item.title, type: typeof journalId });

    // Handle long press on journal entry
    const handleLongPress = () => {
      console.log('Long press on journal:', journalId);
      // Trigger a short vibration (15ms) for haptic feedback
      Vibration.vibrate(15);
      setSelectedJournalForContext(item);
      setShowContextMenu(true);
    };

    return (
      <TouchableOpacity 
        className="mb-4"
        onPress={() => {
          console.log('Navigating to journal with ID:', journalId);
          router.push({
            pathname: "/JournalPage",
            params: { id: journalId }
          });
        }}
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        <View 
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(24, 24, 27, 0.7)',
            borderWidth: 1,
            borderColor: 'rgba(39, 39, 42, 0.8)',
          }}
        >
          {/* Main content area */}
          <View className="p-5">
            {/* Title and date row */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-white text-lg font-semibold">{item.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-zinc-400 text-xs">{formatDate(item.displayDate || item.date)}</Text>
                  <Text className="text-zinc-500 text-xs mx-1.5">•</Text>
                  <Text className="text-zinc-400 text-xs">{item.time}</Text>
                </View>
              </View>
              
              {/* Folder badge */}
              {folder && (
                <View 
                  className="rounded-md px-2.5 py-1"
                  style={{ backgroundColor: `${folderColor}20` }} // 20% opacity of folder color
                >
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: folderColor }}
                  >
                    {folder.name}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Content preview */}
            <Text className="text-zinc-300 leading-5 text-sm mb-4" numberOfLines={2}>
              {truncateContent(item.content)}
            </Text>
            
            {/* Bottom row with mood indicator only */}
            <View className="flex-row items-center justify-between">
              {item.mood && item.mood !== 'default' ? (
                <View className="flex-row items-center">
                  <View 
                    className="w-6 h-6 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: `${getMoodColor(item.mood)}20` }} // 20% opacity
                  >
                    <Ionicons name={getMoodIcon(item.mood)} size={14} color={getMoodColor(item.mood)} />
                  </View>
                  <Text className="text-zinc-400 text-xs capitalize">{item.mood}</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                  <Text className="text-zinc-500 text-xs">
                    {item.lastUpdated ? `Updated ${formatTimeAgo(item.lastUpdated)}` : 'Just created'}
                  </Text>
                </View>
              )}
              
              {/* Word count indicator */}
              <View className="flex-row items-center">
                <Ionicons name="text-outline" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                <Text className="text-zinc-500 text-xs">
                  {item.content ? countWords(item.content) : 0} words
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getFilteredEntries = () => {
    let filtered = journalEntries;
    
    if (selectedDate) {
      filtered = filtered.filter(entry => {
        // Handle legacy date formats (Today, Yesterday, etc.)
        if (entry.displayDate === 'Today' && selectedDate.toDateString() === new Date().toDateString()) {
          return true;
        }
        if (entry.displayDate === 'Yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return selectedDate.toDateString() === yesterday.toDateString();
        }
        
        try {
          // Handle ISO date format (2025-03-04T09:12:52.261Z)
          if (entry.date && typeof entry.date === 'string' && entry.date.includes('T')) {
            const entryDate = new Date(entry.date);
            return (
              entryDate.getFullYear() === selectedDate.getFullYear() &&
              entryDate.getMonth() === selectedDate.getMonth() &&
              entryDate.getDate() === selectedDate.getDate()
            );
          }
          
          // Handle older format (Nov 12, 2023)
          const entryDate = new Date(entry.displayDate);
          return entryDate.toDateString() === selectedDate.toDateString();
        } catch (e) {
          console.log('Error parsing date:', e, entry.date);
          return false;
        }
      });
    }
    
    if (selectedFolder) {
      filtered = filtered.filter(entry => entry.folderId === selectedFolder);
    }
    
    console.log(`Filtered entries: ${filtered.length} (Date: ${selectedDate?.toDateString()}, Folder: ${selectedFolder})`);
    return filtered;
  };

  const FolderModal = () => (
    <Modal
      visible={showFolderModal}
      transparent={true}
      animationType="fade"
      onRequestClose={toggleFolderModal}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="flex-1 justify-start items-center px-6 pt-10">
              <View className="bg-zinc-900 rounded-xl overflow-hidden w-full">
                <View className="border-b border-zinc-800 p-4 flex-row justify-between items-center">
                  <Text className="text-white text-lg font-medium">Select Folder</Text>
                  <TouchableOpacity onPress={toggleFolderModal}>
                    <Ionicons name="close" size={20} color="#d6d3d1" />
                  </TouchableOpacity>
                </View>
                
                <View className="p-4">
                  <TouchableOpacity
                    className={`flex-row items-center p-3 mb-2 rounded-lg ${!selectedFolder ? 'bg-blue-500/20' : ''}`}
                    onPress={() => animateFolderSelection(null)}
                  >
                    <Ionicons name="albums-outline" size={20} color="#d6d3d1" />
                    <Text className="text-white ml-3">All Journals</Text>
                    {!selectedFolder && (
                      <Ionicons name="checkmark" size={20} color="#3b82f6" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                  
                  {folders.map((folder, index) => (
                    <TouchableOpacity
                      key={folder.id}
                      className={`flex-row items-center p-3 mb-2 rounded-lg ${selectedFolder === folder.id ? 'bg-blue-500/20' : ''}`}
                      onPress={() => animateFolderSelection(folder.id)}
                    >
                      <View className="w-5 h-5 rounded-full" style={{ backgroundColor: getFolderColor(folder, index) }} />
                      <Text className="text-white ml-3">{folder.name}</Text>
                      {selectedFolder === folder.id && (
                        <Ionicons name="checkmark" size={20} color="#3b82f6" style={{ marginLeft: 'auto' }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="p-4 border-t border-zinc-800">
                  <TouchableOpacity 
                    className="flex-row items-center justify-center p-3 rounded-lg bg-zinc-800"
                    onPress={() => {
                      console.log('Create new folder');
                      toggleFolderModal();
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#d6d3d1" />
                    <Text className="text-white ml-2">Create New Folder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </BlurView>
      </View>
    </Modal>
  );

  const OptionsOverlay = () => (
    <Modal
      visible={showOptionsOverlay}
      transparent={true}
      animationType="none"
      onRequestClose={() => {
        if (showOptionsOverlay) {
          toggleOptionsOverlay();
          return true;
        }
        return false;
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={toggleOptionsOverlay}
      >
        {/* Animated backdrop */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            opacity: optionsBackdropOpacity,
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
            opacity: optionsBlurAnim,
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
        
        {/* Options menu - centered content */}
        <SafeAreaView className="flex-1">
          <Animated.View 
            className="flex-1 justify-start items-center px-6 pt-20"
            style={{
              opacity: optionsContentAnim,
              transform: [
                { translateY: optionsTranslateY },
                { scale: optionsScale },
              ]
            }}
          >
            {/* Title Container */}
            <View className="w-full mb-8">
              <View className="flex-row items-center justify-center">
                <Text className="text-white text-xl font-medium">Menu Options</Text>
              </View>
            </View>
            
            {/* Menu Options - Similar to JournalPage */}
            <View className="w-full space-y-4">
              {/* Memories Option */}
              <TouchableOpacity 
                className="flex-row items-center bg-zinc-900/80 rounded-xl p-4"
                onPress={() => {
                  toggleOptionsOverlay();
                  // Navigate to Memories page
                  console.log('Navigate to Memories');
                }}
              >
                <View className="bg-zinc-800 rounded-full p-2.5 mr-4">
                  <Ionicons name="images-outline" size={22} color="#d6d3d1" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg">Memories</Text>
                  <Text className="text-zinc-400 text-sm">Revisit past journal entries</Text>
                </View>
              </TouchableOpacity>
              
              {/* Stats Option */}
              <TouchableOpacity 
                className="flex-row items-center bg-zinc-900/80 rounded-xl p-4"
                onPress={() => {
                  toggleOptionsOverlay();
                  // Navigate to Stats page
                  console.log('Navigate to Stats');
                }}
              >
                <View className="bg-zinc-800 rounded-full p-2.5 mr-4">
                  <Ionicons name="bar-chart-outline" size={22} color="#d6d3d1" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg">Stats</Text>
                  <Text className="text-zinc-400 text-sm">View insights and analytics</Text>
                </View>
              </TouchableOpacity>
              
              {/* Search Option */}
              <TouchableOpacity 
                className="flex-row items-center bg-zinc-900/80 rounded-xl p-4"
                onPress={() => {
                  toggleOptionsOverlay();
                  // Navigate to Search page
                  console.log('Navigate to Search');
                }}
              >
                <View className="bg-zinc-800 rounded-full p-2.5 mr-4">
                  <Ionicons name="search-outline" size={22} color="#d6d3d1" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg">Search</Text>
                  <Text className="text-zinc-400 text-sm">Find specific journal entries</Text>
                </View>
              </TouchableOpacity>
              
              {/* Settings Option */}
              <TouchableOpacity 
                className="flex-row items-center bg-zinc-900/80 rounded-xl p-4"
                onPress={() => {
                  toggleOptionsOverlay();
                  router.push('/Modal/Settings');
                }}
              >
                <View className="bg-zinc-800 rounded-full p-2.5 mr-4">
                  <Ionicons name="settings-outline" size={22} color="#d6d3d1" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg">Settings</Text>
                  <Text className="text-zinc-400 text-sm">Configure app preferences</Text>
                </View>
              </TouchableOpacity>
              
              {/* Theme Option */}
              <TouchableOpacity 
                className="flex-row items-center bg-zinc-900/80 rounded-xl p-4"
                onPress={() => {
                  toggleOptionsOverlay();
                  toggleThemeOverlay();
                }}
              >
                <View className="bg-zinc-800 rounded-full p-2.5 mr-4">
                  <Ionicons name="color-palette-outline" size={22} color="#d6d3d1" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg">Theme</Text>
                  <Text className="text-zinc-400 text-sm">Customize app appearance</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );

  // Theme Overlay Component
  const ThemeOverlay = () => {
    // Local state for theme selection within the modal
    const [localSelectedTheme, setLocalSelectedTheme] = useState(selectedTheme || 'dark');
    
    // Reset local theme when modal opens
    useEffect(() => {
      if (showThemeOverlay) {
        setLocalSelectedTheme(selectedTheme || 'dark');
      }
    }, [showThemeOverlay, selectedTheme]);
    
    // Apply theme only when "Apply" button is clicked
    const applyTheme = () => {
      // Save the theme preference
      saveThemePreference(localSelectedTheme);
      
      // Close the modal immediately
      setShowThemeOverlay(false);
    };
    
    // Function to render color circle for theme
    const renderThemeColor = (themeKey) => {
      const theme = themes[themeKey];
      return (
        <View className="flex-row items-center space-x-2 mt-1">
          <View 
            style={{ 
              width: 16, 
              height: 16, 
              borderRadius: 8, 
              backgroundColor: theme.accent,
            }} 
          />
          <View 
            style={{ 
              width: 16, 
              height: 16, 
              borderRadius: 8, 
              backgroundColor: theme.card,
            }} 
          />
          <View 
            style={{ 
              width: 16, 
              height: 16, 
              borderRadius: 8, 
              backgroundColor: theme.background,
            }} 
          />
        </View>
      );
    };
    
    // Get current theme for preview
    const currentTheme = themes[localSelectedTheme] || themes.dark;
    
    if (!showThemeOverlay) return null;
    
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => {
          setShowThemeOverlay(false);
          return true;
        }}
      >
        <View style={{ flex: 1 }}>
          <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
            <SafeAreaView className="flex-1 justify-center items-center px-4">
              <View 
                className="w-full rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(23, 23, 23, 0.95)',
                  borderColor: 'rgba(82, 82, 82, 0.2)',
                  borderWidth: 1,
                  maxHeight: '90%',
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {/* Header */}
                <View className="w-full py-4 px-6 border-b border-zinc-800 flex-row justify-between items-center">
                  <Text className="text-white text-xl font-medium">Select Theme</Text>
                  <TouchableOpacity 
                    onPress={() => setShowThemeOverlay(false)}
                    className="bg-zinc-800 rounded-full p-1.5"
                  >
                    <Ionicons name="close" size={20} color="#d6d3d1" />
                  </TouchableOpacity>
                </View>
                
                {/* Scrollable content */}
                <ScrollView 
                  className="w-full" 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {/* Theme Preview */}
                  <View className="px-6 pt-6 pb-4">
                    <Text className="text-white text-base font-medium mb-3">Preview:</Text>
                    <View 
                      className="rounded-lg overflow-hidden"
                      style={{
                        backgroundColor: currentTheme.card,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <View className="p-4">
                        {/* Mock journal entry */}
                        <View className="mb-3">
                          <Text style={{ color: currentTheme.text, fontWeight: 'bold', fontSize: 16 }}>Journal Preview</Text>
                          <Text style={{ color: currentTheme.subtext, fontSize: 12, marginTop: 2 }}>Today, 10:30 AM</Text>
                        </View>
                        
                        {/* Mock content */}
                        <View className="space-y-2">
                          <View className="h-3 rounded-full w-full" style={{ backgroundColor: `${currentTheme.text}20` }} />
                          <View className="h-3 rounded-full w-3/4" style={{ backgroundColor: `${currentTheme.text}20` }} />
                          <View className="h-3 rounded-full w-5/6" style={{ backgroundColor: `${currentTheme.text}20` }} />
                          <View className="h-3 rounded-full w-2/3" style={{ backgroundColor: `${currentTheme.text}20` }} />
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {/* Theme Options */}
                  <View className="px-6 pb-4">
                    <Text className="text-white text-base font-medium mb-3">Available Themes:</Text>
                    <View className="space-y-3">
                      {Object.keys(themes).map((key) => (
                        <TouchableOpacity 
                          key={key}
                          className={`w-full py-3 px-4 rounded-xl border ${localSelectedTheme === key ? 'border-white' : 'border-zinc-800'}`}
                          onPress={() => setLocalSelectedTheme(key)}
                          style={{
                            backgroundColor: localSelectedTheme === key ? 'rgba(82, 82, 82, 0.3)' : 'rgba(39, 39, 42, 0.5)',
                          }}
                        >
                          <View className="flex-row justify-between items-center">
                            <View>
                              <Text className="text-white text-base font-medium">{themes[key].name}</Text>
                              {renderThemeColor(key)}
                            </View>
                            {localSelectedTheme === key && (
                              <View className="bg-white rounded-full p-1.5">
                                <Ionicons name="checkmark" size={14} color="#000" />
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>
                
                {/* Apply button */}
                <View className="px-6 py-4 border-t border-zinc-800">
                  <TouchableOpacity 
                    className="w-full py-3 rounded-full"
                    onPress={applyTheme}
                    style={{
                      backgroundColor: '#ffffff',
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text className="text-black text-center font-medium">Apply Theme</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </BlurView>
        </View>
      </Modal>
    );
  };

  // Add this new function to handle assigning a journal to a folder
  const assignJournalToFolder = async (journalId, folderId) => {
    try {
      if (!user || !user.Journal) {
        console.log('No user data or journal entries found');
        return;
      }
      
      // Find the journal entry
      const journalIndex = user.Journal.findIndex(j => j.id.toString() === journalId.toString());
      
      if (journalIndex === -1) {
        console.log('Journal entry not found:', journalId);
        return;
      }
      
      // Update the journal entry's folder ID
      const updatedJournals = [...user.Journal];
      updatedJournals[journalIndex] = {
        ...updatedJournals[journalIndex],
        folderId: folderId
      };
      
      // Update user data
      const updatedUser = {
        ...user,
        Journal: updatedJournals
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      console.log(`Journal ${journalId} assigned to folder ${folderId}`);
      setShowFolderManagementModal(false);
    } catch (error) {
      console.error('Error assigning journal to folder:', error);
    }
  };
  
  // Add this new component for folder management modal
  const FolderManagementModal = () => (
    <Modal
      visible={showFolderManagementModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFolderManagementModal(false)}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="flex-1 justify-start items-center px-6 pt-10">
              {/* Modal Title */}
              <View className="w-full mb-6 flex-row justify-between items-center">
                <Text className="text-white text-xl font-medium">Manage Folders</Text>
                <TouchableOpacity onPress={() => setShowFolderManagementModal(false)}>
                  <Ionicons name="close" size={24} color="#d6d3d1" />
                </TouchableOpacity>
              </View>
              
              {/* Journal Title */}
              {selectedJournalForFolder && (
                <View className="w-full mb-4">
                  <Text className="text-zinc-400 text-sm mb-1">Journal Entry</Text>
                  <Text className="text-white text-lg font-medium">{selectedJournalForFolder.title}</Text>
                </View>
              )}
              
              {/* Current Folder */}
              {selectedJournalForFolder && selectedJournalForFolder.folderId && (
                <View className="w-full mb-6">
                  <Text className="text-zinc-400 text-sm mb-1">Current Folder</Text>
                  <View className="flex-row items-center">
                    <View 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ 
                        backgroundColor: folders.find(f => f.id === selectedJournalForFolder.folderId)?.color || '#a3a3a3' 
                      }}
                    />
                    <Text className="text-white">
                      {folders.find(f => f.id === selectedJournalForFolder.folderId)?.name || 'None'}
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Folder List */}
              <View 
                className="w-full rounded-xl p-4 mb-4"
                style={{
                  backgroundColor: 'rgba(24, 24, 27, 0.7)',
                  borderWidth: 1,
                  borderColor: 'rgba(39, 39, 42, 0.8)',
                }}
              >
                <Text className="text-white font-medium mb-3">Select Folder</Text>
                
                <ScrollView className="max-h-80">
                  {/* Option to remove from folder */}
                  <TouchableOpacity
                    className="flex-row items-center py-3 border-b border-zinc-800"
                    onPress={() => {
                      if (selectedJournalForFolder) {
                        assignJournalToFolder(selectedJournalForFolder.id, null);
                      }
                    }}
                  >
                    <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-zinc-700">
                      <Ionicons name="remove-outline" size={18} color="#d4d4d8" />
                    </View>
                    <Text className="text-white">Remove from folder</Text>
                  </TouchableOpacity>
                  
                  {/* Folder options */}
                  {folders.map((folder, index) => (
                    <TouchableOpacity
                      key={folder.id}
                      className="flex-row items-center py-3 border-b border-zinc-800"
                      onPress={() => {
                        if (selectedJournalForFolder) {
                          assignJournalToFolder(selectedJournalForFolder.id, folder.id);
                        }
                      }}
                    >
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: folder.color }}
                      >
                        <Ionicons 
                          name={selectedJournalForFolder && selectedJournalForFolder.folderId === folder.id ? "checkmark" : "folder-outline"} 
                          size={18} 
                          color="#ffffff" 
                        />
                      </View>
                      <Text className="text-white">{folder.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Cancel Button */}
              <TouchableOpacity 
                className="w-full rounded-xl py-3 items-center"
                style={{
                  backgroundColor: 'rgba(39, 39, 42, 0.8)',
                  borderWidth: 1,
                  borderColor: 'rgba(63, 63, 70, 0.4)',
                }}
                onPress={() => setShowFolderManagementModal(false)}
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </BlurView>
      </View>
    </Modal>
  );

  // Add this new component for context menu
  const ContextMenu = () => {
    if (!selectedJournalForContext) return null;
    
    const journalId = selectedJournalForContext.id?.toString();
    
    // Find the folder and its index to get the color
    const folderIndex = folders.findIndex(f => f.id === selectedJournalForContext.folderId);
    const folder = folderIndex !== -1 ? folders[folderIndex] : null;
    
    return (
      <Modal
        visible={showContextMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContextMenu(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={() => setShowContextMenu(false)}
            >
              <SafeAreaView className="flex-1">
                <View className="flex-1 justify-center items-center px-6">
                  <View 
                    className="w-full rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(24, 24, 27, 0.9)',
                      borderWidth: 1,
                      borderColor: 'rgba(39, 39, 42, 0.8)',
                      maxWidth: 320,
                    }}
                  >
                    {/* Journal Title */}
                    <View className="p-4 border-b border-zinc-800">
                      <Text className="text-white text-lg font-medium">{selectedJournalForContext.title}</Text>
                      <Text className="text-zinc-400 text-xs mt-1">
                        {selectedJournalForContext.displayDate || selectedJournalForContext.date} • {selectedJournalForContext.time}
                      </Text>
                    </View>
                    
                    {/* Menu Options */}
                    <View>
                      {/* Edit Option */}
                      <TouchableOpacity 
                        className="flex-row items-center p-4 border-b border-zinc-800"
                        onPress={() => {
                          setShowContextMenu(false);
                          router.push({
                            pathname: "/JournalPage",
                            params: { id: journalId, mode: 'edit' }
                          });
                        }}
                      >
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-zinc-700">
                          <Ionicons name="pencil-outline" size={18} color="#d4d4d8" />
                        </View>
                        <Text className="text-white">Edit Journal</Text>
                      </TouchableOpacity>
                      
                      {/* Manage Folders Option */}
                      <TouchableOpacity 
                        className="flex-row items-center p-4 border-b border-zinc-800"
                        onPress={() => {
                          setShowContextMenu(false);
                          setSelectedJournalForFolder(selectedJournalForContext);
                          setShowFolderManagementModal(true);
                        }}
                      >
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-zinc-700">
                          <Ionicons name="folder-outline" size={18} color="#d4d4d8" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white">Manage Folder</Text>
                          {folder && (
                            <View className="flex-row items-center mt-1">
                              <View 
                                className="w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: folder.color }}
                              />
                              <Text className="text-zinc-400 text-xs">{folder.name}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                      
                      {/* Delete Option */}
                      <TouchableOpacity 
                        className="flex-row items-center p-4"
                        onPress={() => {
                          console.log('Delete journal:', journalId);
                          setShowContextMenu(false);
                          // Implement delete functionality
                          deleteJournal(journalId);
                        }}
                      >
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-red-900/50">
                          <Ionicons name="trash-outline" size={18} color="#f87171" />
                        </View>
                        <Text className="text-red-400">Delete Journal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    );
  };

  // Add delete journal functionality
  const deleteJournal = async (journalId) => {
    try {
      if (!user || !user.Journal) {
        console.log('No user data or journal entries found');
        return;
      }
      
      // Filter out the journal entry to delete
      const updatedJournals = user.Journal.filter(j => j.id.toString() !== journalId.toString());
      
      // Update user data
      const updatedUser = {
        ...user,
        Journal: updatedJournals
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      console.log(`Journal ${journalId} deleted`);
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  // Add these helper functions near the other utility functions
  const countWords = (text) => {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
      } else if (diffHour > 0) {
        return `${diffHour}h ago`;
      } else if (diffMin > 0) {
        return `${diffMin}m ago`;
      } else {
        return 'just now';
      }
    } catch (e) {
      console.log('Error formatting time ago:', e);
      return '';
    }
  };

  // Function to save the selected theme
  const saveThemePreference = async (themeKey) => {
    try {
      // Get current user data
      const userData = await AsyncStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        
        // Update theme preference
        const updatedUser = {
          ...user,
          themePreference: themeKey
        };
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update global context
        setUser(JSON.stringify(updatedUser));
        
        // Update local state
        setSelectedTheme(themeKey);
        
        // Show success feedback
        console.log('Theme preference saved:', themeKey);
        
        // Provide visual feedback
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Load the current theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        if (user) {
          const userData = JSON.parse(user);
          if (userData.themePreference) {
            console.log('Loading theme preference:', userData.themePreference);
            setSelectedTheme(userData.themePreference);
          } else {
            // Set default theme if none is selected
            console.log('No theme preference found, using default');
            setSelectedTheme('dark');
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Set default theme on error
        setSelectedTheme('dark');
      }
    };
    
    loadThemePreference();
  }, [user]);

  // Calculate and update streak when user data changes
  useEffect(() => {
    const updateStreak = () => {
      if (!user) return;
      
      try {
        const userData = JSON.parse(user);
        if (!userData.Journal || !Array.isArray(userData.Journal) || userData.Journal.length === 0) {
          setCurrentStreak(0);
          return;
        }
        
        // Sort journal entries by date (newest first)
        const sortedEntries = [...userData.Journal].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if there's an entry for today
        const latestEntryDate = new Date(sortedEntries[0].date);
        latestEntryDate.setHours(0, 0, 0, 0);
        
        // If no entry for today, streak might have ended
        if (latestEntryDate.getTime() !== today.getTime()) {
          // Check if there was an entry yesterday
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (latestEntryDate.getTime() !== yesterday.getTime()) {
            // Streak ended - no entry today or yesterday
            setCurrentStreak(0);
            return;
          }
        }
        
        // Count consecutive days
        let streak = 1; // Start with 1 for the most recent entry
        let currentDate = latestEntryDate;
        
        for (let i = 1; i < sortedEntries.length; i++) {
          const entryDate = new Date(sortedEntries[i].date);
          entryDate.setHours(0, 0, 0, 0);
          
          // Check if this entry is from the previous day
          const expectedPrevDate = new Date(currentDate);
          expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
          
          if (entryDate.getTime() === expectedPrevDate.getTime()) {
            // This entry continues the streak
            streak++;
            currentDate = entryDate;
          } else {
            // Streak is broken
            break;
          }
        }
        
        setCurrentStreak(streak);
      } catch (error) {
        console.error('Error calculating streak:', error);
        setCurrentStreak(0);
      }
    };
    
    updateStreak();
  }, [user]);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['rgba(38, 38, 38, 0.2)', 'rgba(0, 0, 0, 0)']}
          className="absolute w-full h-96"
        />

        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handlePressOutside} 
          className="flex-1"
        >
          <View className="flex-1 px-4 pt-2">
            <JournalHeader />
            
            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#a1a1aa" />
              </View>
            ) : (
              <FlatList
                data={getFilteredEntries()}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderJournalEntry}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ItemSeparatorComponent={() => <View className="h-2" />}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={10}
                ListHeaderComponent={() => (
                  <View className="mb-4">
                    <Text className="text-zinc-400 text-sm">
                      {getFilteredEntries().length} {getFilteredEntries().length === 1 ? 'entry' : 'entries'}
                    </Text>
                  </View>
                )}
                ListEmptyComponent={() => (
                  <View className="flex-1 justify-center items-center py-10">
                    <View 
                      className="w-16 h-16 rounded-full items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(39, 39, 42, 0.6)' }}
                    >
                      <Ionicons name="journal-outline" size={28} color="#a1a1aa" />
                    </View>
                    <Text className="text-zinc-400 text-base text-center mb-2">No journal entries found</Text>
                    <Text className="text-zinc-500 text-sm text-center px-8">
                      Create your first journal entry to start documenting your thoughts
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Animated Ask Journal Button - Fixed at bottom */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <View className="rounded-full overflow-hidden" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
          <LinearGradient
              colors={['rgba(39, 39, 42, 0.9)', 'rgba(24, 24, 27, 0.9)']}
            start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="p-[1px] rounded-full"
            >
              <TouchableOpacity
                className="w-full h-12 rounded-full"
                style={{ backgroundColor: 'rgba(24, 24, 27, 0.8)' }}
                onPress={() => router.push({
                  pathname: '/AskJournal',
                  params: { 
                    // We'll pass the necessary data as params
                    // In a real app, you might use a context or state management library instead
                  }
                })}
              >
                <View className="w-full h-full flex-row items-center justify-center">
                  <Ionicons name="search" size={18} color="#e4e4e7" style={{ marginRight: 8 }} />
                  <Text className="text-zinc-200 text-base font-medium">Ask Your Journal</Text>
                </View>
              </TouchableOpacity>
          </LinearGradient>
          </View>
        </View>
        
        {/* Folder Modal */}
        <FolderModal />
        
        {/* Folder Management Modal */}
        <FolderManagementModal />
        
        {/* Context Menu */}
        <ContextMenu />
        
        {/* Options Overlay */}
        <OptionsOverlay />
        
        {/* Theme Overlay */}
        <ThemeOverlay />
      </SafeAreaView>
    </View>
  );
}
