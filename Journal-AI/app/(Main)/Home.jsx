import { View, TextInput, SafeAreaView, TouchableOpacity, Keyboard, Text, Animated, Easing, FlatList, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, subWeeks, subDays, startOfYear, subMonths } from 'date-fns';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import JournalIcon from '../../assets/Icons/TextIcon.png';
import { Image } from 'react-native';

export default function Home() {
  const router = useRouter();
  const [folders, setFolders] = useState([
    { id: '1', name: 'Personal', color: '#3b82f6' },
    { id: '2', name: 'Work', color: '#ef4444' },
    { id: '3', name: 'Ideas', color: '#10b981' }
  ]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOptionsOverlay, setShowOptionsOverlay] = useState(false);
  const [newJournalType, setNewJournalType] = useState('');
  const [folderSelectionAnim] = useState(new Animated.Value(0));
  
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
  const optionsBlurAnim = useRef(new Animated.Value(0)).current;
  const optionsContentAnim = useRef(new Animated.Value(0)).current;
  
  // Toggle folder modal
  const toggleFolderModal = () => {
    setShowFolderModal(!showFolderModal);
  };
  
  // Toggle options overlay
  const toggleOptionsOverlay = () => {
    if (showOptionsOverlay) {
      // Animate out first, then hide the overlay
      Animated.parallel([
        // Animate content out with a slight upward motion
        Animated.timing(optionsContentAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        // Delay the blur fadeout slightly
        Animated.sequence([
          Animated.delay(50),
          Animated.timing(optionsBlurAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.in(Easing.ease),
          }),
        ]),
      ]).start(() => {
        // Only update state after animation completes
        setShowOptionsOverlay(false);
      });
    } else {
      // Reset animation values first
      optionsBlurAnim.setValue(0);
      optionsContentAnim.setValue(0);
      
      // Show first, then animate in
      setShowOptionsOverlay(true);
      
      // Animate in
      Animated.parallel([
        // Start blur immediately
        Animated.timing(optionsBlurAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
        // Bring in content with a slight bounce
        Animated.timing(optionsContentAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    }
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
        folderId: selectedFolder,
        folders: JSON.stringify(folders)
      }
    });
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
  const optionsScale = optionsContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  
  const optionsOpacity = optionsContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const optionsTranslateY = optionsContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  // Background opacity for options overlay
  const optionsBackdropOpacity = optionsBlurAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;
  
  const [journalEntries, setJournalEntries] = useState([
    {
      id: '1',
      title: 'New Project Kickoff',
      date: 'Today',
      time: '9:30 AM',
      content: 'Started working on my new project. Feeling excited about the possibilities!',
      mood: 'happy',
      folderId: '2'
    },
    {
      id: '2',
      title: 'Dinner with Friends',
      date: 'Yesterday',
      time: '8:45 PM',
      content: 'Had dinner with friends. We talked about our future plans and shared some great memories.',
      mood: 'relaxed',
      folderId: '1'
    },
    {
      id: '3',
      title: 'Autumn Walk',
      date: 'Nov 12, 2023',
      time: '3:20 PM',
      content: 'Went for a long walk in the park. The autumn colors were beautiful.',
      mood: 'peaceful',
      folderId: '1'
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleJournalSubmit = () => {
    if (inputText.trim() === '') return;
    
    const newEntry = {
      id: Date.now().toString(),
      title: `Journal Entry ${journalEntries.length + 1}`,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: inputText,
      mood: 'default',
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
    const today = new Date();
    
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
    
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Text className="text-white text-2xl font-bold mr-2">JourneyAI</Text>
            <TouchableOpacity 
              className="flex-row items-center bg-zinc-800/40 rounded-lg px-2 py-1"
              onPress={toggleFolderModal}
              style={selectedFolder ? { borderLeftWidth: 3, borderLeftColor: getFolderColor(), paddingLeft: 6 } : {}}
            >
              <Text className="text-gray-300 text-sm mr-1">{getCurrentFolder()}</Text>
              <Ionicons name="chevron-down" size={14} color="#a8a29e" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2 mr-2"
              onPress={toggleFolderModal}
            >
              <Ionicons name="folder-outline" size={20} color="#d6d3d1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2 mr-2"
              onPress={() => createNewJournal('journal')}
            >
              <Ionicons name="add" size={20} color="#d6d3d1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2"
              onPress={toggleOptionsOverlay}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#d6d3d1" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center justify-between bg-zinc-800/40 rounded-lg p-3 mb-4"
          onPress={toggleCalendarModal}
        >
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#d6d3d1" />
            <Text className="text-white font-medium ml-2">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#d6d3d1" />
        </TouchableOpacity>
        
        {/* Simplified Calendar Modal */}
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
                  <View className="w-full bg-zinc-800/80 rounded-xl p-4 mb-4">
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
                              isSelected ? 'bg-blue-500' : isToday ? 'bg-zinc-700' : ''
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
                  <View className="w-full bg-zinc-800/80 rounded-xl p-4 mb-4">
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
                    className="w-full bg-blue-600 rounded-xl py-3 items-center"
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

    const getFolderColor = (folderId) => {
      if (!folderId) return null;
      const folder = folders.find(f => f.id === folderId);
      return folder ? folder.color : null;
    };

    const folderColor = getFolderColor(item.folderId);

    return (
      <TouchableOpacity 
        className="mb-4 bg-zinc-900/80 rounded-xl overflow-hidden"
        onPress={() => router.push({
          pathname: "/JournalPage",
          params: { id: item.id }
        })}
      >
        {folderColor && (
          <View 
            className="h-1 w-full" 
            style={{ backgroundColor: folderColor }}
          />
        )}
        
        <View className="p-4 border-b border-zinc-800">
          <View className="flex-row justify-between items-center">
            <Text className="text-white font-medium text-base">{item.title}</Text>
          <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={14} color="#a8a29e" />
              <View className="w-1 h-1 mx-2 bg-zinc-700 rounded-full" />
              <Ionicons name={getMoodIcon(item.mood)} size={14} color="#a8a29e" />
          </View>
        </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-zinc-500 text-xs">{item.date}</Text>
            <Text className="text-zinc-600 text-xs mx-1">•</Text>
            <Text className="text-zinc-500 text-xs">{item.time}</Text>
            {item.folderId && (
              <>
                <Text className="text-zinc-600 text-xs mx-1">•</Text>
                <View 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: folderColor }}
                />
                <Text className="text-zinc-500 text-xs">
                  {folders.find(f => f.id === item.folderId)?.name}
                </Text>
              </>
            )}
          </View>
        </View>
        
        <View className="p-4">
          <Text className="text-zinc-300 leading-5">{item.content}</Text>
          
        <View className="flex-row mt-3 justify-end">
            <TouchableOpacity className="mr-3 bg-zinc-800 rounded-full p-1.5">
              <Ionicons name="pencil-outline" size={14} color="#a8a29e" />
          </TouchableOpacity>
            <TouchableOpacity className="bg-zinc-800 rounded-full p-1.5">
              <Ionicons name="trash-outline" size={14} color="#a8a29e" />
          </TouchableOpacity>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  const getFilteredEntries = () => {
    let filtered = journalEntries;
    
    if (selectedDate) {
      filtered = filtered.filter(entry => {
        if (entry.date === 'Today' && selectedDate.toDateString() === new Date().toDateString()) {
          return true;
        }
        if (entry.date === 'Yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return selectedDate.toDateString() === yesterday.toDateString();
        }
        
        try {
          const entryDate = new Date(entry.date + ", " + new Date().getFullYear());
          return entryDate.toDateString() === selectedDate.toDateString();
        } catch (e) {
          return false;
        }
      });
    }
    
    if (selectedFolder) {
      filtered = filtered.filter(entry => entry.folderId === selectedFolder);
    }
    
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
                  
                  {folders.map(folder => (
                    <TouchableOpacity
                      key={folder.id}
                      className={`flex-row items-center p-3 mb-2 rounded-lg ${selectedFolder === folder.id ? 'bg-blue-500/20' : ''}`}
                      onPress={() => animateFolderSelection(folder.id)}
                    >
                      <View className="w-5 h-5 rounded-full" style={{ backgroundColor: folder.color }} />
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
            </View>
          </Animated.View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['rgba(38, 38, 38, 0.2)', 'rgba(0, 0, 0, 0)']}
        className="absolute w-full h-96"
      />

      <FolderModal />
      <OptionsOverlay />

      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handlePressOutside} 
        className="flex-1"
      >
        <View className="flex-1 px-4 pt-2">
          <JournalHeader />
          
            <FlatList
            data={getFilteredEntries()}
              renderItem={renderJournalEntry}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Ionicons name="journal-outline" size={50} color="#4a4a4a" />
                <Text className="text-gray-400 mt-4 text-base font-medium">
                  {selectedFolder ? "No entries in this folder" : "No entries for this date"}
                </Text>
                <Text className="text-gray-600 text-center mt-2 px-10 text-sm">
                  {selectedFolder 
                    ? "Try selecting a different folder or create a new entry" 
                    : "Try selecting a different date or create a new entry"
                  }
                </Text>
              </View>
            }
          />
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
    </SafeAreaView>
  );
}
