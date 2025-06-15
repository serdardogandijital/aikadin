import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import theme from '../../theme';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'OutfitDetails'>;

interface OutfitItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

interface Outfit {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  items: OutfitItem[];
  category: string;
  season: string;
  createdAt: any;
}

const OutfitDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { outfitId } = route.params;
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOutfitDetails();
  }, [outfitId]);

  const fetchOutfitDetails = async () => {
    try {
      setLoading(true);
      // const outfitDoc = await getDoc(doc(db, 'outfits', outfitId));
      
      if (outfitDoc.exists()) {
        setOutfit({ id: outfitDoc.id, ...outfitDoc.data() } as Outfit);
      } else {
        setError('Kombin bulunamadı');
      }
    } catch (error) {
      console.error('Error fetching outfit details:', error);
      setError('Kombin detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Kombininiz yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (error || !outfit) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Bir hata oluştu'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kombin Detayı</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <Image 
          source={{ uri: outfit.imageUrl }} 
          style={styles.outfitImage} 
          resizeMode="cover"
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.outfitTitle}>{outfit.title}</Text>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Kategori:</Text>
            <Text style={styles.categoryValue}>{outfit.category}</Text>
          </View>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Sezon:</Text>
            <Text style={styles.categoryValue}>{outfit.season}</Text>
          </View>
          
          <Text style={styles.descriptionTitle}>Açıklama</Text>
          <Text style={styles.descriptionText}>{outfit.description}</Text>
        </View>
        
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Bu Kombindeki Parçalar</Text>
          
          {outfit.items && outfit.items.length > 0 ? (
            outfit.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>Bu kombinde gösterilecek parça bulunamadı.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.error.main,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  backButtonText: {
    color: theme.colors.primary.main,
    fontSize: theme.fontSizes.md,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  rightPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  outfitImage: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    padding: theme.spacing.md,
  },
  outfitTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  categoryLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500' as const,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  categoryValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
  },
  descriptionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  itemsContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  itemsTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
  },
  itemInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500' as const,
    color: theme.colors.text.primary,
  },
  itemCategory: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  noItemsText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.hint,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});

export default OutfitDetailsScreen; 