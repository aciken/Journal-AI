import { View, TextInput, SafeAreaView, TouchableOpacity, Keyboard, Text, Animated, Easing, FlatList, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import TextIcon from '../../assets/Icons/TextIcon.png';
import VoiceIcon from '../../assets/Icons/VoiceIcon.png';
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
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [newJournalType, setNewJournalType] = useState('');
  const [newJournalName, setNewJournalName] = useState('');
  const [folderSelectionAnim] = useState(new Animated.Value(0));
  
  // Animation values for folder modal
  const blurAnim = useRef(new Animated.Value(0)).current;
  const modalContentAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for naming modal
  const namingBlurAnim = useRef(new Animated.Value(0)).current;
  const namingModalContentAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for create modal
  const createBlurAnim = useRef(new Animated.Value(0)).current;
  const createModalContentAnim = useRef(new Animated.Value(0)).current;
  
  // Animate folder modal
  useEffect(() => {
    if (showFolderModal) {
      // Reset animation values
      blurAnim.setValue(0);
      modalContentAnim.setValue(0);
      
      // Open animation - start blur immediately
      Animated.timing(blurAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
      
      // Then bring in the content
      Animated.timing(modalContentAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else if (blurAnim._value > 0) { // Only run closing animation if modal was open
      // Closing animation
      Animated.parallel([
        // Animate content out
        Animated.timing(modalContentAnim, {
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
      ]).start();
    }
  }, [showFolderModal]);
  
  // Animate naming modal
  useEffect(() => {
    if (showNamingModal) {
      // Reset animation values
      namingBlurAnim.setValue(0);
      namingModalContentAnim.setValue(0);
      
      // Open animation - start blur immediately
      Animated.timing(namingBlurAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
      
      // Then bring in the content
      Animated.timing(namingModalContentAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else if (namingBlurAnim._value > 0) { // Only run closing animation if modal was open
      // Closing animation
      Animated.parallel([
        // Animate content out
        Animated.timing(namingModalContentAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        
        // Delay the blur fadeout slightly
        Animated.sequence([
          Animated.delay(50),
          Animated.timing(namingBlurAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.in(Easing.ease),
          }),
        ]),
      ]).start();
    }
  }, [showNamingModal]);
  
  // Animate create modal
  useEffect(() => {
    if (showCreateModal) {
      // Reset animation values
      createBlurAnim.setValue(0);
      createModalContentAnim.setValue(0);
      
      // Open animation - start blur immediately
      Animated.timing(createBlurAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
      
      // Then bring in the content
      Animated.timing(createModalContentAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else if (createBlurAnim._value > 0) { // Only run closing animation if modal was open
      // Closing animation
      Animated.parallel([
        // Animate content out
        Animated.timing(createModalContentAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        
        // Delay the blur fadeout slightly
        Animated.sequence([
          Animated.delay(50),
          Animated.timing(createBlurAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.in(Easing.ease),
          }),
        ]),
      ]).start();
    }
  }, [showCreateModal]);
  
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
    setNewJournalName('');
    
    // First animate the create modal closing
    Animated.parallel([
      // Animate content out
      Animated.timing(createModalContentAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      
      // Delay the blur fadeout slightly
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(createBlurAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.in(Easing.ease),
        }),
      ]),
    ]).start(() => {
      // After animation completes, close create modal and open naming modal
      setShowCreateModal(false);
      setShowNamingModal(true);
    });
  };
  
  // Confirm journal creation and navigate
  const confirmJournalCreation = () => {
    if (!newJournalName.trim()) {
      // Default name if empty
      setNewJournalName(`New ${newJournalType.charAt(0).toUpperCase() + newJournalType.slice(1)} Journal`);
    }
    
    // Create a new journal entry
    const newEntry = {
      id: Date.now().toString(),
      title: newJournalName.trim() || `New ${newJournalType.charAt(0).toUpperCase() + newJournalType.slice(1)} Journal`,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '',
      mood: 'default',
      type: newJournalType,
      folderId: selectedFolder
    };
    
    // Add to journal entries
    setJournalEntries([newEntry, ...journalEntries]);
    
    // First animate the naming modal closing
    Animated.parallel([
      // Animate content out
      Animated.timing(namingModalContentAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      
      // Delay the blur fadeout slightly
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(namingBlurAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.in(Easing.ease),
        }),
      ]),
    ]).start(() => {
      // After animation completes, close naming modal and navigate
      setShowNamingModal(false);
      
      // Navigate to the journal page
      router.push({
        pathname: "/JournalPage",
        params: { id: newEntry.id }
      });
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
  
  // Derived animations for naming modal
  const namingModalScale = namingModalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  
  const namingModalTranslateY = namingModalContentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  // Background opacity for naming modal
  const namingBackdropOpacity = namingBlurAnim.interpolate({
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
      type: 'text',
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
    
    const calendarHeight = useRef(new Animated.Value(0)).current;
    const calendarOpacity = useRef(new Animated.Value(0)).current;
    
    // Folder selection animation scale
    const folderSelectionScale = folderSelectionAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.1, 1],
    });
    
    // Folder selection animation color
    const folderSelectionOpacity = folderSelectionAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 1],
    });
    
    useEffect(() => {
      if (showCalendar) {
        Animated.parallel([
          Animated.timing(calendarHeight, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false
          }),
          Animated.timing(calendarOpacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false
          })
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(calendarHeight, {
            toValue: 0,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: false
          }),
          Animated.timing(calendarOpacity, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: false
          })
        ]).start();
      }
    }, [showCalendar]);
    
    const generateCalendarDays = () => {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const dayOfWeek = monthStart.getDay();
      const paddingDays = Array(dayOfWeek).fill(null);
      
      return [...paddingDays, ...daysInMonth];
    };
    
    const quickDates = [
      { label: 'Today', date: today },
      { label: 'Yesterday', date: new Date(today.setDate(today.getDate() - 1)) },
      { label: 'This Week', date: new Date(today.setDate(today.getDate() - today.getDay())) },
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
            <Text className="text-white text-2xl font-bold mr-2">Journal</Text>
            <Animated.View
              style={{
                transform: [{ scale: folderSelectionScale }],
                opacity: folderSelectionOpacity,
              }}
            >
              <TouchableOpacity 
                className="flex-row items-center bg-zinc-800/40 rounded-lg px-2 py-1"
                onPress={() => setShowFolderModal(true)}
                style={selectedFolder ? { borderLeftWidth: 3, borderLeftColor: getFolderColor(), paddingLeft: 6 } : {}}
              >
                <Text className="text-gray-300 text-sm mr-1">{getCurrentFolder()}</Text>
                <Ionicons name="chevron-down" size={14} color="#a8a29e" />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2 mr-2"
              onPress={() => setShowFolderModal(true)}
            >
              <Ionicons name="folder-outline" size={20} color="#d6d3d1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2 mr-2"
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#d6d3d1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2"
              onPress={() => router.push('/Modal/Settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#d6d3d1" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center justify-between bg-zinc-800/40 rounded-lg p-3 mb-4"
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#d6d3d1" />
            <Text className="text-white font-medium ml-2">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <Animated.View
            style={{
              transform: [{
                rotate: calendarHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                })
              }]
            }}
          >
            <Ionicons name="chevron-down" size={18} color="#d6d3d1" />
          </Animated.View>
        </TouchableOpacity>
        
        <Animated.View 
          style={{
            opacity: calendarOpacity,
            maxHeight: calendarHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 350]
            }),
            overflow: 'hidden',
            marginBottom: calendarHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 16]
            })
          }}
        >
          <View className="bg-zinc-800/40 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  const prevMonth = new Date(selectedDate);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setSelectedDate(prevMonth);
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#d6d3d1" />
              </TouchableOpacity>
              
              <Text className="text-white font-medium">
                {format(selectedDate, 'MMMM yyyy')}
              </Text>
              
              <TouchableOpacity
                onPress={() => {
                  const nextMonth = new Date(selectedDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setSelectedDate(nextMonth);
                }}
              >
                <Ionicons name="chevron-forward" size={20} color="#d6d3d1" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row justify-between mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} className="text-gray-400 text-center" style={{ width: 32 }}>
                  {day}
                </Text>
              ))}
            </View>
            
            <View className="flex-row flex-wrap">
              {generateCalendarDays().map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={{ width: 32, height: 32, margin: 2 }} />;
                }
                
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, selectedDate);
                const hasEntries = journalEntries.some(entry => {
                  if (entry.date === 'Today' && isToday) return true;
                  return false;
                });
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDate(date)}
                    className={`items-center justify-center rounded-full m-1 ${
                      isSelected ? 'bg-blue-500' : isToday ? 'bg-zinc-700' : ''
                    }`}
                    style={{ width: 32, height: 32 }}
                  >
                    <Text 
                      className={`text-center ${
                        isSelected ? 'text-white font-bold' : 
                        isToday ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {date.getDate()}
                    </Text>
                    {hasEntries && (
                      <View className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View className="flex-row mt-4 pt-3 border-t border-zinc-700">
              {quickDates.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDate(item.date)}
                  className="bg-zinc-700/60 rounded-full px-3 py-1 mr-2"
                >
                  <Text className="text-white text-xs">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
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

    const getEntryTypeIcon = (type) => {
      return type === 'voice' ? 'mic-outline' : 'document-text-outline';
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
              <Ionicons name={getEntryTypeIcon(item.type)} size={14} color="#a8a29e" />
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
      animationType="none"
      onRequestClose={() => {
        // Animate closing when back button is pressed
        Animated.parallel([
          // Animate content out
          Animated.timing(modalContentAnim, {
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
          setShowFolderModal(false);
        });
      }}
    >
      <TouchableOpacity 
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={() => {
          // Animate closing when backdrop is pressed
          Animated.parallel([
            // Animate content out
            Animated.timing(modalContentAnim, {
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
            setShowFolderModal(false);
          });
        }}
      >
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
        
        {/* Modal content with animation */}
        <Animated.View 
          className="flex-1 justify-start items-center px-6"
          style={{
            opacity: modalContentAnim,
            transform: [
              { translateY: modalTranslateY },
              { scale: modalScale },
            ]
          }}
        >
          <View className="bg-zinc-900 rounded-xl overflow-hidden w-full mt-24">
            <View className="border-b border-zinc-800 p-4">
              <Text className="text-white text-lg font-medium">Folders</Text>
            </View>
            
            <FlatList
              data={folders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
      <TouchableOpacity 
                  className="flex-row items-center p-4 border-b border-zinc-800"
                  onPress={() => animateFolderSelection(item.id)}
                >
                  <View 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-white flex-1">{item.name}</Text>
                  {selectedFolder === item.id && (
                    <Ionicons name="checkmark" size={20} color="#d6d3d1" />
                  )}
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity 
                  className="flex-row items-center p-4"
        onPress={() => {
                    console.log('Create new folder');
                    setShowFolderModal(false);
        }}
      >
                  <View className="w-6 h-6 rounded-full bg-zinc-800 items-center justify-center mr-2">
                    <Ionicons name="add" size={16} color="#d6d3d1" />
                  </View>
                  <Text className="text-blue-400">Create New Folder</Text>
      </TouchableOpacity>
              }
            />
    </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
  
  // Create Journal Modal
  const CreateJournalModal = () => (
    <Modal
      visible={showCreateModal}
      transparent={true}
      animationType="none"
      onRequestClose={() => {
        // Animate closing when back button is pressed
        Animated.parallel([
          // Animate content out
          Animated.timing(createModalContentAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          
          // Delay the blur fadeout slightly
          Animated.sequence([
            Animated.delay(50),
            Animated.timing(createBlurAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
              easing: Easing.in(Easing.ease),
            }),
          ]),
        ]).start(() => {
          setShowCreateModal(false);
        });
      }}
    >
      <TouchableOpacity 
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={() => {
          // Animate closing when backdrop is pressed
          Animated.parallel([
            // Animate content out
            Animated.timing(createModalContentAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.in(Easing.cubic),
            }),
            
            // Delay the blur fadeout slightly
            Animated.sequence([
              Animated.delay(50),
              Animated.timing(createBlurAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
                easing: Easing.in(Easing.ease),
              }),
            ]),
          ]).start(() => {
            setShowCreateModal(false);
          });
        }}
      >
        {/* Dark overlay with animated opacity */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            opacity: createBackdropOpacity,
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
            opacity: createBlurAnim,
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
        
        {/* Modal content with animation */}
        <Animated.View 
          className="flex-1 justify-start items-center px-6"
          style={{
            opacity: createModalContentAnim,
            transform: [
              { translateY: createModalTranslateY },
              { scale: createModalScale },
            ]
          }}
        >
          <View className="bg-zinc-900 rounded-xl overflow-hidden w-full mt-24">
            <View className="border-b border-zinc-800 p-4">
              <Text className="text-white text-lg font-medium">Create New Journal</Text>
            </View>
            
            <View className="p-4 space-y-5">
              {/* Text Journal Option */}
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => createNewJournal('text')}
              >
                <View className="mr-3">
                  <Image 
                    source={TextIcon} 
                    className="h-12 w-12"
                    resizeMode="contain"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">Text Journal</Text>
                  <Text className="text-zinc-400 text-sm">Write to your journal</Text>
                </View>
              </TouchableOpacity>
              
              {/* Voice Journal Option */}
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => createNewJournal('voice')}
              >
                <View className="mr-3">
                  <Image 
                    source={VoiceIcon} 
                    className="h-12 w-12"
                    resizeMode="contain"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">Voice Journal</Text>
                  <Text className="text-zinc-400 text-sm">Speak to your journal</Text>
                </View>
              </TouchableOpacity>
              
              {/* Photo Journal Option */}
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => createNewJournal('photo')}
              >
                <View className="bg-zinc-800 rounded-full p-3 mr-3">
                  <Ionicons name="image-outline" size={24} color="#d6d3d1" />
                </View>
                
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">Photo Journal</Text>
                  <Text className="text-zinc-400 text-sm">Add photos to your journal</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  // Naming Modal
  const NamingModal = () => (
    <Modal
      visible={showNamingModal}
      transparent={true}
      animationType="none"
      onRequestClose={() => {
        // Animate closing when back button is pressed
        Animated.parallel([
          // Animate content out
          Animated.timing(namingModalContentAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
          
          // Delay the blur fadeout slightly
          Animated.sequence([
            Animated.delay(50),
            Animated.timing(namingBlurAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
              easing: Easing.in(Easing.ease),
            }),
          ]),
        ]).start(() => {
          setShowNamingModal(false);
        });
      }}
    >
      <TouchableOpacity 
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={() => {
          // Animate closing when backdrop is pressed
          Animated.parallel([
            // Animate content out
            Animated.timing(namingModalContentAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.in(Easing.cubic),
            }),
            
            // Delay the blur fadeout slightly
            Animated.sequence([
              Animated.delay(50),
              Animated.timing(namingBlurAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
                easing: Easing.in(Easing.ease),
              }),
            ]),
          ]).start(() => {
            setShowNamingModal(false);
          });
        }}
      >
        {/* Dark overlay with animated opacity */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            opacity: namingBackdropOpacity,
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
            opacity: namingBlurAnim,
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
        
        {/* Modal content with animation */}
        <Animated.View 
          className="flex-1 justify-start items-center px-6"
          style={{
            opacity: namingModalContentAnim,
            transform: [
              { translateY: namingModalTranslateY },
              { scale: namingModalScale },
            ]
          }}
        >
          <View className="bg-zinc-900 rounded-xl overflow-hidden w-full mt-24">
            <View className="border-b border-zinc-800 p-4">
              <Text className="text-white text-lg font-medium">Name Your Journal</Text>
            </View>
            
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <View className="mr-3">
                  {newJournalType === 'text' ? (
                    <Image 
                      source={TextIcon} 
                      className="h-10 w-10"
                      resizeMode="contain"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  ) : newJournalType === 'voice' ? (
                    <Image 
                      source={VoiceIcon} 
                      className="h-10 w-10"
                      resizeMode="contain"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <View className="bg-zinc-800 rounded-full p-2">
                      <Ionicons name="image-outline" size={20} color="#d6d3d1" />
                    </View>
                  )}
                </View>
                <Text className="text-white text-base">
                  {newJournalType.charAt(0).toUpperCase() + newJournalType.slice(1)} Journal
      </Text>
    </View>
              
              <View className="bg-zinc-800/80 rounded-lg border border-zinc-700/50 px-4 py-3 mb-4">
                <TextInput
                  value={newJournalName}
                  onChangeText={setNewJournalName}
                  placeholder="Enter journal name"
                  placeholderTextColor="#a8a29e"
                  className="text-white text-base"
                  autoFocus={true}
                  returnKeyType="done"
                  onSubmitEditing={confirmJournalCreation}
                />
              </View>
              
              {/* Folder Selection */}
              <View className="mb-4">
                <Text className="text-zinc-400 text-sm mb-2">Select Folder</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  <TouchableOpacity 
                    className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${selectedFolder === null ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                    onPress={() => setSelectedFolder(null)}
                  >
                    <Ionicons name="albums-outline" size={16} color="#d6d3d1" style={{ marginRight: 6 }} />
                    <Text className="text-white text-sm">All Journals</Text>
                  </TouchableOpacity>
                  
                  {folders.map(folder => (
                    <TouchableOpacity 
                      key={folder.id}
                      className={`mr-2 px-3 py-2 rounded-lg flex-row items-center ${selectedFolder === folder.id ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                      onPress={() => setSelectedFolder(folder.id)}
                      style={selectedFolder === folder.id ? { borderLeftWidth: 3, borderLeftColor: folder.color, paddingLeft: 8 } : {}}
                    >
                      <View 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: folder.color }}
                      />
                      <Text className="text-white text-sm">{folder.name}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity 
                    className="mr-2 px-3 py-2 rounded-lg flex-row items-center bg-zinc-800/60"
                    onPress={() => {
                      // Here you would open a create folder modal
                      console.log('Create new folder');
                    }}
                  >
                    <View className="w-5 h-5 rounded-full bg-zinc-700 items-center justify-center mr-2">
                      <Ionicons name="add" size={12} color="#d6d3d1" />
                    </View>
                    <Text className="text-blue-400 text-sm">New Folder</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              
              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity 
                  className="bg-zinc-800 rounded-lg px-4 py-2"
                  onPress={() => setShowNamingModal(false)}
                >
                  <Text className="text-white">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-blue-600 rounded-lg px-4 py-2"
                  onPress={confirmJournalCreation}
                >
                  <Text className="text-white font-medium">Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
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
      <CreateJournalModal />
      <NamingModal />

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
