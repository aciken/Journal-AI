import { View, Text, TouchableOpacity, ScrollView, Switch, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings() {
  const router = useRouter();
  
  // State for toggle settings
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);
  
  // Handle close settings
  const handleClose = () => {
    router.back();
  };
  
  // Setting item component
  const SettingItem = ({ icon, title, description, type, value, onValueChange, onPress }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={type === 'toggle'}
    >
      <View style={[styles.settingIconContainer, type === 'danger' && styles.dangerIconContainer]}>
        <Ionicons name={icon} size={22} color={type === 'danger' ? "#f87171" : "#d6d3d1"} />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, type === 'danger' && styles.dangerText]}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
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
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['rgba(24, 24, 27, 0.9)', 'rgba(9, 9, 11, 1)']}
        style={styles.gradient}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleClose}
        >
          <View style={styles.closeButtonCircle}>
            <Ionicons name="close" size={20} color="#d6d3d1" />
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Appearance" />
        <View style={styles.settingGroup}>
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
        <View style={styles.settingGroup}>
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
        <View style={styles.settingGroup}>
          <SettingItem
            icon="save-outline"
            title="Auto-Save"
            description="Automatically save journal entries"
            type="toggle"
            value={autoSave}
            onValueChange={setAutoSave}
          />
          <View style={styles.divider} />
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
        <View style={styles.settingGroup}>
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Lock"
            description="Require authentication to open the app"
            type="toggle"
            value={biometricLock}
            onValueChange={setBiometricLock}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy Policy"
            type="navigate"
            onPress={() => console.log('Navigate to Privacy Policy')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            type="navigate"
            onPress={() => console.log('Navigate to Terms of Service')}
          />
        </View>
        
        <SectionHeader title="Account" />
        <View style={styles.settingGroup}>
          <SettingItem
            icon="cloud-upload-outline"
            title="Backup & Sync"
            description="Manage your cloud backup settings"
            type="navigate"
            onPress={() => console.log('Navigate to Backup & Sync')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="trash-outline"
            title="Clear All Data"
            description="Delete all journal entries and settings"
            type="danger"
            onPress={() => console.log('Navigate to Clear Data')}
          />
        </View>
        
        <SectionHeader title="About" />
        <View style={styles.settingGroup}>
          <SettingItem
            icon="information-circle-outline"
            title="App Version"
            description="1.0.0"
            type="navigate"
            onPress={() => console.log('Show app version info')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            type="navigate"
            onPress={() => console.log('Navigate to Help & Support')}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Journal AI © 2023</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingGroup: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#18181b',
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272a',
    marginLeft: 56,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  dangerText: {
    color: '#f87171',
  },
  settingDescription: {
    fontSize: 14,
    color: '#71717a',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#52525b',
  },
});
