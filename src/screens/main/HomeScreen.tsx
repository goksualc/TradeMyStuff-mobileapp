import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Surface,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchFeaturedProducts, fetchProducts } from '../../store/slices/productSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NavigationProp<MainStackParamList, 'MainTabs'>;

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { featuredProducts, products, isLoading } = useSelector(
    (state: RootState) => state.products
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Automotive', 'Other'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchFeaturedProducts()).unwrap(),
        dispatch(fetchProducts()).unwrap(),
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    // You can implement category filtering here
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleCreateProduct = () => {
    navigation.navigate('CreateProduct');
  };

  const handleViewAllProducts = () => {
    // Navigate to search with no filters
  };

  const renderProductCard = (product: any) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product.id)}
    >
      <Card style={styles.card} elevation={2}>
        <FastImage
          source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Card.Content style={styles.cardContent}>
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
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      onPress={() => handleCategoryPress(category)}
    >
      <Chip
        mode={selectedCategory === category ? 'flat' : 'outlined'}
        selected={selectedCategory === category}
        style={[
          styles.categoryChip,
          selectedCategory === category && { backgroundColor: theme.colors.primary }
        ]}
        textStyle={[
          styles.categoryChipText,
          selectedCategory === category && { color: 'white' }
        ]}
      >
        {category}
      </Chip>
    </TouchableOpacity>
  );

  if (isLoading && !featuredProducts.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Surface style={styles.header} elevation={1}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineSmall" style={styles.welcomeText}>
                Welcome back,
              </Text>
              <Text variant="headlineMedium" style={[styles.userName, { color: theme.colors.primary }]}>
                {user?.firstName || 'User'}!
              </Text>
            </View>
            <TouchableOpacity onPress={handleCreateProduct}>
              <Icon name="plus-circle" size={40} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Categories */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Browse Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Featured Products
            </Text>
            <Button
              mode="text"
              onPress={handleViewAllProducts}
              textColor={theme.colors.primary}
            >
              View All
            </Button>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          >
            {featuredProducts.slice(0, 5).map(renderProductCard)}
          </ScrollView>
        </View>

        {/* Recent Products */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Listings
          </Text>
          <View style={styles.recentProductsGrid}>
            {products.slice(0, 6).map(renderProductCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateProduct}
            >
              <Icon name="plus" size={24} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.actionText}>
                Sell Item
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Icon name="magnify" size={24} color={theme.colors.secondary} />
              <Text variant="bodyMedium" style={styles.actionText}>
                Search
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <Icon name="chat" size={24} color={theme.colors.accent} />
              <Text variant="bodyMedium" style={styles.actionText}>
                Messages
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#666',
  },
  userName: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    marginRight: 12,
  },
  categoryChipText: {
    fontSize: 14,
  },
  productsContainer: {
    paddingRight: 20,
  },
  productCard: {
    width: width * 0.4,
    marginRight: 16,
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
  recentProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 80,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
