import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

type ProfileData = {
  id?: string;
  name: string;
  email: string;
  height: string;
  weight: string;
  style: string;
  bodyType: string;
  favoriteColors: string[];
  photoURL: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
};

const bodyTypes = ['İnce', 'Normal', 'Atletik', 'Kaslı', 'Tombul', 'Kilolu', 'Diğer'];
const styleOptions = ['Casual', 'Formal', 'Sport', 'Vintage', 'Bohemian', 'Minimalist', 'Elegant', 'Street', 'Classic'];
const colorOptions = ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Mor', 'Turuncu', 'Pembe', 'Gri', 'Kahverengi', 'Bej'];
const languageOptions = ['Türkçe', 'English', 'Español', 'Français', 'Deutsch'];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [editableData, setEditableData] = useState<Partial<ProfileData>>({});
  
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Mock user for development
      const mockUser = {
        uid: 'dev-user-1',
        email: 'dev@example.com',
        displayName: 'Dev User',
        photoURL: null
      };
      
      // Try to load from AsyncStorage first
      const savedProfile = await AsyncStorage.getItem('userProfile');
      
      if (savedProfile) {
        const userData = JSON.parse(savedProfile) as ProfileData;
        setProfile(userData);
        setEditableData({
          name: userData.name || mockUser.displayName || '',
          height: userData.height || '',
          weight: userData.weight || '',
          style: userData.style || 'Casual',
          bodyType: userData.bodyType || 'Normal',
          favoriteColors: userData.favoriteColors || [],
          preferences: userData.preferences || {
            notifications: true,
            darkMode: false,
            language: 'Türkçe'
          }
        });
      } else {
        // Create default profile
        const defaultProfile = {
          id: mockUser.uid,
          name: mockUser.displayName || '',
          email: mockUser.email || '',
          height: '',
          weight: '',
          style: 'Casual',
          bodyType: 'Normal',
          favoriteColors: [],
          photoURL: mockUser.photoURL || '',
          preferences: {
            notifications: true,
            darkMode: false,
            language: 'Türkçe'
          }
        };
        
        setProfile(defaultProfile);
        setEditableData({
          name: defaultProfile.name,
          height: defaultProfile.height,
          weight: defaultProfile.weight,
          style: defaultProfile.style,
          bodyType: defaultProfile.bodyType,
          favoriteColors: defaultProfile.favoriteColors,
          preferences: defaultProfile.preferences
        });
      }
    } catch (error) {
      console.error('Profil yüklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      const updatedData = {
        ...editableData,
        updatedAt: new Date()
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userProfile', JSON.stringify({
        ...profile,
        ...updatedData
      }));
      
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Başarılı',
        text2: 'Profil bilgileriniz güncellendi'
      });
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      Alert.alert('Hata', 'Profil bilgileri güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userProfile');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }]
      });
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      Alert.alert('Hata', 'Çıkış yapılamadı');
    }
  };

  const handleEditField = (key: string, value: string) => {
    setEditableData((prev: Record<string, any>) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTogglePreference = (key: string) => {
    setEditableData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !(prev.preferences?.[key as keyof typeof prev.preferences])
      }
    }));
  };

  const handleSelectLanguage = (language: string) => {
    setEditableData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language
      }
    }));
  };

  const toggleFavoriteColor = (color: string) => {
    setEditableData(prev => {
      const currentColors = prev.favoriteColors || [];
      const newColors = currentColors.includes(color)
        ? currentColors.filter(c => c !== color)
        : [...currentColors, color];
      
      return {
        ...prev,
        favoriteColors: newColors
      };
    });
  };

  const pickImage = async () => {
    try {
      setUploadingImage(true);
      
      // Check permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Hatası', 'Fotoğraf galerisi izni gerekiyor');
          setUploadingImage(false);
          return;
        }
      }
      
      // Open gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        // Update profile state with the image URI
        setProfile(prev => prev ? { ...prev, photoURL: uri } : null);
        
        // Save to AsyncStorage
        if (profile) {
          await AsyncStorage.setItem('userProfile', JSON.stringify({
            ...profile,
            photoURL: uri
          }));
        }
        
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Profil fotoğrafınız güncellendi'
        });
      }
    } catch (error) {
      console.error('Resim yüklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Profil fotoğrafı güncellenemedi');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C7AEA" />
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {uploadingImage ? (
            <ActivityIndicator size="small" color="#fff" style={styles.profileImage} />
          ) : (
            <>
              {profile?.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.noProfileImage]}>
                  <FontAwesome5 name="user-alt" size={40} color="#A0A0A0" />
                </View>
              )}
              <TouchableOpacity 
                style={styles.editImageButton}
                onPress={pickImage}
              >
                <MaterialIcons name="edit" size={18} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <Text style={styles.profileName}>
          {profile?.name || 'İsimsiz Kullanıcı'}
        </Text>
        <Text style={styles.profileEmail}>{profile?.email}</Text>
        
        <View style={styles.actionButtonsContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.actionButtonText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.actionButtonText}>İptal</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.actionButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.actionButtonText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>İsim</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editableData.name}
              onChangeText={(text) => handleEditField('name', text)}
              placeholder="Adınız"
            />
          ) : (
            <Text style={styles.infoValue}>{profile?.name || 'Belirtilmemiş'}</Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Boy</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editableData.height}
              onChangeText={(text) => handleEditField('height', text)}
              placeholder="Boyunuz (cm)"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.infoValue}>
              {profile?.height ? `${profile.height} cm` : 'Belirtilmemiş'}
            </Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Kilo</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editableData.weight}
              onChangeText={(text) => handleEditField('weight', text)}
              placeholder="Kilonuz (kg)"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.infoValue}>
              {profile?.weight ? `${profile.weight} kg` : 'Belirtilmemiş'}
            </Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Vücut Tipi</Text>
          {isEditing ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editableData.bodyType}
                onValueChange={(value) => handleEditField('bodyType', value)}
                style={styles.picker}
              >
                {bodyTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.infoValue}>{profile?.bodyType || 'Belirtilmemiş'}</Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Stil</Text>
          {isEditing ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editableData.style}
                onValueChange={(value) => handleEditField('style', value)}
                style={styles.picker}
              >
                {styleOptions.map((style) => (
                  <Picker.Item key={style} label={style} value={style} />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.infoValue}>{profile?.style || 'Belirtilmemiş'}</Text>
          )}
        </View>
      </View>

      {isEditing && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tercih Ettiğin Renkler</Text>
          <View style={styles.colorOptionsContainer}>
            {colorOptions.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  (editableData.favoriteColors || []).includes(color) && styles.selectedColorOption
                ]}
                onPress={() => toggleFavoriteColor(color)}
              >
                <Text style={[
                  styles.colorOptionText,
                  (editableData.favoriteColors || []).includes(color) && styles.selectedColorOptionText
                ]}>
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {!isEditing && profile?.favoriteColors && profile.favoriteColors.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tercih Ettiğin Renkler</Text>
          <View style={styles.colorOptionsContainer}>
            {profile.favoriteColors.map(color => (
              <View key={color} style={[styles.colorOption, styles.selectedColorOption]}>
                <Text style={styles.selectedColorOptionText}>{color}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Bildirimler</Text>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              (isEditing ? editableData.preferences?.notifications : profile?.preferences.notifications) 
                ? styles.toggleActive 
                : styles.toggleInactive
            ]}
            onPress={() => isEditing && handleTogglePreference('notifications')}
            disabled={!isEditing}
          >
            <View style={[
              styles.toggleCircle,
              (isEditing ? editableData.preferences?.notifications : profile?.preferences.notifications) && styles.toggleCircleActive
            ]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Karanlık Tema</Text>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              (isEditing ? editableData.preferences?.darkMode : profile?.preferences.darkMode) 
                ? styles.toggleActive 
                : styles.toggleInactive
            ]}
            onPress={() => isEditing && handleTogglePreference('darkMode')}
            disabled={!isEditing}
          >
            <View style={[
              styles.toggleCircle,
              (isEditing ? editableData.preferences?.darkMode : profile?.preferences.darkMode) && styles.toggleCircleActive
            ]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Dil</Text>
          {isEditing ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={editableData.preferences?.language}
                onValueChange={(value) => handleSelectLanguage(value)}
                style={styles.picker}
              >
                {languageOptions.map((lang) => (
                  <Picker.Item key={lang} label={lang} value={lang} />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.infoValue}>{profile?.preferences.language || 'Türkçe'}</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#5C7AEA',
    padding: 20,
    alignItems: 'center',
    paddingBottom: 80,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  noProfileImage: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5C7AEA',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#5C7AEA',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionContainer: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    textAlign: 'right',
  },
  pickerContainer: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
  },
  toggleButton: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 3,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleInactive: {
    backgroundColor: '#E0E0E0',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  toggleCircleActive: {
    transform: [{ translateX: 24 }],
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  colorOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    margin: 4,
  },
  selectedColorOption: {
    backgroundColor: '#5C7AEA',
  },
  colorOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedColorOptionText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen; 