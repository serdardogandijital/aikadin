import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import theme from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/LoadingSpinner';
// import { auth, db } from '../../services/firebase';
// import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

type WardrobeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  brand?: string;
  image: string;
  season: string[];
  tags: string[];
  createdAt: Date;
}

interface CategoryFilter {
  id: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  count: number;
}

const WardrobeScreen = () => {
  const navigation = useNavigation<WardrobeScreenNavigationProp>();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClothingItems();
  }, []);

  const loadClothingItems = async () => {
    setLoading(true);
    try {
      // Firebase disabled - load from AsyncStorage or use sample data
      const itemsStr = await AsyncStorage.getItem('clothingItems');
      if (itemsStr) {
        const items = JSON.parse(itemsStr);
        setClothingItems(items);
      } else {
        // Load sample data
        setClothingItems(sampleClothingItems);
      }
    } catch (error) {
      console.error('Error loading clothing items:', error);
      setClothingItems(sampleClothingItems);
    } finally {
      setLoading(false);
    }
  };

  const sampleClothingItems: ClothingItem[] = [
    {
      id: '1',
      name: 'Klasik Beyaz Gömlek',
      category: 'Üst',
      color: 'Beyaz',
      brand: 'Zara',
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
      season: ['İlkbahar', 'Yaz', 'Sonbahar'],
      tags: ['Klasik', 'İş', 'Günlük'],
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Kot Pantolon',
      category: 'Alt',
      color: 'Mavi',
      brand: 'Levi\'s',
      image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
      season: ['Tüm Mevsimler'],
      tags: ['Casual', 'Günlük'],
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Siyah Blazer',
      category: 'Üst',
      color: 'Siyah',
      brand: 'Mango',
      image: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
      season: ['Sonbahar', 'Kış'],
      tags: ['Formal', 'İş', 'Şık'],
      createdAt: new Date()
    },
    {
      id: '4',
      name: 'Spor Ayakkabı',
      category: 'Ayakkabı',
      color: 'Beyaz',
      brand: 'Nike',
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
      season: ['Tüm Mevsimler'],
      tags: ['Spor', 'Günlük', 'Rahat'],
      createdAt: new Date()
    }
  ];

  const categories: CategoryFilter[] = [
    {
      id: 'all',
      name: 'Tümü',
      icon: 'apps',
      count: clothingItems.length
    },
    {
      id: 'Üst',
      name: 'Üst Giyim',
      icon: 'checkroom',
      count: clothingItems.filter(item => item.category === 'Üst').length
    },
    {
      id: 'Alt',
      name: 'Alt Giyim',
      icon: 'dry-cleaning',
      count: clothingItems.filter(item => item.category === 'Alt').length
    },
    {
      id: 'Ayakkabı',
      name: 'Ayakkabı',
      icon: 'directions-walk',
      count: clothingItems.filter(item => item.category === 'Ayakkabı').length
    },
    {
      id: 'Aksesuar',
      name: 'Aksesuar',
      icon: 'watch',
      count: clothingItems.filter(item => item.category === 'Aksesuar').length
    }
  ];

  const filteredItems = clothingItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  const handleAddItem = () => {
    navigation.navigate('AddClothing');
  };

  const handleItemPress = (item: ClothingItem) => {
    // Navigate to item details screen (to be implemented)
    Alert.alert(
      item.name,
      `Kategori: ${item.category}\nRenk: ${item.color}\nMarka: ${item.brand || 'Belirtilmemiş'}`,
      [
        { text: 'Düzenle', onPress: () => {} },
        { text: 'Sil', onPress: () => handleDeleteItem(item.id), style: 'destructive' },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = clothingItems.filter(item => item.id !== itemId);
      setClothingItems(updatedItems);
      await AsyncStorage.setItem('clothingItems', JSON.stringify(updatedItems));
      Alert.alert('Başarılı', 'Ürün dolabınızdan kaldırıldı.');
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Hata', 'Ürün silinirken bir hata oluştu.');
    }
  };

  const renderCategoryFilter = ({ item }: { item: CategoryFilter }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <MaterialIcons
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? theme.colors.primary.contrastText : theme.colors.text.secondary}
      />
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && styles.categoryButtonTextActive
      ]}>
        {item.name} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  const renderClothingItem = ({ item }: { item: ClothingItem }) => (
    <TouchableOpacity
      style={styles.clothingCard}
      onPress={() => handleItemPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.clothingImage} />
      <View style={styles.clothingInfo}>
        <Text style={styles.clothingName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.clothingBrand}>{item.brand || 'Marka yok'}</Text>
        <View style={styles.clothingTags}>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
          <View style={styles.colorIndicator}>
            <View style={[styles.colorDot, { backgroundColor: getColorValue(item.color) }]} />
            <Text style={styles.colorText}>{item.color}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Üst': theme.colors.primary.main,
      'Alt': theme.colors.secondary.main,
      'Ayakkabı': '#FF6B6B',
      'Aksesuar': '#4ECDC4',
    };
    return colors[category] || theme.colors.neutral[400];
  };

  const getColorValue = (colorName: string) => {
    const colors: { [key: string]: string } = {
      'Beyaz': '#FFFFFF',
      'Siyah': '#000000',
      'Mavi': '#2196F3',
      'Kırmızı': '#F44336',
      'Yeşil': '#4CAF50',
      'Sarı': '#FFEB3B',
      'Mor': '#9C27B0',
      'Turuncu': '#FF9800',
      'Pembe': '#E91E63',
      'Gri': '#9E9E9E',
    };
    return colors[colorName] || theme.colors.neutral[400];
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="checkroom" size={80} color={theme.colors.neutral[400]} />
      <Text style={styles.emptyStateTitle}>Dolabınız Boş</Text>
      <Text style={styles.emptyStateText}>
        İlk kıyafetinizi ekleyerek dolabınızı oluşturmaya başlayın
      </Text>
      <TouchableOpacity style={styles.addFirstItemButton} onPress={handleAddItem}>
        <Text style={styles.addFirstItemButtonText}>İlk Ürünü Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Dolabınız yükleniyor..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dolabım</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <MaterialIcons name="add" size={24} color={theme.colors.primary.contrastText} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Category Filters */}
        <FlatList
          data={categories}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="checkroom" size={20} color={theme.colors.primary.main} />
            <Text style={styles.statNumber}>{clothingItems.length}</Text>
            <Text style={styles.statLabel}>Toplam Ürün</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="palette" size={20} color="#FF6B6B" />
            <Text style={styles.statNumber}>
              {new Set(clothingItems.map(item => item.color)).size}
            </Text>
            <Text style={styles.statLabel}>Farklı Renk</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="business" size={20} color="#4CAF50" />
            <Text style={styles.statNumber}>
              {new Set(clothingItems.map(item => item.brand).filter(Boolean)).size}
            </Text>
            <Text style={styles.statLabel}>Marka</Text>
          </View>
        </View>

        {/* Clothing Items */}
        {filteredItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderClothingItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.itemsList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    marginRight: theme.spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  categoryButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  categoryButtonTextActive: {
    color: theme.colors.primary.contrastText,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  itemsList: {
    paddingBottom: theme.spacing.xl,
  },
  clothingCard: {
    width: '48%',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  clothingImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  clothingInfo: {
    padding: theme.spacing.sm,
  },
  clothingName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  clothingBrand: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  clothingTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  categoryTagText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary.contrastText,
    fontWeight: '600',
  },
  colorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  colorText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  addFirstItemButton: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  addFirstItemButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.primary.contrastText,
  },
});

export default WardrobeScreen; 