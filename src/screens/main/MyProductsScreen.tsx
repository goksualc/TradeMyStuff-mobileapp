import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
  useTheme,
  IconButton,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchProductsByUser } from '../../store/slices/productSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { productAPI } from '../../services/productAPI';

const { width } = Dimensions.get('window');

type MyProductsScreenNavigationProp = NavigationProp<MainStackParamList, 'MyProducts'>;

const MyProductsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'sold' | 'pending'>('all');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const theme = useTheme();
  const navigation = useNavigation<MyProductsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { products, isLoading } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      loadMyProducts();
    }
  }, [user?.id]);

  const loadMyProducts = async () => {
    try {
      await dispatch(fetchProductsByUser(user!.id)).unwrap();
    } catch (error) {
      console.error('Error loading my products:', error);
      Alert.alert('Error', 'Failed to load your products');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProducts();
    setRefreshing(false);
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleEditProduct = (productId: string) => {
    Alert.alert('Coming Soon', 'Edit product feature will be available soon');
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productAPI.deleteProduct(productId);
              await loadMyProducts();
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleCreateProduct = () => {
    navigation.navigate('CreateProduct');
  };

  const getFilteredProducts = () => {
    if (activeFilter === 'all') return products;
    return products.filter(product => product.status === activeFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.colors.success;
      case 'sold':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Active';
      case 'sold':
        return 'Sold';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
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
        
        <View style={styles.statusBadge}>
          <Chip
            mode="flat"
            textStyle={styles.statusChipText}
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(product.status) }
            ]}
          >
            {getStatusLabel(product.status)}
          </Chip>
        </View>

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
          
          <View style={styles.productActions}>
            <Button
              mode="outlined"
              onPress={() => handleEditProduct(product.id)}
              style={styles.actionButton}
              compact
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleDeleteProduct(product.id)}
              style={[styles.actionButton, styles.deleteButton]}
              compact
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="package-variant" size={64} color={theme.colors.textSecondary} />
      <Text variant="titleMedium" style={styles.emptyStateTitle}>
        No products yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyStateSubtitle}>
        Start selling by creating your first product listing
      </Text>
      <Button
        mode="contained"
        onPress={handleCreateProduct}
        style={styles.createButton}
        icon="plus"
      >
        Create Product
      </Button>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {(['all', 'active', 'sold', 'pending'] as const).map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterTab,
            activeFilter === filter && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter(filter)}
        >
          <Text
            variant="bodyMedium"
            style={[
              styles.filterTabText,
              activeFilter === filter && styles.activeFilterTabText
            ]}
          >
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const filteredProducts = getFilteredProducts();

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text variant="titleMedium" style={styles.headerTitle}>
              My Products
            </Text>
            <TouchableOpacity onPress={handleCreateProduct}>
              <Icon name="plus-circle" size={40} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Stats Summary */}
        <Surface style={styles.statsContainer} elevation={1}>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
              {products.filter(p => p.status === 'available').length}
            </Text>
            <Text variant="bodyMedium">Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.secondary }]}>
              {products.filter(p => p.status === 'sold').length}
            </Text>
            <Text variant="bodyMedium">Sold</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.warning }]}>
              {products.filter(p => p.status === 'pending').length}
            </Text>
            <Text variant="bodyMedium">Pending</Text>
          </View>
        </Surface>

        {/* Filter Tabs */}
        {products.length > 0 && renderFilterTabs()}

        {/* Products List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredProducts.length > 0 ? (
          <View style={styles.productsContainer}>
            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
            />
          </View>
        ) : (
          renderEmptyState()
        )}

        {/* Create Product Button */}
        {products.length > 0 && (
          <View style={styles.createProductContainer}>
            <Button
              mode="contained"
              onPress={handleCreateProduct}
              style={styles.createProductButton}
              contentStyle={styles.buttonContent}
              icon="plus"
            >
              Create New Product
            </Button>
          </View>
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
    paddingVertical: 64,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  statsContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  filterTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeFilterTab: {
    backgroundColor: '#2196F3',
  },
  filterTabText: {
    color: '#666',
  },
  activeFilterTabText: {
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
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    color: 'white',
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
    marginBottom: 12,
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
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  createButton: {
    borderRadius: 8,
  },
  createProductContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  createProductButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default MyProductsScreen;
