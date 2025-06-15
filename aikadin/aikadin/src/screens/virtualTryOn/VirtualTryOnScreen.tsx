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
import virtualTryOnService from '../../services/virtualTryOnService';

interface ImageData {
  uri: string;
  type: 'user' | 'clothing';
}

const VirtualTryOnScreen = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'upper_body' | 'lower_body' | 'dresses' | 'full_body'>('upper_body');
  
  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    console.log('🚀 [VirtualTryOnScreen] Starting virtual try-on process...');
    console.log('📋 [VirtualTryOnScreen] Input validation:', {
      userImageExists: !!userImage,
      clothingImageExists: !!clothingImage,
      selectedCategory: selectedCategory,
      userImageLength: userImage?.length,
      clothingImageLength: clothingImage?.length
    });

    setIsProcessing(true);
    setProgress(0);
    progressRef.current = 0;
    setResultImage(null);
    setProcessingStep('AI modeli başlatılıyor...');

    try {
      // Progress steps
      const progressSteps = [
        { progress: 15, step: 'Akıllı işleme sistemi başlatılıyor...' },
        { progress: 30, step: 'Görsel analizi yapılıyor...' },
        { progress: 50, step: 'Kıyafet ve vücut eşleştiriliyor...' },
        { progress: 70, step: 'Kompozit görsel oluşturuluyor...' },
        { progress: 85, step: 'Son iyileştirmeler uygulanıyor...' },
        { progress: 95, step: 'Sonuç hazırlanıyor...' }
      ];

      let stepIndex = 0;
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (stepIndex < progressSteps.length && progressRef.current < 95) {
          const currentStep = progressSteps[stepIndex];
          progressRef.current = currentStep.progress;
          setProgress(currentStep.progress);
          setProcessingStep(currentStep.step);
          console.log(`📊 [VirtualTryOnScreen] Progress: ${currentStep.progress}% - ${currentStep.step}`);
          stepIndex++;
        }
      }, 3000);

      console.log('🔄 [VirtualTryOnScreen] Calling virtualTryOnService...');
      const result = await virtualTryOnService.processVirtualTryOn({
        personImage: userImage,
        clothingImage: clothingImage,
        category: selectedCategory
      });

      // Clear interval and set final progress
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      progressRef.current = 100;
      setProgress(100);
      setProcessingStep('Tamamlandı!');

      console.log('📊 [VirtualTryOnScreen] Service result:', {
        success: result.success,
        hasResultImage: !!result.resultImage,
        resultImageLength: result.resultImage?.length,
        processingTime: result.processingTime,
        error: result.error
      });

      if (result.success && result.resultImage) {
        console.log('✅ [VirtualTryOnScreen] Setting result image:', result.resultImage);
        setResultImage(result.resultImage);
        Alert.alert(
          'Başarılı!', 
          `Sanal deneme tamamlandı! ${result.processingTime ? `(${Math.round(result.processingTime / 1000)}s)` : ''}`
        );
      } else {
        console.error('❌ [VirtualTryOnScreen] No result image or failed:', result);
        throw new Error(result.error || 'Bilinmeyen hata');
      }

    } catch (error) {
      console.error('❌ [VirtualTryOnScreen] Virtual try-on error:', error);
      console.error('🔍 [VirtualTryOnScreen] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      Alert.alert(
        'İşlem Hatası',
        'Sanal deneme işlemi gerçekleştirilemedi. Lütfen tekrar deneyin.'
      );
    } finally {
      console.log('🏁 [VirtualTryOnScreen] Process completed, cleaning up...');
      
      // Clean up interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsProcessing(false);
      progressRef.current = 0;
      setProgress(0);
      setProcessingStep('');
    }
  };

  const saveResult = async () => {
    if (!resultImage) return;

    try {
      const savedUri = await virtualTryOnService.saveToGallery(resultImage);
      Alert.alert('Başarılı', 'Görsel galerinize kaydedildi!');
    } catch (error) {
      Alert.alert('Hata', 'Görsel kaydedilemedi.');
    }
  };

  const resetAll = () => {
    setUserImage(null);
    setClothingImage(null);
    setResultImage(null);
    setProgress(0);
    setProcessingStep('');
  };

  const renderCategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>Kıyafet Kategorisi:</Text>
      <View style={styles.categoryButtons}>
        {[
          { key: 'upper_body', label: 'Üst Giyim', icon: 'checkroom' },
          { key: 'lower_body', label: 'Alt Giyim', icon: 'dry-cleaning' },
          { key: 'dresses', label: 'Elbise', icon: 'woman' },
          { key: 'full_body', label: 'Komple', icon: 'person' }
        ].map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.key as any)}
          >
            <MaterialIcons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.key ? theme.colors.primary.contrastText : theme.colors.text.primary} 
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.key && styles.categoryButtonTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
      <Text style={styles.progressText}>🧠 Akıllı görsel işleme yapılıyor... %{progress}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressStepText}>{processingStep}</Text>
      <Text style={styles.progressNote}>
        💡 Gelişmiş algoritma ile gerçekçi sonuç oluşturuluyor
      </Text>
    </View>
  );

  const renderResult = () => {
    console.log('🖼️ [VirtualTryOnScreen] Rendering result:', {
      resultImageExists: !!resultImage,
      resultImageValue: resultImage,
      isProcessing: isProcessing
    });

    if (!resultImage) {
      console.log('⚠️ [VirtualTryOnScreen] No result image to render');
      return null;
    }

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>🎉 Sanal Deneme Sonucu</Text>
        <View style={styles.resultImageContainer}>
          <Image 
            source={{ uri: resultImage }} 
            style={styles.resultImage}
            onLoad={() => console.log('✅ [VirtualTryOnScreen] Result image loaded successfully')}
            onError={(error) => console.error('❌ [VirtualTryOnScreen] Result image load error:', error)}
          />
          <View style={styles.resultOverlay}>
            <TouchableOpacity style={styles.saveButton} onPress={saveResult}>
              <MaterialIcons name="save-alt" size={20} color={theme.colors.primary.contrastText} />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.resultDescription}>
          Akıllı görsel işleme teknolojisi ile oluşturulan sanal deneme sonucu
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="auto-fix-high" size={32} color={theme.colors.primary.main} />
          <Text style={styles.title}>AI Sanal Deneme Kabini</Text>
          <Text style={styles.subtitle}>
            Akıllı görsel işleme teknolojisi ile kıyafetlerin üzerinizde nasıl duracağını görün
          </Text>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>🧠 Akıllı İşleme</Text>
          </View>
        </View>

        {renderCategorySelector()}

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

        {(() => {
          console.log('🔍 [VirtualTryOnScreen] Main render check:', {
            resultImageExists: !!resultImage,
            isProcessing: isProcessing,
            shouldShowResult: resultImage && !isProcessing
          });
          
          if (resultImage && !isProcessing) {
            console.log('✅ [VirtualTryOnScreen] Rendering result section');
            return renderResult();
          } else {
            console.log('⚠️ [VirtualTryOnScreen] Not rendering result section');
            return null;
          }
        })()}

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
                <Text style={styles.buttonText}>AI Sanal Deneme Başlat</Text>
              </>
            )}
          </TouchableOpacity>

          {(userImage || clothingImage || resultImage) && (
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
          <Text style={styles.infoTitle}>💡 En İyi Sonuç İçin İpuçları:</Text>
          <Text style={styles.infoText}>
            • Net ve aydınlık fotoğraflar kullanın{'\n'}
            • Düz pozda çekilmiş fotoğraflar daha iyi sonuç verir{'\n'}
            • Kıyafet fotoğrafının temiz arka plana sahip olması idealdir{'\n'}
            • Doğru kategori seçimi sonucu iyileştirir{'\n'}
            • Akıllı görsel işleme teknolojisi kullanılıyor{'\n'}
            • İşlem 10-20 saniye sürer{'\n'}
            • Sonuçlar cihazınızda güvenle işlenir
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
  categoryContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    backgroundColor: theme.colors.background.paper,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  categoryButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  categoryButtonTextActive: {
    color: theme.colors.primary.contrastText,
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
    borderColor: theme.colors.neutral[300],
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
    backgroundColor: theme.colors.neutral[50],
  },
  emptyImageText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.sm,
  },
  progressContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
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
    backgroundColor: theme.colors.neutral[200],
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
    textAlign: 'center',
  },
  resultContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  resultImageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  resultImage: {
    width: 280,
    height: 380,
    resizeMode: 'cover',
  },
  resultOverlay: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success.main,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonText: {
    color: theme.colors.primary.contrastText,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  resultDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
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
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  disabledButton: {
    backgroundColor: theme.colors.neutral[300],
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
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
  techBadge: {
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  techBadgeText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.primary.contrastText,
  },
  progressNote: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.hint,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default VirtualTryOnScreen; 