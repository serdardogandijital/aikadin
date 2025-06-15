import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity,
  Image, 
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../theme';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  source: string;
  category: string;
  url: string;
}

const NewsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // Kategoriler
  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'trends', name: 'Trendler' },
    { id: 'runway', name: 'Podyum' },
    { id: 'street', name: 'Sokak Stili' },
    { id: 'brands', name: 'Markalar' },
  ];

  useEffect(() => {
    // Mockup haberleri yükle
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: '2023 Yaz Sezonu Trendleri',
        summary: 'Bu yaz parlak renkler, desenli kumaşlar ve ferah kesimler ön planda olacak. Modacılar açık mavi, mercan ve yeşil tonlarını özellikle vurguluyor.',
        image: 'https://via.placeholder.com/400x250/F5A9A9/000000?text=Yaz+Trendleri',
        date: '3 Mayıs 2023',
        source: 'Vogue',
        category: 'trends',
        url: '#'
      },
      {
        id: '2',
        title: 'Sürdürülebilir Moda Markalarına İlgi Artıyor',
        summary: 'Geri dönüştürülmüş malzemelerden üretilen kıyafetler ve etik üretim yapan markalar 2023\'te beklenenden daha fazla ilgi gördü.',
        image: 'https://via.placeholder.com/400x250/A9F5A9/000000?text=Sürdürülebilir+Moda',
        date: '28 Nisan 2023',
        source: 'Elle',
        category: 'brands',
        url: '#'
      },
      {
        id: '3',
        title: 'Paris Moda Haftası Öne Çıkanlar',
        summary: 'Paris Moda Haftası\'nda büyük markalar yeni koleksiyonlarını tanıttı. Dior ve Chanel\'in yeni koleksiyonları büyük beğeni topladı.',
        image: 'https://via.placeholder.com/400x250/A9D0F5/000000?text=Paris+Moda+Haftası',
        date: '15 Nisan 2023',
        source: 'Harper\'s Bazaar',
        category: 'runway',
        url: '#'
      },
      {
        id: '4',
        title: 'Y Kuşağı Gardırop İstatistikleri Açıklandı',
        summary: 'Y kuşağının gardrop alışkanlıkları üzerine yapılan araştırmaya göre, bu nesil yılda ortalama 12 parça kıyafet alıyor ve bunların %30\'unu nadiren giyiyor.',
        image: 'https://via.placeholder.com/400x250/F5D0A9/000000?text=Y+Kuşağı+Moda',
        date: '10 Nisan 2023',
        source: 'Fashion Business',
        category: 'trends',
        url: '#'
      },
      {
        id: '5',
        title: 'Sokak Stilinde Yeni Akım: Oversized',
        summary: 'Sokak modasında oversized ceketler ve gömlekler popülerliğini artırıyor. Unisex parçalar genç kesim arasında yoğun ilgi görüyor.',
        image: 'https://via.placeholder.com/400x250/D0A9F5/000000?text=Sokak+Stili',
        date: '5 Nisan 2023',
        source: 'InStyle',
        category: 'street',
        url: '#'
      },
      {
        id: '6',
        title: 'Lüks Markaların Satışları Yükseliyor',
        summary: 'Pandemi sonrası lüks moda markaları beklentilerin üzerinde bir toparlanma gösterdi. Online satışlar geçen yıla göre %45 artış kaydetti.',
        image: 'https://via.placeholder.com/400x250/F5F0A9/000000?text=Lüks+Moda',
        date: '1 Nisan 2023',
        source: 'Business of Fashion',
        category: 'brands',
        url: '#'
      },
    ];

    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000); // Yükleme görünümü için kısa bir gecikme
  }, []);

  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.newsCard}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={styles.source}>{item.source} • {item.date}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.summary} numberOfLines={3}>{item.summary}</Text>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Devamını Oku</Text>
          <MaterialIcons name="arrow-forward" size={16} color={theme.colors.primary.main} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: { id: string, name: string } }) => (
    <TouchableOpacity 
      style={[
        styles.categoryButton, 
        activeCategory === item.id ? styles.categoryButtonActive : {}
      ]}
      onPress={() => setActiveCategory(item.id)}
    >
      <Text 
        style={[
          styles.categoryText,
          activeCategory === item.id ? styles.categoryTextActive : {}
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moda Haberleri</Text>
      </View>
      
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Haberler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderNewsItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.newsList}
        />
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
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  categoryContainer: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: 50,
    backgroundColor: theme.colors.neutral[100],
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary.main,
  },
  categoryText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  categoryTextActive: {
    color: theme.colors.primary.contrastText,
    fontWeight: 'bold',
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
  newsList: {
    padding: theme.spacing.md,
  },
  newsCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  newsImage: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.neutral[200],
  },
  newsContent: {
    padding: theme.spacing.md,
  },
  source: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  summary: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  readMoreText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.primary.main,
    marginRight: theme.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  filterContainer: {
    backgroundColor: theme.colors.neutral[100],
  },
});

export default NewsScreen; 