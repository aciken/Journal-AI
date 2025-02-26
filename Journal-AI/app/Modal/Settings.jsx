import { View, Text, TouchableOpacity, ScrollView, Switch, SafeAreaView, Animated, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Easing } from 'react-native';

export default function Settings() {
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;
  const [isClosing, setIsClosing] = useState(false);
  
  // State for toggle settings
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);
  
  // Animate in when component mounts
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(blurAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
    
    // Handle back button press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isClosing) {
        handleClose();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, []);
  
  // Handle close settings with animation
  const handleClose = () => {
    if (isClosing) return;
    
    setIsClosing(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      router.back();
    });
  };
  
  // Setting item component
  const SettingItem = ({ icon, title, description, type, value, onValueChange, onPress }) => (
    <TouchableOpacity 
      className="flex-row items-center py-4 px-4"
      onPress={onPress}
      disabled={type === 'toggle'}
    >
      <View className={`w-10 h-10 rounded-xl justify-center items-center mr-4 ${type === 'danger' ? 'bg-red-500/20' : 'bg-black/60'}`}>
        <Ionicons name={icon} size={22} color={type === 'danger' ? "#f87171" : "#d6d3d1"} />
      </View>
      
      <View className="flex-1">
        <Text className={`text-base font-medium mb-0.5 ${type === 'danger' ? 'text-red-400' : 'text-white'}`}>{title}</Text>
        {description && <Text className="text-sm text-zinc-500">{description}</Text>}
      </View>
      
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#27272a', true: '#3b82f6' }}
          thumbColor={value ? '#ffffff' : '#71717a'}
          ios_backgroundColor="#27272a"
        />
      )}
      
      {type === 'navigate' && (
        <Ionicons name="chevron-forward" size={20} color="#71717a" />
      )}
    </TouchableOpacity>
  );
  
  // Section header component
  const SectionHeader = ({ title }) => (
    <View className="px-5 py-4 bg-transparent">
      <Text className="text-sm font-semibold text-blue-500 uppercase tracking-wider">{title}</Text>
    </View>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Animated blur background */}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: blurAnim }
        ]}
      >
        <BlurView
          intensity={50}
          tint="dark"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </Animated.View>
      
      <Animated.View 
        className="flex-row justify-between items-center px-5 py-4 border-b border-zinc-950"
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <Text className="text-2xl font-bold text-white">Settings</Text>
        <TouchableOpacity 
          className="p-1"
          onPress={handleClose}
        >
          <View className="w-9 h-9 rounded-full bg-black/60 justify-center items-center">
            <Ionicons name="close" size={20} color="#d6d3d1" />
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.ScrollView 
        className="flex-1"
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }} 
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Appearance" />
        <View className="mx-4 rounded-2xl bg-zinc-950 overflow-hidden mb-2">
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            description="Use dark theme throughout the app"
            type="toggle"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>
        
        <SectionHeader title="Notifications" />
        <View className="mx-4 rounded-2xl bg-zinc-950 overflow-hidden mb-2">
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            description="Receive reminders to journal"
            type="toggle"
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
        
        <SectionHeader title="Journal" />
        <View className="mx-4 rounded-2xl bg-zinc-950 overflow-hidden mb-2">
          <SettingItem
            icon="save-outline"
            title="Auto-Save"
            description="Automatically save journal entries"
            type="toggle"
            value={autoSave}
            onValueChange={setAutoSave}
          />
          <View className="h-[1px] bg-zinc-900 ml-14" />
          <SettingItem
            icon="volume-medium-outline"
            title="Sound Effects"
            description="Play sounds when interacting with the app"
            type="toggle"
            value={soundEffects}
            onValueChange={setSoundEffects}
          />
        </View>
        
        <SectionHeader title="Privacy & Security" />
        <View className="mx-4 rounded-2xl bg-zinc-950 overflow-hidden mb-2">
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Lock"
            description="Require authentication to open the app"
            type="toggle"
            value={biometricLock}
            onValueChange={setBiometricLock}
          />
          <View className="h-[1px] bg-zinc-900 ml-14" />
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy Policy"
            type="navigate"
            onPress={() => console.log('Navigate to Privacy Policy')}
          />
          <View className="h-[1px] bg-zinc-900 ml-14" />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            type="navigate"
            onPress={() => console.log('Navigate to Terms of Service')}
          />
        </View>
        
        <SectionHeader title="Account" />
        <View className="mx-4 rounded-2xl bg-zinc-950 overflow-hidden mb-2">
          <SettingItem
            icon="cloud-upload-outline"
            title="Backup & Sync"
            description="Manage your cloud backup settings"
            type="navigate"
            onPress={() => console.log('Navigate to Backup & Sync')}
          />
          <View className="h-[1px] bg-zinc-900 ml-14" />
          <SettingItem
            icon="trash-outline"
            title="Clear All Data"
            description="Delete all journal entries and settings"
            type="danger"
            onPress={() => console.log('Navigate to Clear Data')}
          />
        </View>
        
        <SectionHeader title="About" />
        <View className="mx-4 rounded-2xl bg-zinc-950 overflow-hidden mb-2">
          <SettingItem
            icon="information-circle-outline"
            title="App Version"
            description="1.0.0"
            type="navigate"
            onPress={() => console.log('Show app version info')}
          />
          <View className="h-[1px] bg-zinc-900 ml-14" />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            type="navigate"
            onPress={() => console.log('Navigate to Help & Support')}
          />
        </View>
        
        <Animated.View 
          className="p-6 items-center"
          style={{ opacity: fadeAnim }}
        >
          <Text className="text-sm text-zinc-600">Journal AI © 2023</Text>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
