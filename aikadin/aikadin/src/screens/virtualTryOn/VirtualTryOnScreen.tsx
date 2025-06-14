import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../../theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import apiService from '../../services/apiService';
// import { auth, db } from '../../services/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ImageData {
  uri: string;
  type: 'user' | 'clothing';
}

const VirtualTryOnScreen = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [resultAnalysis, setResultAnalysis] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraPermission.granted || !libraryPermission.granted) {
      Alert.alert(
        'İzin Gerekli',
        'Lütfen kamera ve fotoğraf galerisine erişim izni verin.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async (type: 'user' | 'clothing') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Fotoğraf Seç',
      'Fotoğrafı nereden seçmek istiyorsunuz?',
      [
        { text: 'Kamera', onPress: () => takePhoto(type) },
        { text: 'Galeri', onPress: () => selectFromGallery(type) },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async (type: 'user' | 'clothing') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'user') {
          setUserImage(result.assets[0].uri);
        } else {
          setClothingImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi.');
    }
  };

  const selectFromGallery = async (type: 'user' | 'clothing') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'user') {
          setUserImage(result.assets[0].uri);
        } else {
          setClothingImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi.');
    }
  };

  const processVirtualTryOn = async () => {
    if (!userImage || !clothingImage) {
      Alert.alert('Eksik Fotoğraf', 'Lütfen hem kendi fotoğrafınızı hem de kıyafet fotoğrafını seçin.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResultAnalysis(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 12;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 90);
        });
      }, 600);

      const result = await apiService.callVirtualTryOn({
        userImage,
        clothingImage
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResultAnalysis(result);

      // Save to history (Firebase disabled)
      // await saveToHistory(result);

    } catch (error) {
      console.error('Virtual try-on error:', error);
      Alert.alert(
        'İşlem Hatası',
        'AI analizi gerçekleştirilemedi. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resetAll = () => {
    setUserImage(null);
    setClothingImage(null);
    setResultAnalysis(null);
    setProgress(0);
  };

  const renderImagePicker = (
    title: string,
    image: string | null,
    onPress: () => void,
    icon: keyof typeof MaterialIcons.glyphMap
  ) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.imagePickerTitle}>{title}</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={onPress}>
        {image ? (
          <Image source={{ uri: image }} style={styles.selectedImage} />
        ) : (
          <View style={styles.emptyImagePicker}>
            <MaterialIcons name={icon} size={48} color={theme.colors.text.hint} />
            <Text style={styles.emptyImageText}>Fotoğraf Seç</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>AI analiz yapıyor... %{progress}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressStepText}>
        {progress < 30 ? 'Fotoğraflar analiz ediliyor...' :
         progress < 60 ? 'Stil uyumu değerlendiriliyor...' :
         progress < 90 ? 'Kombin önerileri hazırlanıyor...' : 'Tamamlandı!'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="psychology" size={32} color={theme.colors.primary.main} />
          <Text style={styles.title}>AI Stil Analizi</Text>
          <Text style={styles.subtitle}>
            Kıyafetlerin size nasıl uyacağını AI ile keşfedin
          </Text>
        </View>

        <View style={styles.imageSection}>
          {renderImagePicker(
            'Sizin Fotoğrafınız',
            userImage,
            () => pickImage('user'),
            'person'
          )}

          {renderImagePicker(
            'Kıyafet Fotoğrafı',
            clothingImage,
            () => pickImage('clothing'),
            'checkroom'
          )}
        </View>

        {isProcessing && renderProgressBar()}

        {resultAnalysis && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>AI Analiz Sonucu</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>{resultAnalysis}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              (!userImage || !clothingImage || isProcessing) && styles.disabledButton
            ]}
            onPress={processVirtualTryOn}
            disabled={!userImage || !clothingImage || isProcessing}
          >
            {isProcessing ? (
              <LoadingSpinner size="small" color={theme.colors.primary.contrastText} />
            ) : (
              <>
                <MaterialIcons
                  name="auto-fix-high"
                  size={20}
                  color={theme.colors.primary.contrastText}
                />
                <Text style={styles.buttonText}>AI Analiz Başlat</Text>
              </>
            )}
          </TouchableOpacity>

          {(userImage || clothingImage || resultAnalysis) && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={resetAll}
              disabled={isProcessing}
            >
              <MaterialIcons name="refresh" size={20} color={theme.colors.text.primary} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Temizle
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>İpuçları:</Text>
          <Text style={styles.infoText}>
            • Net ve aydınlık fotoğraflar kullanın{'\n'}
            • Düz pozda çekilmiş fotoğraflar daha iyi sonuç verir{'\n'}
            • Kıyafet fotoğrafının temiz arka plana sahip olması idealdir{'\n'}
            • AI detaylı stil analizi ve kombin önerileri sunar
          </Text>
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
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.paper,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  imageSection: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  imagePickerContainer: {
    alignItems: 'center',
  },
  imagePickerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  imagePicker: {
    width: 200,
    height: 250,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.grey[300],
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyImagePicker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.grey[50],
  },
  emptyImageText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.sm,
  },
  progressContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  progressText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.grey[200],
    borderRadius: 4,
    marginBottom: theme.spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
    borderRadius: 4,
  },
  progressStepText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  resultContainer: {
    padding: theme.spacing.xl,
  },
  resultTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  resultCard: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.grey[300],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.paper,
  },
  resultText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.grey[300],
  },
  disabledButton: {
    backgroundColor: theme.colors.grey[300],
  },
  buttonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.primary.contrastText,
  },
  secondaryButtonText: {
    color: theme.colors.text.primary,
  },
  infoSection: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.paper,
  },
  infoTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
});

export default VirtualTryOnScreen; 