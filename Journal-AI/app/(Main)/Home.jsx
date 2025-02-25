import { View, TextInput, SafeAreaView, TouchableOpacity, Keyboard, Text, Animated, Easing, FlatList, ScrollView, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function Home() {
  const [folders, setFolders] = useState([
    { id: '1', name: 'Personal', color: '#3b82f6' },
    { id: '2', name: 'Work', color: '#ef4444' },
    { id: '3', name: 'Ideas', color: '#10b981' }
  ]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  
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
    
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Text className="text-white text-2xl font-bold mr-2">Journal</Text>
            <TouchableOpacity 
              className="flex-row items-center bg-zinc-800/40 rounded-lg px-2 py-1"
              onPress={() => setShowFolderModal(true)}
            >
              <Text className="text-gray-300 text-sm mr-1">{getCurrentFolder()}</Text>
              <Ionicons name="chevron-down" size={14} color="#a8a29e" />
            </TouchableOpacity>
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
              onPress={() => console.log('Create new journal entry')}
            >
              <Ionicons name="add" size={20} color="#d6d3d1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-zinc-800/80 rounded-full p-2"
              onPress={() => console.log('Open settings')}
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
      <View className="mb-4 bg-zinc-900/80 rounded-xl overflow-hidden">
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
      </View>
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
      onRequestClose={() => setShowFolderModal(false)}
    >
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={() => setShowFolderModal(false)}
      >
        <View className="bg-zinc-900 m-6 rounded-xl overflow-hidden" style={{ marginTop: 100 }}>
          <View className="border-b border-zinc-800 p-4">
            <Text className="text-white text-lg font-medium">Folders</Text>
          </View>
          
          <FlatList
            data={folders}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-zinc-800"
                onPress={() => {
                  setSelectedFolder(item.id === selectedFolder ? null : item.id);
                  setShowFolderModal(false);
                }}
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

      <View className="px-4 pb-8 pt-2">
        <LinearGradient
          colors={['#44403c', '#78716c', '#a8a29e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-full p-[1.5px]"
        >
          <View className="flex-row items-center bg-[#1C1C1E] rounded-full px-4 py-3.5">
            {inputText === '' && !isFocused && renderPlaceholderText()}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              className="flex-1 text-base text-gray-200 mr-2"
              multiline={false}
              returnKeyType="send"
              blurOnSubmit={true}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={handleJournalSubmit}
            />
            <TouchableOpacity
              className="bg-transparent"
              activeOpacity={0.7}
              onPress={handleJournalSubmit}
            >
              <LinearGradient
                colors={['#44403c', '#78716c', '#a8a29e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-full p-2"
              >
                <Ionicons name="mic" size={20} color="#1C1C1E" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
