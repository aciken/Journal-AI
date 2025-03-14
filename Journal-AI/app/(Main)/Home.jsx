import { View, TextInput, SafeAreaView, TouchableOpacity, Keyboard, Text, Animated, Easing, FlatList, ScrollView, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Vibration } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, subWeeks, subDays, startOfYear, subMonths } from 'date-fns';
import { useRouter, useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';
import JournalIcon from '../../assets/Icons/TextIcon.png';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../Context/GlobalProvider';

export default function Home() {  
  const router = useRouter();
  const { user, setUser } = useGlobalContext();

  const folderColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
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
  const [showFolderManagementModal, setShowFolderManagementModal] = useState(false);
  const [selectedJournalForFolder, setSelectedJournalForFolder] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedJournalForContext, setSelectedJournalForContext] = useState(null);
  
  const themes = {
    'dark': { name: 'Dark', background: '#000000', card: '#1c1c1e', text: '#ffffff', subtext: '#a0a0a0', accent: '#3b82f6', description: 'Classic dark theme with white text' },
    'midnight': { name: 'Midnight Blue', background: '#0f172a', card: '#1e293b', text: '#ffffff', subtext: '#94a3b8', accent: '#8b5cf6', description: 'Deep blue tones for a calming experience' },
    'forest': { name: 'Forest', background: '#064e3b', card: '#065f46', text: '#ffffff', subtext: '#a7f3d0', accent: '#10b981', description: 'Earthy green tones for a natural feel' },
    'sepia': { name: 'Sepia', background: '#422006', card: '#713f12', text: '#fef3c7', subtext: '#d4b996', accent: '#ca8a04', description: 'Warm, paper-like tones for a classic look' }
  };
  
  // Animation values
  const blurAnim = useRef(new Animated.Value(0)).current;
  const modalContentAnim = useRef(new Animated.Value(0)).current;
  const createBlurAnim = useRef(new Animated.Value(0)).current;
  const createModalContentAnim = useRef(new Animated.Value(0)).current;
  const calendarBlurAnim = useRef(new Animated.Value(0)).current;
  const calendarContentAnim = useRef(new Animated.Value(0)).current;
  const optionsAnim = useRef(new Animated.Value(0)).current;  // Updated for options overlay
  const themeAnim = useRef(new Animated.Value(0)).current;    // Updated for theme overlay

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          // Make sure we're parsing valid JSON
          const parsedUser = JSON.parse(userData);
          console.log('home data', parsedUser.Journal ? parsedUser.Journal[11] : 'No journal data');
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.folders && Array.isArray(user.folders)) {
            const foldersWithColors = user.folders.map((folder, index) => {
              const colorIndex = index % folderColors.length;
              return {
                ...folder,
                color: folder.color || folderColors[colorIndex],
                name: folder.title || folder.name
              };
            });
            setFolders(foldersWithColors);
          } else {
            setFolders([
              { id: '1', name: 'Personal', color: folderColors[0] },
              { id: '2', name: 'Work', color: folderColors[1] },
              { id: '3', name: 'Ideas', color: folderColors[2] }
            ]);
          }
          
          if (user.Journal && Array.isArray(user.Journal)) {
            const formattedEntries = user.Journal.map(journal => {
              let displayDate = 'Unknown date';
              let displayTime = '';
              try {
                if (journal.date) {
                  const journalDate = new Date(journal.date);
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  if (journalDate.toDateString() === today.toDateString()) {
                    displayDate = 'Today';
                  } else if (journalDate.toDateString() === yesterday.toDateString()) {
                    displayDate = 'Yesterday';
                  } else {
                    displayDate = journalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                  displayTime = journalDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                }
              } catch (e) {
                console.log('Error formatting date:', e);
              }
              return {
                ...journal,
                date: journal.date,
                displayDate: displayDate,
                time: displayTime,
                lastUpdated: journal.lastUpdated || new Date().toISOString()
              };
            });
            setJournalEntries(formattedEntries);
          } else {
            setJournalEntries([]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user, setUser]);
  
  const toggleFolderModal = () => {
    setShowFolderModal(!showFolderModal);
  };
  
  // Updated toggle functions with improved animations
  const toggleOptionsOverlay = () => {
    if (showOptionsOverlay) {
      Animated.spring(optionsAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start(() => setShowOptionsOverlay(false));
    } else {
      setShowOptionsOverlay(true);
      Animated.spring(optionsAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleThemeOverlay = () => {
    if (showThemeOverlay) {
      Animated.spring(themeAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start(() => setShowThemeOverlay(false));
    } else {
      setShowThemeOverlay(true);
      Animated.spring(themeAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const animateFolderSelection = (folderId) => {
    folderSelectionAnim.setValue(0);
    setSelectedFolder(folderId === selectedFolder ? null : folderId);
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
    ]).start(() => setShowFolderModal(false));
  };
  
  const createNewJournal = (type) => {
    setNewJournalType(type);
    router.push({
      pathname: "/Modal/CreateJournal",
      params: { folderId: selectedFolder }
    });
  };
  
  const getFolderColor = (folder, index) => {
    return folder.color || folderColors[index % folderColors.length];
  };
  
  const modalScale = modalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  
  const modalTranslateY = modalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  const backdropOpacity = blurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleJournalSubmit = () => {
    if (!inputText.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      title: `Journal Entry ${journalEntries.length + 1}`,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: inputText,
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
      }).start(() => setTimeout(animate, 200));
    };
    animate();
    return () => animValue.stopAnimation();
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
          const inputRange = [index - 6, index - 3, index, index + 3, index + 6];
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
                color: animValue.interpolate({ inputRange, outputRange, extrapolate: 'clamp' }),
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
    const [showStreakTooltip, setShowStreakTooltip] = useState(false);
    const [showStreakOverlay, setShowStreakOverlay] = useState(false);
    const today = new Date();
    const tooltipAnim = useRef(new Animated.Value(0)).current;
    
    const toggleStreakTooltip = () => {
      if (showStreakTooltip) {
        Animated.timing(tooltipAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowStreakTooltip(false));
      } else {
        setShowStreakTooltip(true);
        Animated.timing(tooltipAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        setTimeout(() => {
          Animated.timing(tooltipAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowStreakTooltip(false));
        }, 3000);
      }
    };
    
    const toggleStreakOverlay = () => {
      setShowStreakOverlay(!showStreakOverlay);
    };
    
    const navigateToDateSelector = () => {
      router.push('/Modal/DateSelector');
    };
    
    const navigateToFolderSelector = () => {
      router.push('/Modal/FolderSelector');
    };
    
    const formatHeaderDate = (date) => {
      return format(date, 'MMMM d, yyyy');
    };
    
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
    
    const StreakOverlay = () => {
      const overlayAnim = useRef(new Animated.Value(0)).current;
      const contentAnim = useRef(new Animated.Value(0)).current;
      
      const generateLastSevenDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          days.push({
            date,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            isCompleted: checkDayCompleted(date)
          });
        }
        return days;
      };
      
      const checkDayCompleted = (date) => {
        if (!user) return false;
        try {
          // No need to parse user again since it's already an object
          if (!user.Journal || !Array.isArray(user.Journal)) return false;
          const targetDate = new Date(date);
          targetDate.setHours(0, 0, 0, 0);
          return user.Journal.some(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === targetDate.getTime();
          });
        } catch (error) {
          console.error('Error checking completed days:', error);
          return false;
        }
      };
      
      useEffect(() => {
        Animated.parallel([
          Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(contentAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
      }, []);
      
      const handleClose = () => {
        Animated.parallel([
          Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(contentAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setShowStreakOverlay(false));
      };
      
      const lastSevenDays = generateLastSevenDays();
      
      return (
        <Modal transparent={true} visible={true} animationType="none" onRequestClose={handleClose}>
          <TouchableOpacity activeOpacity={1} onPress={handleClose} className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <Animated.View style={{
              opacity: overlayAnim,
              transform: [{ scale: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
            }} className="w-[85%] bg-zinc-900 rounded-3xl overflow-hidden">
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View className="p-6">
                  <View className="items-center mb-4">
                    <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-2">
                      <Ionicons name="flame" size={32} color="#f97316" />
                    </View>
                    <Text className="text-white text-2xl font-bold">{currentStreak} Day streak</Text>
                    <Text className="text-zinc-400 text-sm mt-1">You're on fire! Every day matters for hitting your goals</Text>
                  </View>
                  <View className="mt-4 mb-2">
                    <View className="flex-row justify-between mb-4">
                      {lastSevenDays.map((day, index) => (
                        <View key={index} className="items-center">
                          <Text className="text-zinc-400 text-xs mb-2">{day.dayName}</Text>
                          <View className={`w-8 h-8 rounded-full items-center justify-center ${day.isCompleted ? 'bg-orange-500/20' : 'bg-zinc-800'}`}>
                            {day.isCompleted ? <Ionicons name="checkmark-circle" size={18} color="#f97316" /> : <View className="w-2 h-2 rounded-full bg-zinc-700" />}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View className="mt-4 p-4 bg-zinc-800/50 rounded-xl">
                    <Text className="text-white text-sm text-center">
                      {currentStreak > 0 ? `Keep going! You've journaled for ${currentStreak} consecutive day${currentStreak > 1 ? 's' : ''}.` : 'Start journaling today to begin your streak!'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} className="mt-6 bg-zinc-800 py-3 rounded-xl">
                    <Text className="text-white font-medium text-center">Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      );
    };
    
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl mr-3 items-center justify-center" style={{ backgroundColor: '#27272a', borderWidth: 1, borderColor: '#3f3f46' }}>
              <Ionicons name="journal" size={20} color="#e4e4e7" />
            </View>
            <Text className="text-white text-2xl font-bold">JourneyAI</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleStreakOverlay} activeOpacity={0.7}>
              <View className="bg-zinc-800/80 rounded-full px-3 py-2.5 mr-2 flex-row items-center justify-center" style={{ borderWidth: 1, borderColor: '#3f3f46', height: 40, minWidth: 40 }}>
                <Ionicons name="flame" size={18} color="#ffffff" />
                <Text className="text-white font-medium ml-1">{currentStreak}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="bg-zinc-800/80 rounded-full p-2.5" onPress={toggleOptionsOverlay} style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3f3f46' }}>
              <Ionicons name="menu-outline" size={22} color="#d4d4d8" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row justify-between items-center mb-5">
          <TouchableOpacity 
            className="flex-row items-center bg-zinc-800/80 rounded-xl px-3.5 py-2.5" 
            onPress={navigateToDateSelector}
            style={{ borderWidth: 1, borderColor: 'rgba(63, 63, 70, 0.5)' }}
          >
            <Ionicons name="calendar-outline" size={18} color="#d4d4d8" />
            <Text className="text-gray-300 text-base ml-2 font-medium">{formatHeaderDate(selectedDate)}</Text>
            <Ionicons name="chevron-down-outline" size={16} color="#a8a29e" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center bg-zinc-800/80 rounded-xl px-3.5 py-2.5" 
            onPress={navigateToFolderSelector} 
            style={selectedFolder ? { 
              borderLeftWidth: 3, 
              borderLeftColor: getFolderColor(), 
              paddingLeft: 8,
              borderWidth: 1,
              borderColor: 'rgba(63, 63, 70, 0.5)'
            } : {
              borderWidth: 1,
              borderColor: 'rgba(63, 63, 70, 0.5)'
            }}
          >
            <Ionicons name="folder-outline" size={18} color="#d4d4d8" />
            <Text className="text-gray-300 text-base ml-2 font-medium">{getCurrentFolder()}</Text>
            <Ionicons name="chevron-down-outline" size={16} color="#a8a29e" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          className="mb-4 flex-row items-center" 
          onPress={() => createNewJournal('journal')}
        >
          <View className="rounded-xl p-4 flex-row items-center flex-1" style={{ backgroundColor: 'rgba(24, 24, 27, 0.7)', borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.8)' }}>
            <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(163, 163, 163, 0.2)' }}>
              <Ionicons name="add-outline" size={20} color="#e4e4e7" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-medium">Create New Journal</Text>
              <Text className="text-zinc-400 text-xs mt-1">Document your thoughts and experiences</Text>
            </View>
          </View>
        </TouchableOpacity>
        {showStreakOverlay && <StreakOverlay />}
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

    const folderIndex = folders.findIndex(f => f.id === item.folderId);
    const folder = folderIndex !== -1 ? folders[folderIndex] : null;
    const folderColor = folder ? getFolderColor(folder, folderIndex) : '#a3a3a3';

    const getMoodColor = (mood) => {
      switch(mood) {
        case 'happy': return '#f59e0b';
        case 'sad': return '#94a3b8';
        case 'angry': return '#f97316';
        case 'relaxed': return '#84cc16';
        case 'peaceful': return '#a3a3a3';
        default: return '#a8a29e';
      }
    };

    const truncateContent = (text, maxLength = 40) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) : text;
    };

    const formatDate = (dateStr) => {
      if (dateStr === 'Today' || dateStr === 'Yesterday') return dateStr;
      return dateStr;
    };

    const journalId = item.id?.toString();

    const handleLongPress = () => {
      Vibration.vibrate(15);
      setSelectedJournalForContext(item);
      setShowContextMenu(true);
    };

    return (
      <TouchableOpacity className="mb-4" onPress={() => {
        console.log('Opening journal with ID:', journalId);
        // Add a slight delay to ensure any animations complete
        setTimeout(() => {
          router.push({
            pathname: "/JournalPage",
            params: { id: journalId }
          });
        }, 50);
      }} onLongPress={handleLongPress} delayLongPress={300}>
        <View className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(24, 24, 27, 0.7)', borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.8)', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }}>
          <View className="p-5">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-white text-lg font-semibold" numberOfLines={1}>{item.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-zinc-400 text-xs">{formatDate(item.displayDate || item.date)}</Text>
                  <Text className="text-zinc-500 text-xs mx-1.5">•</Text>
                  <Text className="text-zinc-400 text-xs">{item.time}</Text>
                </View>
              </View>
              {folder && (
                <View className="rounded-md px-2.5 py-1" style={{ backgroundColor: `${folderColor}20` }}>
                  <Text className="text-xs font-medium" style={{ color: folderColor }}>{folder.name}</Text>
                </View>
              )}
            </View>
            <View className="h-10 mb-4 justify-center relative overflow-hidden">
              {item.content ? (
                <Text className="text-zinc-400 leading-5 text-sm" numberOfLines={1} style={{ fontWeight: '400' }}>{truncateContent(item.content, 25)} ...</Text>
              ) : (
                <Text className="text-zinc-500 text-sm italic">No content</Text>
              )}
            </View>
            <View className="flex-row items-center justify-between">
              {item.mood && item.mood !== 'default' ? (
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-2" style={{ backgroundColor: `${getMoodColor(item.mood)}20` }}>
                    <Ionicons name={getMoodIcon(item.mood)} size={14} color={getMoodColor(item.mood)} />
                  </View>
                  <Text className="text-zinc-400 text-xs capitalize">{item.mood}</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                  <Text className="text-zinc-500 text-xs">{item.lastUpdated ? `Updated ${formatTimeAgo(item.lastUpdated)}` : 'Just created'}</Text>
                </View>
              )}
              <View className="flex-row items-center">
                <Ionicons name="text-outline" size={14} color="#a1a1aa" style={{ marginRight: 4 }} />
                <Text className="text-zinc-500 text-xs">{item.content ? countWords(item.content) : 0} words</Text>
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
        if (entry.displayDate === 'Today' && selectedDate.toDateString() === new Date().toDateString()) return true;
        if (entry.displayDate === 'Yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return selectedDate.toDateString() === yesterday.toDateString();
        }
        try {
          if (entry.date && typeof entry.date === 'string' && entry.date.includes('T')) {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === selectedDate.getFullYear() && entryDate.getMonth() === selectedDate.getMonth() && entryDate.getDate() === selectedDate.getDate();
          }
          const entryDate = new Date(entry.displayDate);
          return entryDate.toDateString() === selectedDate.toDateString();
        } catch (e) {
          console.log('Error parsing date:', e, entry.date);
          return false;
        }
      });
    }
    if (selectedFolder) filtered = filtered.filter(entry => entry.folderId === selectedFolder);
    return filtered;
  };

  const FolderManagementModal = () => (
    <Modal visible={showFolderManagementModal} transparent={true} animationType="fade" onRequestClose={() => setShowFolderManagementModal(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="flex-1 justify-start items-center px-6 pt-10">
              <View className="w-full mb-6 flex-row justify-between items-center">
                <Text className="text-white text-xl font-medium">Manage Folders</Text>
                <TouchableOpacity onPress={() => setShowFolderManagementModal(false)}>
                  <Ionicons name="close" size={24} color="#d6d3d1" />
                </TouchableOpacity>
              </View>
              {selectedJournalForFolder && (
                <View className="w-full mb-4">
                  <Text className="text-zinc-400 text-sm mb-1">Journal Entry</Text>
                  <Text className="text-white text-lg font-medium">{selectedJournalForFolder.title}</Text>
                </View>
              )}
              {selectedJournalForFolder && selectedJournalForFolder.folderId && (
                <View className="w-full mb-6">
                  <Text className="text-zinc-400 text-sm mb-1">Current Folder</Text>
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: folders.find(f => f.id === selectedJournalForFolder.folderId)?.color || '#a3a3a3' }} />
                    <Text className="text-white">{folders.find(f => f.id === selectedJournalForFolder.folderId)?.name || 'None'}</Text>
                  </View>
                </View>
              )}
              <View className="w-full rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(24, 24, 27, 0.7)', borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.8)' }}>
                <Text className="text-white font-medium mb-3">Select Folder</Text>
                <ScrollView className="max-h-80">
                  <TouchableOpacity className="flex-row items-center py-3 border-b border-zinc-800" onPress={() => { if (selectedJournalForFolder) assignJournalToFolder(selectedJournalForFolder.id, null); }}>
                    <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-zinc-700">
                      <Ionicons name="remove-outline" size={18} color="#d4d4d8" />
                    </View>
                    <Text className="text-white">Remove from folder</Text>
                  </TouchableOpacity>
                  {folders.map((folder, index) => (
                    <TouchableOpacity key={folder.id} className="flex-row items-center py-3 border-b border-zinc-800" onPress={() => { if (selectedJournalForFolder) assignJournalToFolder(selectedJournalForFolder.id, folder.id); }}>
                      <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: folder.color }}>
                        <Ionicons name={selectedJournalForFolder && selectedJournalForFolder.folderId === folder.id ? "checkmark" : "folder-outline"} size={18} color="#ffffff" />
                      </View>
                      <Text className="text-white">{folder.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TouchableOpacity className="w-full rounded-xl py-3 items-center" style={{ backgroundColor: 'rgba(39, 39, 42, 0.8)', borderWidth: 1, borderColor: 'rgba(63, 63, 70, 0.4)' }} onPress={() => setShowFolderManagementModal(false)}>
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </BlurView>
      </View>
    </Modal>
  );

  const ContextMenu = () => {
    if (!selectedJournalForContext) return null;
    const journalId = selectedJournalForContext.id?.toString();
    const folderIndex = folders.findIndex(f => f.id === selectedJournalForContext.folderId);
    const folder = folderIndex !== -1 ? folders[folderIndex] : null;
    
    return (
      <Modal visible={showContextMenu} transparent={true} animationType="fade" onRequestClose={() => setShowContextMenu(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowContextMenu(false)}>
              <SafeAreaView className="flex-1">
                <View className="flex-1 justify-center items-center px-6">
                  <View className="w-full rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.8)', maxWidth: 320 }}>
                    <View className="p-4 border-b border-zinc-800">
                      <Text className="text-white text-lg font-medium">{selectedJournalForContext.title}</Text>
                      <Text className="text-zinc-400 text-xs mt-1">{selectedJournalForContext.displayDate || selectedJournalForContext.date} • {selectedJournalForContext.time}</Text>
                    </View>
                    <View>
                      <TouchableOpacity className="flex-row items-center p-4 border-b border-zinc-800" onPress={() => { 
                        setShowContextMenu(false); 
                        setTimeout(() => {
                          router.push({ 
                            pathname: "/JournalPage", 
                            params: { id: journalId, mode: 'edit' } 
                          }); 
                        }, 50);
                      }}>
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-zinc-700">
                          <Ionicons name="pencil-outline" size={18} color="#d4d4d8" />
                        </View>
                        <Text className="text-white">Edit Journal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-row items-center p-4 border-b border-zinc-800" onPress={() => { setShowContextMenu(false); setSelectedJournalForFolder(selectedJournalForContext); setShowFolderManagementModal(true); }}>
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-zinc-700">
                          <Ionicons name="folder-outline" size={18} color="#d4d4d8" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white">Manage Folder</Text>
                          {folder && (
                            <View className="flex-row items-center mt-1">
                              <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: folder.color }} />
                              <Text className="text-zinc-400 text-xs">{folder.name}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-row items-center p-4" onPress={() => { setShowContextMenu(false); deleteJournal(journalId); }}>
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

  const deleteJournal = async (journalId) => {
    try {
      if (!user || !user.Journal) return;
      const updatedJournals = user.Journal.filter(j => j.id.toString() !== journalId.toString());
      const updatedUser = { ...user, Journal: updatedJournals };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

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
      if (diffDay > 0) return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
      else if (diffHour > 0) return `${diffHour}h ago`;
      else if (diffMin > 0) return `${diffMin}m ago`;
      else return 'just now';
    } catch (e) {
      console.log('Error formatting time ago:', e);
      return '';
    }
  };

  const saveThemePreference = async (themeKey) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, themePreference: themeKey };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSelectedTheme(themeKey);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        if (user) {
          // No need to parse user again since it's already an object
          setSelectedTheme(user.themePreference || 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setSelectedTheme('dark');
      }
    };
    loadThemePreference();
  }, [user]);

  useEffect(() => {
    const updateStreak = () => {
      if (!user) return;
      try {
        // No need to parse user again since it's already an object
        if (!user.Journal || !Array.isArray(user.Journal) || user.Journal.length === 0) {
          setCurrentStreak(0);
          return;
        }
        const sortedEntries = [...user.Journal].sort((a, b) => new Date(b.date) - new Date(a.date));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const latestEntryDate = new Date(sortedEntries[0].date);
        latestEntryDate.setHours(0, 0, 0, 0);
        if (latestEntryDate.getTime() !== today.getTime()) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (latestEntryDate.getTime() !== yesterday.getTime()) {
            setCurrentStreak(0);
            return;
          }
        }
        let streak = 1;
        let currentDate = latestEntryDate;
        for (let i = 1; i < sortedEntries.length; i++) {
          const entryDate = new Date(sortedEntries[i].date);
          entryDate.setHours(0, 0, 0, 0);
          const expectedPrevDate = new Date(currentDate);
          expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
          if (entryDate.getTime() === expectedPrevDate.getTime()) {
            streak++;
            currentDate = entryDate;
          } else break;
        }
        setCurrentStreak(streak);
      } catch (error) {
        console.error('Error calculating streak:', error);
        setCurrentStreak(0);
      }
    };
    updateStreak();
  }, [user]);

  // Add a useEffect hook to load the selected folder and date from AsyncStorage
  useEffect(() => {
    const loadSelections = async () => {
      try {
        // Load selected folder
        const storedFolder = await AsyncStorage.getItem('selectedFolder');
        if (storedFolder) {
          setSelectedFolder(storedFolder);
        }
        
        // Load selected date
        const storedDate = await AsyncStorage.getItem('selectedDate');
        if (storedDate) {
          setSelectedDate(new Date(JSON.parse(storedDate)));
        }
      } catch (error) {
        console.error('Error loading selections:', error);
      }
    };
    
    loadSelections();
  }, []);

  // Add a useFocusEffect to reload selections when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const reloadSelections = async () => {
        try {
          // Load selected folder
          const storedFolder = await AsyncStorage.getItem('selectedFolder');
          if (storedFolder) {
            setSelectedFolder(storedFolder);
          }
          
          // Load selected date
          const storedDate = await AsyncStorage.getItem('selectedDate');
          if (storedDate) {
            setSelectedDate(new Date(JSON.parse(storedDate)));
          }
        } catch (error) {
          console.error('Error reloading selections:', error);
        }
      };
      
      reloadSelections();
    }, [])
  );

  const assignJournalToFolder = async (journalId, folderId) => {
    try {
      if (!user || !user.Journal) return;
      const journalIndex = user.Journal.findIndex(j => j.id.toString() === journalId.toString());
      if (journalIndex === -1) return;
      const updatedJournals = [...user.Journal];
      updatedJournals[journalIndex] = { ...updatedJournals[journalIndex], folderId: folderId };
      const updatedUser = { ...user, Journal: updatedJournals };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowFolderManagementModal(false);
    } catch (error) {
      console.error('Error assigning journal to folder:', error);
    }
  };

  // Options Overlay Component
  const OptionsOverlay = () => {
    if (!showOptionsOverlay) return null;
    
    return (
      <Modal transparent={true} visible={true} animationType="none" onRequestClose={toggleOptionsOverlay}>
        <TouchableOpacity activeOpacity={1} onPress={toggleOptionsOverlay} className="flex-1">
          <Animated.View 
            style={{ 
              opacity: optionsAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              flex: 1,
            }}
          >
            <TouchableOpacity activeOpacity={1} className="flex-1" onPress={toggleOptionsOverlay}>
              <Animated.View 
                style={{
                  transform: [
                    { 
                      translateY: optionsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ],
                  position: 'absolute',
                  top: 100,
                  right: 20,
                  opacity: optionsAnim,
                }}
              >
                <BlurView intensity={30} tint="dark" className="rounded-2xl overflow-hidden">
                  <View className="bg-zinc-900/80 rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#3f3f46' }}>
                    <TouchableOpacity 
                      className="px-4 py-3.5 flex-row items-center" 
                      onPress={() => {
                        toggleOptionsOverlay();
                        // Add a slight delay to ensure the options overlay closes first
                        setTimeout(() => {
                          router.push('/Modal/Theme');
                        }, 100);
                      }}
                    >
                      <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                        <Ionicons name="color-palette-outline" size={18} color="#c084fc" />
                      </View>
                      <Text className="text-white text-base font-medium">Theme</Text>
                    </TouchableOpacity>
                    
                    <View className="h-[1px] bg-zinc-800" />
                    
                    <TouchableOpacity 
                      className="px-4 py-3.5 flex-row items-center" 
                      onPress={() => {
                        toggleOptionsOverlay();
                        setTimeout(() => {
                          router.push('/Modal/Settings');
                        }, 100);
                      }}
                    >
                      <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                        <Ionicons name="settings-outline" size={18} color="#60a5fa" />
                      </View>
                      <Text className="text-white text-base font-medium">Settings</Text>
                    </TouchableOpacity>
                    
                    <View className="h-[1px] bg-zinc-800" />
                    
                    <TouchableOpacity className="px-4 py-3.5 flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center mr-3">
                        <Ionicons name="help-circle-outline" size={18} color="#4ade80" />
                      </View>
                      <Text className="text-white text-base font-medium">Help</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Theme Overlay Component
  const ThemeOverlay = () => {
    if (!showThemeOverlay) return null;
    
    const handleThemeSelect = async (themeKey) => {
      try {
        setSelectedTheme(themeKey);
        // Save theme preference to user data
        if (user) {
          const updatedUser = { ...user, themePreference: themeKey };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        toggleThemeOverlay();
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };
    
    return (
      <Modal transparent={true} visible={true} animationType="none" onRequestClose={toggleThemeOverlay}>
        <TouchableOpacity activeOpacity={1} onPress={toggleThemeOverlay} className="flex-1">
          <Animated.View 
            style={{ 
              opacity: themeAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              flex: 1,
            }}
          >
            <TouchableOpacity activeOpacity={1} className="flex-1" onPress={toggleThemeOverlay}>
              <Animated.View 
                style={{
                  transform: [
                    { 
                      translateY: themeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ],
                  position: 'absolute',
                  top: 100,
                  right: 20,
                  opacity: themeAnim,
                }}
              >
                <BlurView intensity={30} tint="dark" className="rounded-2xl overflow-hidden">
                  <View className="bg-zinc-900/80 rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#3f3f46' }}>
                    <View className="px-4 py-3">
                      <Text className="text-white text-lg font-bold mb-2">Select Theme</Text>
                      {Object.entries(themes).map(([key, theme]) => (
                        <TouchableOpacity 
                          key={key}
                          className="flex-row items-center py-2.5"
                          onPress={() => handleThemeSelect(key)}
                        >
                          <View 
                            className="w-8 h-8 rounded-full mr-3" 
                            style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.accent }}
                          />
                          <View className="flex-1">
                            <Text className="text-white font-medium">{theme.name}</Text>
                            <Text className="text-zinc-400 text-xs">{theme.description}</Text>
                          </View>
                          {selectedTheme === key && (
                            <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <LinearGradient colors={['rgba(38, 38, 38, 0.2)', 'rgba(0, 0, 0, 0)']} className="absolute w-full h-96" />
        <TouchableOpacity activeOpacity={1} onPress={handlePressOutside} className="flex-1">
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
                    <Text className="text-zinc-400 text-sm">{getFilteredEntries().length} {getFilteredEntries().length === 1 ? 'entry' : 'entries'}</Text>
                  </View>
                )}
                ListEmptyComponent={() => (
                  <View className="flex-1 justify-center items-center py-10">
                    <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: 'rgba(39, 39, 42, 0.6)' }}>
                      <Ionicons name="journal-outline" size={28} color="#a1a1aa" />
                    </View>
                    <Text className="text-zinc-400 text-base text-center mb-2">No journal entries found</Text>
                    <Text className="text-zinc-500 text-sm text-center px-8">Create your first journal entry to start documenting your thoughts</Text>
                  </View>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <View className="rounded-full overflow-hidden" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
            <LinearGradient colors={['rgba(39, 39, 42, 0.9)', 'rgba(24, 24, 27, 0.9)']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="p-[1px] rounded-full">
              <TouchableOpacity 
                className="w-full h-12 rounded-full" 
                style={{ backgroundColor: 'rgba(24, 24, 27, 0.8)' }} 
                onPress={() => {
                  console.log('Opening Ask Your Journal');
                  setTimeout(() => {
                    router.push({
                      pathname: "/AskJournal"
                    });
                  }, 50);
                }}
              >
                <View className="w-full h-full flex-row items-center justify-center">
                  <Ionicons name="search" size={18} color="#e4e4e7" style={{ marginRight: 8 }} />
                  <Text className="text-zinc-200 text-base font-medium">Ask Your Journal</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
        <FolderManagementModal />
        <ContextMenu />
        <OptionsOverlay />
        {showThemeOverlay && <ThemeOverlay />}
      </SafeAreaView>
    </View>
  );
}