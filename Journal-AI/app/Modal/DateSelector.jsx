import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, subWeeks, subDays, startOfMonth as dateStartOfMonth, subMonths, addMonths } from 'date-fns';

export default function DateSelector() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const loadDateSelection = async () => {
      try {
        const storedDate = await AsyncStorage.getItem('selectedDate');
        if (storedDate) {
          const parsedDate = new Date(JSON.parse(storedDate));
          setSelectedDate(parsedDate);
          setCurrentMonth(parsedDate);
        }
      } catch (error) {
        console.error('Error loading date selection:', error);
      }
    };

    loadDateSelection();
  }, []);

  const handleDateSelection = async (date) => {
    try {
      setSelectedDate(date);
      await AsyncStorage.setItem('selectedDate', JSON.stringify(date));
      router.back();
    } catch (error) {
      console.error('Error saving date selection:', error);
    }
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dayOfWeek = monthStart.getDay();
    const paddingDays = Array(dayOfWeek).fill(null);
    return [...paddingDays, ...daysInMonth];
  };

  const dateOptions = [
    { label: 'Today', date: new Date() },
    { label: 'Yesterday', date: subDays(new Date(), 1) },
    { label: 'This Week', date: startOfWeek(new Date()) },
    { label: 'This Month', date: dateStartOfMonth(new Date()) },
    { label: 'Last Month', date: dateStartOfMonth(subMonths(new Date(), 1)) },
  ];

  const navigateToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const navigateToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(38, 38, 38, 0.8)', 'rgba(0, 0, 0, 0.8)']}
        className="absolute w-full h-full"
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-4 pt-4">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              >
                <Ionicons name="arrow-back" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Select Date</Text>
            </View>
          </View>

          <View className="bg-zinc-900/70 rounded-xl overflow-hidden mb-6">
            <BlurView intensity={20} tint="dark" className="p-4">
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity 
                  onPress={navigateToPreviousMonth} 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
                >
                  <Ionicons name="chevron-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-medium">{format(currentMonth, 'MMMM yyyy')}</Text>
                <TouchableOpacity 
                  onPress={navigateToNextMonth} 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
                >
                  <Ionicons name="chevron-forward" size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <Text key={index} className="text-zinc-400 text-center font-medium" style={{ width: 40 }}>{day}</Text>
                ))}
              </View>

              <View className="flex-row flex-wrap">
                {generateCalendarDays().map((date, index) => {
                  if (!date) return <View key={`empty-${index}`} style={{ width: 40, height: 40, margin: 2 }} />;
                  
                  const isToday = isSameDay(date, new Date());
                  const isSelected = isSameDay(date, selectedDate);
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      onPress={() => handleDateSelection(date)} 
                      className={`items-center justify-center rounded-full m-1 ${
                        isSelected ? 'bg-blue-500' : isToday ? 'bg-zinc-700' : ''
                      }`} 
                      style={{ width: 40, height: 40 }}
                    >
                      <Text className={`text-center ${
                        isSelected ? 'text-white font-bold' : isToday ? 'text-white' : 'text-zinc-300'
                      }`}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BlurView>
          </View>

          <View className="bg-zinc-900/70 rounded-xl overflow-hidden mb-6">
            <BlurView intensity={20} tint="dark" className="p-4">
              <Text className="text-white text-lg font-medium mb-4">Quick Select</Text>
              <View className="flex-row flex-wrap">
                {dateOptions.map((option, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => handleDateSelection(option.date)} 
                    className={`bg-zinc-800 rounded-xl px-4 py-3 mr-3 mb-3 ${
                      isSameDay(option.date, selectedDate) ? 'border-2 border-blue-500' : ''
                    }`}
                  >
                    <Text className="text-white text-base">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </View>

          <TouchableOpacity 
            className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-white text-lg font-medium">Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
} 