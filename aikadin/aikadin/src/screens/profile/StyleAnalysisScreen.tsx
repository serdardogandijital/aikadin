import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../theme';
// import { auth, db } from '../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StyleTrait {
  title: string;
  description: string;
  score: number;
}

interface StyleRecommendation {
  title: string;
  description: string;
  imageUrl: string;
}

const StyleAnalysisScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [styleTraits, setStyleTraits] = useState<StyleTrait[]>([]);
  const [recommendations, setRecommendations] = useState<StyleRecommendation[]>([]);
  const [dominantStyle, setDominantStyle] = useState('');
  const [colorPalette, setColorPalette] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Kullanıcı profilini AsyncStorage'dan al
        const profileStr = await AsyncStorage.getItem('userProfile');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          setUserProfile(profile);
          
          // Profil verilerini analiz et ve stil özelliklerini çıkar
          analyzeUserStyle(profile);
        }
      } catch (error) {
        console.error('Profil verileri alınırken hata oluştu:', error);
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, []);
  
  const analyzeUserStyle = (profile: any) => {
    // Mockup stil analizi
    
    // 1. Stil özellikleri
    const mockStyleTraits: StyleTrait[] = [
      {
        title: 'Minimalist',
        description: 'Sade ve işlevsel parçaları tercih etme eğilimindesiniz.',
        score: profile?.style === 'Minimalist' ? 85 : 60
      },
      {
        title: 'Klasik',
        description: 'Zamansız ve kaliteli parçaları önemsiyorsunuz.',
        score: profile?.style === 'Klasik' ? 90 : 55
      },
      {
        title: 'Sportif',
        description: 'Rahatlık ve fonksiyonellik sizin için önemli.',
        score: profile?.style === 'Spor' ? 88 : 40
      },
      {
        title: 'Yaratıcı',
        description: 'Farklı renk ve dokuları bir araya getirmekten çekinmiyorsunuz.',
        score: profile?.style === 'Şık' ? 75 : 35
      },
      {
        title: 'Trend Takipçisi',
        description: 'Güncel moda akımlarını takip etmeyi seviyorsunuz.',
        score: 50
      }
    ];
    
    // 2. Baskın stil
    const dominantStyleType = mockStyleTraits.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
    
    // 3. Renk paleti
    const userColors = profile?.colors || ['Siyah', 'Beyaz', 'Mavi'];
    const colorMap: {[key: string]: string} = {
      'Siyah': '#000000',
      'Beyaz': '#FFFFFF',
      'Mavi': '#2196F3',
      'Kırmızı': '#F44336',
      'Yeşil': '#4CAF50',
      'Sarı': '#FFEB3B',
      'Mor': '#9C27B0',
      'Turuncu': '#FF9800',
      'Kahverengi': '#795548',
      'Gri': '#9E9E9E',
      'Pembe': '#E91E63',
      'Turkuaz': '#00BCD4'
    };
    
    const userColorPalette = userColors.map((color: string) => colorMap[color] || '#9E9E9E');
    
    // 4. Öneriler
    const mockRecommendations: StyleRecommendation[] = [
      {
        title: 'Kapsül Gardırop',
        description: 'Tarzınıza uygun minimum parçayla maksimum kombin oluşturabileceğiniz bir kapsül gardırop oluşturun.',
        imageUrl: 'https://via.placeholder.com/400x250/F5A9A9/000000?text=Kapsül+Gardırop'
      },
      {
        title: 'Sizin İçin İdeal Kesimler',
        description: `Vücut tipiniz için en uygun kesimler: ${profile?.height > 175 ? 'Uzun' : 'Standart'} boy pantolonlar ve ${profile?.style === 'Klasik' ? 'Slim fit' : 'Regular fit'} üst giyimler.`,
        imageUrl: 'https://via.placeholder.com/400x250/A9F5A9/000000?text=İdeal+Kesimler'
      },
      {
        title: 'Renk Kombinasyonları',
        description: `Tercih ettiğiniz ${userColors.join(', ')} tonlarıyla en iyi eşleşen nötr renkler: ${userColors.includes('Siyah') ? 'Gri' : 'Siyah'} ve ${userColors.includes('Beyaz') ? 'Bej' : 'Beyaz'}.`,
        imageUrl: 'https://via.placeholder.com/400x250/A9D0F5/000000?text=Renk+Kombinasyonları'
      }
    ];
    
    setStyleTraits(mockStyleTraits);
    setDominantStyle(dominantStyleType.title);
    setColorPalette(userColorPalette);
    setRecommendations(mockRecommendations);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stil Analizi</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Stil analiziniz hazırlanıyor...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userProfile?.name || 'Kullanıcı'}</Text>
              <Text style={styles.styleType}>Baskın Stil: <Text style={styles.styleTypeEmphasis}>{dominantStyle}</Text></Text>
            </View>
          </View>
          
          <View style={styles.styleTraitsCard}>
            <Text style={styles.sectionTitle}>Stil Özellikleriniz</Text>
            {styleTraits.map((trait, index) => (
              <View key={index} style={styles.traitItem}>
                <View style={styles.traitHeader}>
                  <Text style={styles.traitTitle}>{trait.title}</Text>
                  <Text style={styles.traitScore}>{trait.score}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${trait.score}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.traitDescription}>{trait.description}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.colorPaletteCard}>
            <Text style={styles.sectionTitle}>Renk Paletiniz</Text>
            <View style={styles.colorsContainer}>
              {colorPalette.map((color, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color }
                  ]}
                />
              ))}
            </View>
            <Text style={styles.colorDescription}>
              {userProfile?.colors?.length 
                ? `Favori renkleriniz ${userProfile?.colors.join(', ')} tarzınızı yansıtıyor.`
                : 'Renk tercihiniz belirtilmemiş.'
              }
            </Text>
          </View>
          
          <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Stil Önerileri</Text>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Image 
                source={{ uri: recommendation.imageUrl }} 
                style={styles.recommendationImage}
              />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
              </View>
            </View>
          ))}
          
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <MaterialIcons name="lightbulb" size={24} color={theme.colors.primary.contrastText} />
              <Text style={styles.tipTitle}>Stil İpucu</Text>
            </View>
            <Text style={styles.tipText}>
              {userProfile?.style === 'Spor' 
                ? 'Sportif parçalarınızı daha şık parçalarla birleştirerek çok yönlü bir gardroba sahip olabilirsiniz.'
                : userProfile?.style === 'Klasik'
                ? 'Temel parçalarınızı sezonun trend aksesuarlarıyla güncelleyebilirsiniz.'
                : 'Kendi tarzınızı keşfetmek için farklı stil öğelerini kombine etmekten çekinmeyin.'
              }
            </Text>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  styleType: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  styleTypeEmphasis: {
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  styleTraitsCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  traitItem: {
    marginBottom: theme.spacing.md,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  traitTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  traitScore: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.grey[200],
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
    borderRadius: 4,
  },
  traitDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  colorPaletteCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.grey[200],
  },
  colorDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  recommendationCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  recommendationImage: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.grey[200],
  },
  recommendationContent: {
    padding: theme.spacing.md,
  },
  recommendationTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  recommendationDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tipTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary.contrastText,
    marginLeft: theme.spacing.sm,
  },
  tipText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary.contrastText,
    lineHeight: 22,
  },
});

export default StyleAnalysisScreen; 