import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'AddClothing'>;
type AddClothingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Define our category, season, and color types
type CategoryItem = { id: string; name: string };
type SeasonItem = { id: string; name: string };
type ColorItem = { id: string; name: string; hex: string };

const categories: CategoryItem[] = [
  { id: 'tops', name: 'Üst Giyim' },
  { id: 'bottoms', name: 'Alt Giyim' },
  { id: 'outerwear', name: 'Dış Giyim' },
  { id: 'dresses', name: 'Elbiseler' },
  { id: 'shoes', name: 'Ayakkabılar' },
  { id: 'accessories', name: 'Aksesuarlar' },
];

const seasons: SeasonItem[] = [
  { id: 'all', name: 'Tüm Sezonlar' },
  { id: 'spring', name: 'İlkbahar' },
  { id: 'summer', name: 'Yaz' },
  { id: 'autumn', name: 'Sonbahar' },
  { id: 'winter', name: 'Kış' },
];

const colors: ColorItem[] = [
  { id: 'black', name: 'Siyah', hex: '#000000' },
  { id: 'white', name: 'Beyaz', hex: '#FFFFFF' },
  { id: 'red', name: 'Kırmızı', hex: '#FF0000' },
  { id: 'blue', name: 'Mavi', hex: '#0000FF' },
  { id: 'green', name: 'Yeşil', hex: '#008000' },
  { id: 'yellow', name: 'Sarı', hex: '#FFFF00' },
  { id: 'purple', name: 'Mor', hex: '#800080' },
  { id: 'pink', name: 'Pembe', hex: '#FFC0CB' },
  { id: 'brown', name: 'Kahverengi', hex: '#A52A2A' },
  { id: 'gray', name: 'Gri', hex: '#808080' },
  { id: 'orange', name: 'Turuncu', hex: '#FFA500' },
  { id: 'beige', name: 'Bej', hex: '#F5F5DC' },
];

const AddClothingScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(categories[0].id);
  const [color, setColor] = useState(colors[0].id);
  const [season, setSeason] = useState(seasons[0].id);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to add clothing items.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return manipResult.uri;
  };

  const handleAddClothing = async () => {
    if (!image || !name || !category || !color) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve bir fotoğraf seçin');
      return;
    }

    setLoading(true);
    try {
      // Compress the image before saving
      const compressedUri = await compressImage(image);
      
      // Mock save to AsyncStorage for development
      const newItem = {
        id: `item_${Date.now()}`,
        name: name.trim(),
        category,
        color,
        brand: brand.trim(),
        season,
        imageUri: compressedUri,
        createdAt: new Date().toISOString(),
        userId: 'dev-user-1'
      };

      // Save to AsyncStorage
      const existingItems = await AsyncStorage.getItem('clothingItems');
      const items = existingItems ? JSON.parse(existingItems) : [];
      items.push(newItem);
      await AsyncStorage.setItem('clothingItems', JSON.stringify(items));

      Alert.alert('Başarılı', 'Kıyafet gardırobunuza eklendi!', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Kıyafet eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Kıyafet eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render a dropdown select
  const renderDropdown = (label: string, value: string, items: { id: string; name: string }[], onChange: (value: string) => void) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerWrapper}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pickerItem,
                  value === item.id && styles.pickerItemSelected
                ]}
                onPress={() => onChange(item.id)}
              >
                <Text style={[
                  styles.pickerItemText,
                  value === item.id && styles.pickerItemTextSelected
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Item</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.imagePickerContainer}
          onPress={pickImage}
        >
          {image ? (
            <Image 
              source={{ uri: image }} 
              style={styles.selectedImage}
              resizeMode="cover" 
            />
          ) : (
            <>
              <Ionicons name="camera-outline" size={40} color={theme.colors.grey[400]} />
              <Text style={styles.imagePickerText}>Select Photo</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter item name"
              placeholderTextColor={theme.colors.grey[400]}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Brand</Text>
            <TextInput
              style={styles.textInput}
              value={brand}
              onChangeText={setBrand}
              placeholder="Enter brand name (optional)"
              placeholderTextColor={theme.colors.grey[400]}
            />
          </View>
          
          {renderDropdown('Category', category, categories, setCategory)}
          {renderDropdown('Color', color, colors, setColor)}
          {renderDropdown('Season', season, seasons, setSeason)}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, (loading || !name || !image) && styles.saveButtonDisabled]}
          onPress={handleAddClothing}
          disabled={loading || !name || !image}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save Item</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey[200],
    backgroundColor: theme.colors.background.paper,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  rightPlaceholder: {
    width: 24,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  imagePickerContainer: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.grey[200],
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSizes.md,
    color: theme.colors.grey[500],
  },
  formContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.grey[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.md,
  },
  pickerContainer: {
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.grey[200],
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    padding: theme.spacing.xs,
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  pickerItem: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.grey[200],
  },
  pickerItemSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  pickerItemText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.sm,
  },
  pickerItemTextSelected: {
    color: '#fff',
  },
  picker: {
    height: 50,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey[200],
    backgroundColor: theme.colors.background.paper,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.primary.disabled,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600' as const,
    fontSize: theme.fontSizes.md,
    marginRight: theme.spacing.sm,
  },
});

export default AddClothingScreen; 