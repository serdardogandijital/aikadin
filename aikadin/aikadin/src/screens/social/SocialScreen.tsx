import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import theme from '../../theme';
// import { auth, db } from '../../services/firebase';

// Kullanıcı ve post arayüzleri
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  following: number;
  bio: string;
  isFollowing: boolean;
}

interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  image: string;
  description: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}

const SocialScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('keşfet');

  useEffect(() => {
    // Mockup veriler
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Ayşe Yılmaz',
        username: 'ayseyilmaz',
        avatar: 'https://via.placeholder.com/150/F5A9A9/000000?text=AY',
        followers: 248,
        following: 115,
        bio: 'Moda tasarımcısı ve stil danışmanı. Minimalist görünümü seviyorum.',
        isFollowing: true
      },
      {
        id: '2',
        name: 'Mehmet Kaya',
        username: 'mehmetkya',
        avatar: 'https://via.placeholder.com/150/A9F5A9/000000?text=MK',
        followers: 876,
        following: 320,
        bio: 'Erkek moda bloggeri. Klasik ve spor giyim kombinleri.',
        isFollowing: false
      },
      {
        id: '3',
        name: 'Zeynep Demir',
        username: 'zeynepd',
        avatar: 'https://via.placeholder.com/150/D0A9F5/000000?text=ZD',
        followers: 1243,
        following: 531,
        bio: 'Vintage stil tutkunu. İkinci el kıyafetleri yeniden tasarlıyorum.',
        isFollowing: true
      },
      {
        id: '4',
        name: 'Kerem Yıldız',
        username: 'kremyldz',
        avatar: 'https://via.placeholder.com/150/A9D0F5/000000?text=KY',
        followers: 592,
        following: 215,
        bio: 'Streetwear ve hip-hop kültürü. Sneaker koleksiyoncusu.',
        isFollowing: false
      },
    ];

    const mockPosts: Post[] = [
      {
        id: '1',
        userId: '1',
        username: 'ayseyilmaz',
        userAvatar: 'https://via.placeholder.com/150/F5A9A9/000000?text=AY',
        image: 'https://via.placeholder.com/400x400/F5A9A9/000000?text=Yaz+Kombini',
        description: 'Yaz için hazırladığım hafta sonu kombinim. Pastel tonlar bu sene çok moda! #yazmodası #pasteltonlar',
        likes: 124,
        comments: 18,
        createdAt: '1 saat önce',
        isLiked: true
      },
      {
        id: '2',
        userId: '3',
        username: 'zeynepd',
        userAvatar: 'https://via.placeholder.com/150/D0A9F5/000000?text=ZD',
        image: 'https://via.placeholder.com/400x400/D0A9F5/000000?text=Vintage+Kombin',
        description: '70\'lerden ilham alan bu vintage kombini nasıl buldunuz? Anne dolabından çıkardığım ceketi yeniden tasarladım. #vintage #retro',
        likes: 89,
        comments: 7,
        createdAt: '3 saat önce',
        isLiked: false
      },
      {
        id: '3',
        userId: '4',
        username: 'kremyldz',
        userAvatar: 'https://via.placeholder.com/150/A9D0F5/000000?text=KY',
        image: 'https://via.placeholder.com/400x400/A9D0F5/000000?text=Streetwear+Stil',
        description: 'Bugünkü urban stilim. Oversized hoodie ve vintage denim. Bu sneaker\'ları geçen hafta buldum, çok nadir bir model! #streetwear #sneakerhead',
        likes: 76,
        comments: 5,
        createdAt: '5 saat önce',
        isLiked: false
      },
      {
        id: '4',
        userId: '2',
        username: 'mehmetkya',
        userAvatar: 'https://via.placeholder.com/150/A9F5A9/000000?text=MK',
        image: 'https://via.placeholder.com/400x400/A9F5A9/000000?text=İş+Kombini',
        description: 'Yarı resmi iş toplantıları için ideal bir kombin. Blazer ceket ve jean kombinini çok seviyorum. #businesscasual #mensfashion',
        likes: 45,
        comments: 4,
        createdAt: '1 gün önce',
        isLiked: true
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFollow = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isFollowing: !user.isFollowing, followers: user.isFollowing ? user.followers - 1 : user.followers + 1 } 
        : user
    ));
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } 
        : post
    ));
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
        <View style={styles.followStats}>
          <Text style={styles.followText}><Text style={styles.followCount}>{item.followers}</Text> takipçi</Text>
          <Text style={styles.followText}><Text style={styles.followCount}>{item.following}</Text> takip</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.followButton, item.isFollowing ? styles.followingButton : {}]} 
        onPress={() => handleFollow(item.id)}
      >
        <Text style={[styles.followButtonText, item.isFollowing ? styles.followingButtonText : {}]}>
          {item.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.userAvatar }} style={styles.postAvatar} />
        <Text style={styles.postUsername}>@{item.username}</Text>
        <Text style={styles.postTime}>{item.createdAt}</Text>
      </View>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction} onPress={() => handleLike(item.id)}>
          <FontAwesome 
            name={item.isLiked ? "heart" : "heart-o"} 
            size={24} 
            color={item.isLiked ? theme.colors.primary.main : theme.colors.text.primary} 
          />
          <Text style={styles.postActionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <FontAwesome name="comment-o" size={24} color={theme.colors.text.primary} />
          <Text style={styles.postActionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <FontAwesome name="share" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.postContent}>
        <Text style={styles.postDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moda Topluluğu</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="message" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'keşfet' ? styles.activeTab : {}]} 
          onPress={() => setActiveTab('keşfet')}
        >
          <Text style={[styles.tabText, activeTab === 'keşfet' ? styles.activeTabText : {}]}>Keşfet</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'takipler' ? styles.activeTab : {}]} 
          onPress={() => setActiveTab('takipler')}
        >
          <Text style={[styles.tabText, activeTab === 'takipler' ? styles.activeTabText : {}]}>Takip Ettiklerim</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        activeTab === 'keşfet' ? (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.postsList}
          />
        ) : (
          <FlatList
            data={users.filter(user => user.isFollowing)}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Takip Ettikleriniz</Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Önerilenler</Text>
                <FlatList
                  data={users.filter(user => !user.isFollowing)}
                  renderItem={renderUserItem}
                  keyExtractor={item => item.id}
                />
              </View>
            }
            contentContainerStyle={styles.usersList}
          />
        )
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerButton: {
    padding: theme.spacing.sm,
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
  postsList: {
    padding: theme.spacing.md,
  },
  usersList: {
    padding: theme.spacing.md,
  },
  postCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  postUsername: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    flex: 1,
  },
  postTime: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.neutral[200],
  },
  postActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  postActionText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  postContent: {
    padding: theme.spacing.md,
  },
  postDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  userUsername: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  userBio: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  followStats: {
    flexDirection: 'row',
  },
  followText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.md,
  },
  followCount: {
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  followButton: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  followButtonText: {
    color: theme.colors.primary.contrastText,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.sm,
  },
  followingButtonText: {
    color: theme.colors.primary.main,
  },
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
});

export default SocialScreen; 