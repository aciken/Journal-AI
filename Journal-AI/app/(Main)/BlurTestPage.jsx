import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  Image, 
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Sample image URL for testing
const testImageUrl = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1875&q=80';

export default function BlurTestPage() {
  const router = useRouter();
  const [blurIntensity, setBlurIntensity] = useState(50);

  const intensityOptions = [
    { value: 0, label: 'No Blur' },
    { value: 20, label: 'Light' },
    { value: 50, label: 'Medium' },
    { value: 100, label: 'Heavy' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expo BlurView Test</Text>
        <View style={{ width: 24 }} /> {/* Empty view for balance */}
      </View>
      
      {/* Intensity Options */}
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Blur Intensity:</Text>
        <View style={styles.intensityOptions}>
          {intensityOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.intensityButton,
                blurIntensity === option.value && styles.activeIntensityButton
              ]}
              onPress={() => setBlurIntensity(option.value)}
            >
              <Text 
                style={[
                  styles.intensityButtonText,
                  blurIntensity === option.value && styles.activeIntensityButtonText
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Main Test Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.testTitle}>Original Image</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: testImageUrl }} 
            style={styles.testImage} 
          />
        </View>
        
        <Text style={styles.testTitle}>Image with BlurView (Intensity: {blurIntensity})</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: testImageUrl }} 
            style={styles.testImage} 
          />
          <BlurView 
            intensity={blurIntensity} 
            tint="dark" 
            style={styles.blurOverlay}
          >
            <Text style={styles.overlayText}>
              This text should be on a blurred background
            </Text>
            <View style={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.gridItem}>
                  <Text style={styles.gridText}>{i + 1}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>
        
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Is BlurView Working?</Text>
          <Text style={styles.resultText}>
            If BlurView is working correctly, the second image should appear blurred
            while the text remains sharp and readable.
          </Text>
          <Text style={styles.resultText}>
            If you just see a dark semi-transparent overlay without any blur effect,
            then expo-blur is not working properly on your device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  intensityContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  intensityLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  intensityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    backgroundColor: '#27272a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeIntensityButton: {
    backgroundColor: '#3b82f6',
  },
  intensityButtonText: {
    color: '#d4d4d8',
    fontWeight: '500',
  },
  activeIntensityButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  testTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  testImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '80%',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultBox: {
    backgroundColor: '#27272a',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
}); 