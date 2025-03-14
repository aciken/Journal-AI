import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../Context/GlobalProvider';
import { LinearGradient } from 'expo-linear-gradient';

export default function FolderSelector() {
  const router = useRouter();
  const { user, setUser } = useGlobalContext();
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const folderColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  useEffect(() => {
    const loadFolderData = async () => {
      try {
        // Get the selected folder from AsyncStorage
        const storedFolder = await AsyncStorage.getItem('selectedFolder');
        if (storedFolder) {
          setSelectedFolder(storedFolder);
        }

        if (user && user.folders && Array.isArray(user.folders)) {
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
      } catch (error) {
        console.error('Error loading folder data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFolderData();
  }, [user]);

  const handleFolderSelection = async (folderId) => {
    try {
      if (folderId === null) {
        // "All Journals" is selected
        await AsyncStorage.removeItem('selectedFolder');
        setSelectedFolder(null);
      } else if (folderId === selectedFolder) {
        // If the same folder is selected, toggle it off (select All Journals)
        await AsyncStorage.removeItem('selectedFolder');
        setSelectedFolder(null);
      } else {
        // A specific folder is selected
        await AsyncStorage.setItem('selectedFolder', folderId);
        setSelectedFolder(folderId);
      }
      
      // Navigate back to the home page
      router.back();
    } catch (error) {
      console.error('Error saving folder selection:', error);
    }
  };

  const getFolderColor = (folder, index) => {
    return folder.color || folderColors[index % folderColors.length];
  };

  const createNewFolder = async () => {
    // This would typically open a dialog to create a new folder
    // For now, we'll just navigate back
    router.back();
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
              <Text className="text-white text-xl font-bold">Select Folder</Text>
            </View>
          </View>

          <TouchableOpacity 
            className={`flex-row items-center p-4 mb-2 rounded-xl ${!selectedFolder ? 'bg-blue-500/20' : 'bg-zinc-800/80'}`} 
            onPress={() => handleFolderSelection(null)}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-zinc-700">
              <Ionicons name="albums-outline" size={22} color="#d6d3d1" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-medium">All Journals</Text>
              <Text className="text-zinc-400 text-sm">View all your journal entries</Text>
            </View>
            {!selectedFolder && (
              <View className="bg-blue-500 rounded-full p-1.5">
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>

          <ScrollView className="mb-4">
            {folders.map((folder, index) => (
              <TouchableOpacity 
                key={folder.id} 
                className={`flex-row items-center p-4 mb-2 rounded-xl ${selectedFolder === folder.id ? 'bg-blue-500/20' : 'bg-zinc-800/80'}`} 
                onPress={() => handleFolderSelection(folder.id)}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: getFolderColor(folder, index) }}>
                  <Ionicons name="folder" size={22} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-medium">{folder.name}</Text>
                  <Text className="text-zinc-400 text-sm">{folder.description || `${folder.journals?.length || 0} journals`}</Text>
                </View>
                {selectedFolder === folder.id && (
                  <View className="bg-blue-500 rounded-full p-1.5">
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View className="px-4 pb-6">
          <TouchableOpacity 
            className="bg-zinc-800 rounded-xl p-4 flex-row items-center justify-center"
            onPress={createNewFolder}
          >
            <Ionicons name="add-circle-outline" size={22} color="#d6d3d1" className="mr-2" />
            <Text className="text-white text-lg font-medium ml-2">Create New Folder</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
} 