import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  Chip,
  useTheme,
  Divider,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { fetchProductsByUser } from '../../store/slices/productSlice';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { chatAPI } from '../../services/chatAPI';

type UserProfileScreenNavigationProp = NavigationProp<MainStackParamList, 'UserProfile'>;
type UserProfileScreenRouteProp = RouteProp<MainStackParamList, 'UserProfile'>;

const UserProfileScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  const theme = useTheme();
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const route = useRoute<UserProfileScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { userId } = route.params;
  const { profile, isLoading: profileLoading } = useSelector((state: RootState) => state.user);
  const { products, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      await Promise.all([
        dispatch(fetchUserProfile(userId)).unwrap(),
        dispatch(fetchProductsByUser(userId)).unwrap(),
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user profile');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleChatWithUser = async () => {
    if (!profile) return;

    setIsCreatingChat(true);
    try {
      const response = await chatAPI.createConversation(userId);
      
      navigation.navigate('Chat', {
        conversationId: response.conversation.id,
        participantName: profile.username,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleFollowUser = () => {
    Alert.alert('Coming Soon', 'Follow feature will be available soon');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderProductCard = ({ item: product }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product.id)}
    >
      <Surface style={styles.card} elevation={2}>
        <FastImage
          source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.cardContent}>
          <Text variant="titleSmall" numberOfLines={2} style={styles.productTitle}>
            {product.title}
          </Text>
          <Text variant="titleMedium" style={[styles.productPrice, { color: theme.colors.primary }]}>
            ${product.price}
          </Text>
          <View style={styles.productMeta}>
            <Chip
              mode="outlined"
              textStyle={styles.chipText}
              style={styles.conditionChip}
            >
              {product.condition}
            </Chip>
            <Text variant="bodySmall" style={styles.locationText}>
              {product.location}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderReviews = () => (
    <View style={styles.reviewsContainer}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Reviews
      </Text>
      <View style={styles.noReviewsContainer}>
        <Icon name="star-outline" size={48} color={theme.colors.textSecondary} />
        <Text variant="bodyMedium" style={styles.noReviewsText}>
          No reviews yet
        </Text>
        <Text variant="bodySmall" style={styles.noReviewsSubtext}>
          Be the first to review this user
        </Text>
      </View>
    </View>
  );

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="account-off" size={64} color={theme.colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          User not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text variant="titleMedium" style={styles.headerTitle}>
              Profile
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </Surface>

        {/* Profile Header */}
        <Surface style={styles.profileHeader} elevation={2}>
          <View style={styles.profileInfo}>
            {profile.avatar ? (
              <FastImage
                source={{ uri: profile.avatar }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={80}
                label={profile.username.charAt(0).toUpperCase()}
                style={styles.avatar}
              />
            )}
            
            <View style={styles.profileDetails}>
              <Text variant="headlineSmall" style={styles.username}>
                {profile.username}
              </Text>
              <Text variant="bodyMedium" style={styles.name}>
                {profile.firstName} {profile.lastName}
              </Text>
              {profile.location && (
                <View style={styles.locationContainer}>
                  <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
                  <Text variant="bodyMedium" style={styles.location}>
                    {profile.location}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {profile.bio && (
            <Text variant="bodyMedium" style={styles.bio}>
              {profile.bio}
            </Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {profile.totalSales}
              </Text>
              <Text variant="bodyMedium">Sales</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.secondary }]}>
                {profile.totalPurchases}
              </Text>
              <Text variant="bodyMedium">Purchases</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.accent }]}>
                {profile.rating}
              </Text>
              <Text variant="bodyMedium">Rating</Text>
            </View>
          </View>

          <View style={styles.memberInfo}>
            <Text variant="bodySmall" style={styles.memberSince}>
              Member since {formatDate(profile.memberSince)}
            </Text>
          </View>
        </Surface>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleChatWithUser}
              loading={isCreatingChat}
              disabled={isCreatingChat}
              style={styles.chatButton}
              contentStyle={styles.buttonContent}
              icon="chat"
            >
              Message
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleFollowUser}
              style={styles.followButton}
              contentStyle={styles.buttonContent}
              icon="account-plus"
            >
              Follow
            </Button>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'products' && styles.activeTab
            ]}
            onPress={() => setActiveTab('products')}
          >
            <Text
              variant="bodyMedium"
              style={[
                styles.tabText,
                activeTab === 'products' && styles.activeTabText
              ]}
            >
              Products ({products.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'reviews' && styles.activeTab
            ]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text
              variant="bodyMedium"
              style={[
                styles.tabText,
                activeTab === 'reviews' && styles.activeTabText
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <View style={styles.productsContainer}>
            {productsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : products.length > 0 ? (
              <FlatList
                data={products}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.productsList}
              />
            ) : (
              <View style={styles.noProductsContainer}>
                <Icon name="package-variant" size={64} color={theme.colors.textSecondary} />
                <Text variant="titleMedium" style={styles.noProductsText}>
                  No products yet
                </Text>
                <Text variant="bodyMedium" style={styles.noProductsSubtext}>
                  This user hasn't listed any products yet
                </Text>
              </View>
            )}
          </View>
        ) : (
          renderReviews()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  profileHeader: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    borderRadius: 40,
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  name: {
    color: '#666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    color: '#666',
  },
  bio: {
    marginBottom: 16,
    lineHeight: 20,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  memberInfo: {
    alignItems: 'center',
  },
  memberSince: {
    color: '#666',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chatButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  followButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
  productsList: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  productTitle: {
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
  },
  productPrice: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionChip: {
    height: 24,
  },
  chipText: {
    fontSize: 12,
  },
  locationText: {
    color: '#666',
    fontSize: 12,
  },
  noProductsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noProductsText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noProductsSubtext: {
    textAlign: 'center',
    color: '#666',
  },
  reviewsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noReviewsText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noReviewsSubtext: {
    textAlign: 'center',
    color: '#666',
  },
});

export default UserProfileScreen;
