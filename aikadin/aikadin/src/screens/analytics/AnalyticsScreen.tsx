import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import theme from '../../theme';

interface ClothingItem {
  id: string;
  name: string;
  image: string;
  brand: string;
  price: string;
  similarity: number;
}

const AnalyticsScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchImage, setSearchImage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ClothingItem[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async (camera: any) => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setSearchImage(photo.uri);
      setCameraVisible(false);
      searchSimilarClothes(photo.uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Görsel seçebilmek için galerinize erişim izni gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSearchImage(result.assets[0].uri);
      searchSimilarClothes(result.assets[0].uri);
    }
  };

  const searchSimilarClothes = async (imageUri: string) => {
    setLoading(true);
    setSearchResults([]);
    
    // Simüle edilmiş bir API çağrısı - gerçek uygulamada görsel analiz API'sine gönderilir
    setTimeout(() => {
      // Mockup sonuçlar
      const mockResults: ClothingItem[] = [
        {
          id: '1',
          name: 'Slim Fit Jean',
          image: 'https://via.placeholder.com/200x300/A9D0F5/000000?text=Jean+1',
          brand: 'Marka A',
          price: '₺349,90',
          similarity: 92
        },
        {
          id: '2',
          name: 'Düz Kesim Jean',
          image: 'https://via.placeholder.com/200x300/A9F5A9/000000?text=Jean+2',
          brand: 'Marka B',
          price: '₺299,90',
          similarity: 85
        },
        {
          id: '3',
          name: 'Skinny Jean',
          image: 'https://via.placeholder.com/200x300/F5A9A9/000000?text=Jean+3',
          brand: 'Marka C',
          price: '₺399,90',
          similarity: 78
        },
        {
          id: '4',
          name: 'Yüksek Bel Jean',
          image: 'https://via.placeholder.com/200x300/F5D0A9/000000?text=Jean+4',
          brand: 'Marka D',
          price: '₺449,90',
          similarity: 75
        },
        {
          id: '5',
          name: 'Mom Jean',
          image: 'https://via.placeholder.com/200x300/D0A9F5/000000?text=Jean+5',
          brand: 'Marka E',
          price: '₺329,90',
          similarity: 70
        },
      ];
      
      setSearchResults(mockResults);
      setLoading(false);
    }, 2000);
  };

  const clearSearch = () => {
    setSearchImage(null);
    setSearchResults([]);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Kamera izni alınıyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="no-photography" size={60} color={theme.colors.primary.main} />
          <Text style={styles.permissionText}>Kamera izni verilmedi</Text>
          <Text style={styles.permissionSubtext}>Bu özelliği kullanabilmek için kamera izni vermeniz gerekiyor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {cameraVisible ? (
        <View style={styles.cameraContainer}>
          <Camera 
            style={styles.camera} 
            type={type}
            ratio="4:3"
          >
            <View style={styles.cameraControlsContainer}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => {
                  setType(
                    type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  );
                }}>
                <Ionicons name="camera-reverse" size={30} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={(camera) => takePicture(camera)}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCameraVisible(false)}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Görsel Arama</Text>
          </View>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>Benzer Kıyafet Bul</Text>
              <Text style={styles.instructionText}>
                Bir kıyafetin fotoğrafını çekerek veya galeriden seçerek benzer ürünleri bulabilirsiniz.
              </Text>
            </View>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => setCameraVisible(true)}
              >
                <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary.contrastText} />
                <Text style={styles.actionButtonText}>Fotoğraf Çek</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={pickImage}
              >
                <MaterialIcons name="photo-library" size={24} color={theme.colors.primary.contrastText} />
                <Text style={styles.actionButtonText}>Galeriden Seç</Text>
              </TouchableOpacity>
            </View>
            
            {searchImage && (
              <View style={styles.searchImageContainer}>
                <Text style={styles.sectionTitle}>Aranan Görsel</Text>
                <Image source={{ uri: searchImage }} style={styles.searchImage} />
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearSearch}
                >
                  <Text style={styles.clearButtonText}>Aramayı Temizle</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
                <Text style={styles.loadingText}>Benzer kıyafetler aranıyor...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.sectionTitle}>Sonuçlar</Text>
                {searchResults.map(item => (
                  <TouchableOpacity key={item.id} style={styles.resultItem}>
                    <Image source={{ uri: item.image }} style={styles.resultImage} />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultBrand}>{item.brand}</Text>
                      <Text style={styles.resultPrice}>{item.price}</Text>
                      <View style={styles.similarityContainer}>
                        <Text style={styles.similarityText}>Benzerlik: </Text>
                        <View style={styles.similarityBar}>
                          <View 
                            style={[
                              styles.similarityFill, 
                              { width: `${item.similarity}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.similarityPercent}>{item.similarity}%</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              searchImage && (
                <View style={styles.noResultsContainer}>
                  <MaterialIcons name="search-off" size={60} color={theme.colors.grey[400]} />
                  <Text style={styles.noResultsText}>Sonuç Bulunamadı</Text>
                  <Text style={styles.noResultsSubtext}>Farklı bir görsel ile tekrar deneyin.</Text>
                </View>
              )
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey[200],
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  instructionCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  instructionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  instructionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
    flex: 0.48,
  },
  actionButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary.contrastText,
    marginLeft: theme.spacing.sm,
  },
  searchImageContainer: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  searchImage: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.grey[200],
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.grey[200],
  },
  clearButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  resultsContainer: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  resultImage: {
    width: 100,
    height: 150,
    backgroundColor: theme.colors.grey[200],
  },
  resultInfo: {
    flex: 1,
    padding: theme.spacing.md,
  },
  resultName: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  resultBrand: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  resultPrice: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.md,
  },
  similarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  similarityText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  similarityBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.grey[200],
    borderRadius: 4,
    marginHorizontal: theme.spacing.sm,
  },
  similarityFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
    borderRadius: 4,
  },
  similarityPercent: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  noResultsContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  noResultsSubtext: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: theme.spacing.lg,
  },
  flipButton: {
    padding: theme.spacing.sm,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  cancelButton: {
    padding: theme.spacing.sm,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  permissionText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  permissionSubtext: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default AnalyticsScreen; 