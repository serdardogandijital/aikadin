import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import theme from '../../theme';
import ModernButton from '../../components/ModernButton';
import ModernCard from '../../components/ModernCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface OutfitRecommendation {
  id: string;
  title: string;
  image: string;
  category: string;
  weather: string;
  occasion: string;
}

interface TrendingItem {
  id: string;
  title: string;
  image: string;
  likes: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userName] = useState('Kullanıcı');
  const [currentWeather] = useState('Güneşli, 22°C');
  
  const [outfitRecommendations] = useState<OutfitRecommendation[]>([
    {
      id: '1',
      title: 'Günlük Şık Kombin',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
      category: 'Günlük',
      weather: 'Güneşli',
      occasion: 'Günlük'
    },
    {
      id: '2',
      title: 'İş Toplantısı Kombini',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
      category: 'Formal',
      weather: 'Kapalı',
      occasion: 'İş'
    },
    {
      id: '3',
      title: 'Akşam Yemeği Stili',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
      category: 'Şık',
      weather: 'Serin',
      occasion: 'Akşam'
    },
  ]);

  const [trendingItems] = useState<TrendingItem[]>([
    {
      id: '1',
      title: 'Vintage Denim Ceket',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
      likes: 234
    },
    {
      id: '2',
      title: 'Minimalist Elbise',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop',
      likes: 189
    },
    {
      id: '3',
      title: 'Spor Ayakkabı',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
      likes: 156
    },
  ]);

  const renderOutfitCard = ({ item }: { item: OutfitRecommendation }) => (
    <ModernCard
      style={styles.outfitCard}
      onPress={() => navigation.navigate('VirtualTryOn')}
      variant="elevated"
      padding="none"
    >
      <Image source={{ uri: item.image }} style={styles.outfitImage} />
      <View style={styles.outfitInfo}>
        <Text style={styles.outfitTitle}>{item.title}</Text>
        <View style={styles.outfitTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.category}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.weather}</Text>
          </View>
        </View>
      </View>
    </ModernCard>
  );

  const renderTrendingItem = ({ item }: { item: TrendingItem }) => (
    <ModernCard
      style={styles.trendingCard}
      onPress={() => navigation.navigate('Main', { screen: 'Wardrobe' })}
      variant="outlined"
      padding="small"
    >
      <Image source={{ uri: item.image }} style={styles.trendingImage} />
      <Text style={styles.trendingTitle}>{item.title}</Text>
      <View style={styles.likesContainer}>
        <Ionicons name="heart" size={16} color={theme.colors.error.main} />
        <Text style={styles.likesText}>{item.likes}</Text>
      </View>
    </ModernCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.userName}>{userName}! 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
        >
          <Ionicons name="person-circle" size={40} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Weather Card */}
        <ModernCard style={styles.weatherCard} variant="filled" padding="medium">
          <View style={styles.weatherContent}>
            <View style={styles.weatherInfo}>
              <Ionicons name="sunny" size={32} color={theme.colors.warning.main} />
              <View style={styles.weatherText}>
                <Text style={styles.weatherTitle}>Bugünün Havası</Text>
                <Text style={styles.weatherDescription}>{currentWeather}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.weatherButton}>
              <Text style={styles.weatherButtonText}>Kombin Öner</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('VirtualTryOn')}
            >
              <View style={styles.quickActionIcon}>
                <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary.main} />
              </View>
              <Text style={styles.quickActionText}>Sanal Deneme</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Main', { screen: 'Assistant' })}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.secondary.main} />
              </View>
              <Text style={styles.quickActionText}>AI Asistan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Main', { screen: 'Wardrobe' })}
            >
              <View style={styles.quickActionIcon}>
                <MaterialIcons name="checkroom" size={24} color={theme.colors.success.main} />
              </View>
              <Text style={styles.quickActionText}>Gardırobum</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('News')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="analytics" size={24} color={theme.colors.info.main} />
              </View>
              <Text style={styles.quickActionText}>İstatistikler</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Outfit Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Senin İçin Öneriler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={outfitRecommendations}
            renderItem={renderOutfitCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trend Olanlar</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingItems}
            renderItem={renderTrendingItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Style Analysis CTA */}
        <ModernCard style={styles.ctaCard} variant="elevated" padding="large">
          <View style={styles.ctaContent}>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Stil Analizin Hazır!</Text>
              <Text style={styles.ctaDescription}>
                Kişisel stil profilini keşfet ve daha iyi öneriler al
              </Text>
            </View>
            <ModernButton
              title="Analizi Gör"
              onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
              variant="primary"
              size="medium"
            />
          </View>
        </ModernCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.paper,
    ...theme.shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeights.regular as any,
  },
  userName: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.bold as any,
    marginTop: 2,
  },
  profileButton: {
    padding: theme.spacing.xs,
  },
  weatherCard: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  weatherText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  weatherTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium as any,
    color: theme.colors.text.primary,
  },
  weatherDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  weatherButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  weatherButtonText: {
    color: theme.colors.primary.contrastText,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium as any,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeights.medium as any,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  quickActionText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.fontWeights.medium as any,
  },
  horizontalList: {
    paddingLeft: theme.spacing.md,
  },
  outfitCard: {
    width: 200,
    marginRight: theme.spacing.md,
  },
  outfitImage: {
    width: '100%',
    height: 240,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  outfitInfo: {
    padding: theme.spacing.md,
  },
  outfitTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  outfitTags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary.dark,
    fontWeight: theme.fontWeights.medium as any,
  },
  trendingCard: {
    width: 140,
    marginRight: theme.spacing.md,
  },
  trendingImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  trendingTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  ctaCard: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  ctaTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  ctaDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes.sm,
  },
});

export default HomeScreen; 