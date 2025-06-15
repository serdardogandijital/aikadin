import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import theme from '../../theme';
// import { auth, db } from '../../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface StyleData {
  name: string;
  count: number;
  color: string;
}

interface ColorData {
  name: string;
  count: number;
  color: string;
}

interface CategoryData {
  name: string;
  count: number;
  color: string;
}

const StatsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ay');
  const [styleData, setStyleData] = useState<StyleData[]>([]);
  const [colorData, setColorData] = useState<ColorData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [mostWorn, setMostWorn] = useState('');
  const [rarelyWorn, setRarelyWorn] = useState('');

  useEffect(() => {
    // Mock veri yükle
    const fetchMockData = () => {
      setLoading(true);
      
      // Stil verileri
      const mockStyleData: StyleData[] = [
        { name: 'Günlük', count: 25, color: '#FF6384' },
        { name: 'Spor', count: 18, color: '#36A2EB' },
        { name: 'İş', count: 12, color: '#FFCE56' },
        { name: 'Gece', count: 5, color: '#4BC0C0' },
        { name: 'Özel', count: 3, color: '#9966FF' },
      ];
      
      // Renk verileri
      const mockColorData: ColorData[] = [
        { name: 'Siyah', count: 20, color: '#000000' },
        { name: 'Mavi', count: 15, color: '#2196F3' },
        { name: 'Beyaz', count: 12, color: '#EEEEEE' },
        { name: 'Kırmızı', count: 8, color: '#F44336' },
        { name: 'Yeşil', count: 6, color: '#4CAF50' },
        { name: 'Diğer', count: 10, color: '#9E9E9E' },
      ];
      
      // Kategori verileri
      const mockCategoryData: CategoryData[] = [
        { name: 'Üst', count: 30, color: '#FF9800' },
        { name: 'Alt', count: 20, color: '#8BC34A' },
        { name: 'Ayakkabı', count: 15, color: '#E91E63' },
        { name: 'Aksesuar', count: 10, color: '#673AB7' },
        { name: 'Dış Giyim', count: 8, color: '#795548' },
      ];
      
      setStyleData(mockStyleData);
      setColorData(mockColorData);
      setCategoryData(mockCategoryData);
      setTotalItems(83);
      setMostWorn('Siyah Skinny Jean');
      setRarelyWorn('Mavi Blazer Ceket');
      
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    
    fetchMockData();
  }, [activeTab]); // activeTab değiştiğinde verileri güncelle
  
  // PieChart için verileri formatlama
  const formatPieChartData = (data: (StyleData | ColorData | CategoryData)[]) => {
    return data.map(item => ({
      name: item.name,
      count: item.count,
      color: item.color,
      legendFontColor: theme.colors.text.primary,
      legendFontSize: 12
    }));
  };
  
  // BarChart için verileri formatlama
  const formatBarChartData = (data: CategoryData[]) => {
    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          data: data.map(item => item.count),
          colors: data.map(item => (opacity = 1) => item.color)
        }
      ]
    };
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background.paper,
    backgroundGradientTo: theme.colors.background.paper,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gardırop İstatistikleri</Text>
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ay' ? styles.activeTab : {}]} 
          onPress={() => setActiveTab('ay')}
        >
          <Text style={[styles.tabText, activeTab === 'ay' ? styles.activeTabText : {}]}>Aylık</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'yil' ? styles.activeTab : {}]} 
          onPress={() => setActiveTab('yil')}
        >
          <Text style={[styles.tabText, activeTab === 'yil' ? styles.activeTabText : {}]}>Yıllık</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tum' ? styles.activeTab : {}]} 
          onPress={() => setActiveTab('tum')}
        >
          <Text style={[styles.tabText, activeTab === 'tum' ? styles.activeTabText : {}]}>Tüm Zamanlar</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Özet</Text>
            <View style={styles.summaryItem}>
              <MaterialIcons name="style" size={24} color={theme.colors.primary.main} />
              <Text style={styles.summaryText}>Toplam Parça: <Text style={styles.summaryHighlight}>{totalItems}</Text></Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialIcons name="favorite" size={24} color={theme.colors.primary.main} />
              <Text style={styles.summaryText}>En Çok Giyilen: <Text style={styles.summaryHighlight}>{mostWorn}</Text></Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialIcons name="new-releases" size={24} color={theme.colors.primary.main} />
              <Text style={styles.summaryText}>En Az Giyilen: <Text style={styles.summaryHighlight}>{rarelyWorn}</Text></Text>
            </View>
          </View>
          
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
            <BarChart
              data={formatBarChartData(categoryData)}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              style={styles.chart}
            />
          </View>
          
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Renk Dağılımı</Text>
            <PieChart
              data={formatPieChartData(colorData)}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          </View>
          
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Stil Dağılımı</Text>
            <PieChart
              data={formatPieChartData(styleData)}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>İpucu</Text>
            <Text style={styles.infoText}>
              Gardırobunuzun %30'unu nadiren giyiyorsunuz. Temel parçalarınızı çeşitlendirerek daha fazla kombin oluşturabilirsiniz.
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
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.main,
  },
  tabText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.primary.main,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  chartCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  infoCard: {
    backgroundColor: theme.colors.primary.light,
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
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  summaryHighlight: {
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
  infoTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary.contrastText,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary.contrastText,
    lineHeight: 22,
  },
});

export default StatsScreen; 