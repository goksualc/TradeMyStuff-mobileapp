import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Text,
  Searchbar,
  Card,
  Chip,
  Button,
  useTheme,
  Surface,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { searchProducts, clearSearchResults, setFilters } from '../../store/slices/productSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');

type SearchScreenNavigationProp = NavigationProp<MainStackParamList, 'MainTabs'>;

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    condition: '',
    priceRange: [0, 10000] as [number, number],
    location: '',
  });

  const theme = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { searchResults, isLoading, filters } = useSelector(
    (state: RootState) => state.products
  );

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Automotive', 'Other'
  ];

  const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];

  const priceRanges = [
    { label: 'Under $50', value: [0, 50] },
    { label: '$50 - $100', value: [50, 100] },
    { label: '$100 - $250', value: [100, 250] },
    { label: '$250 - $500', value: [250, 500] },
    { label: '$500+', value: [500, 10000] },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      dispatch(clearSearchResults());
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      await dispatch(searchProducts(searchQuery.trim())).unwrap();
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const applyFilters = () => {
    dispatch(setFilters(selectedFilters));
    setShowFilters(false);
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      category: '',
      condition: '',
      priceRange: [0, 10000],
      location: '',
    });
    dispatch(clearSearchResults());
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderProductCard = ({ item: product }: { item: any }) => (
    <TouchableOpacity
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
          <View style={styles.sellerInfo}>
            <Text variant="bodySmall" style={styles.sellerText}>
              by {product.seller.username}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={theme.colors.warning} />
              <Text variant="bodySmall" style={styles.ratingText}>
                {product.seller.rating}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterSection = () => (
    <Surface style={styles.filtersContainer} elevation={2}>
      <View style={styles.filterHeader}>
        <Text variant="titleMedium">Filters</Text>
        <Button
          mode="text"
          onPress={clearAllFilters}
          textColor={theme.colors.error}
        >
          Clear All
        </Button>
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text variant="bodyMedium" style={styles.filterLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <Chip
              key={category}
              mode={selectedFilters.category === category ? 'flat' : 'outlined'}
              selected={selectedFilters.category === category}
              onPress={() => handleFilterChange('category', 
                selectedFilters.category === category ? '' : category
              )}
              style={styles.filterChip}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Condition Filter */}
      <View style={styles.filterSection}>
        <Text variant="bodyMedium" style={styles.filterLabel}>Condition</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {conditions.map((condition) => (
            <Chip
              key={condition}
              mode={selectedFilters.condition === condition ? 'flat' : 'outlined'}
              selected={selectedFilters.condition === condition}
              onPress={() => handleFilterChange('condition', 
                selectedFilters.condition === condition ? '' : condition
              )}
              style={styles.filterChip}
            >
              {condition}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Price Range Filter */}
      <View style={styles.filterSection}>
        <Text variant="bodyMedium" style={styles.filterLabel}>Price Range</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {priceRanges.map((range) => (
            <Chip
              key={range.label}
              mode={
                selectedFilters.priceRange[0] === range.value[0] && 
                selectedFilters.priceRange[1] === range.value[1] 
                  ? 'flat' 
                  : 'outlined'
              }
              selected={
                selectedFilters.priceRange[0] === range.value[0] && 
                selectedFilters.priceRange[1] === range.value[1]
              }
              onPress={() => handleFilterChange('priceRange', range.value)}
              style={styles.filterChip}
            >
              {range.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <Button
        mode="contained"
        onPress={applyFilters}
        style={styles.applyFiltersButton}
      >
        Apply Filters
      </Button>
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <Surface style={styles.searchHeader} elevation={2}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon 
            name={showFilters ? 'filter-off' : 'filter-variant'} 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </Surface>

      {/* Filters */}
      {showFilters && renderFilterSection()}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {searchQuery.trim() && (
          <View style={styles.resultsHeader}>
            <Text variant="titleMedium">
              {isLoading ? 'Searching...' : `${searchResults.length} results for "${searchQuery}"`}
            </Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        ) : searchQuery.trim() ? (
          <View style={styles.noResultsContainer}>
            <Icon name="magnify-close" size={64} color={theme.colors.textSecondary} />
            <Text variant="titleMedium" style={styles.noResultsText}>
              No products found
            </Text>
            <Text variant="bodyMedium" style={styles.noResultsSubtext}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        ) : (
          <View style={styles.initialStateContainer}>
            <Icon name="magnify" size={64} color={theme.colors.textSecondary} />
            <Text variant="titleMedium" style={styles.initialStateText}>
              Start searching for products
            </Text>
            <Text variant="bodyMedium" style={styles.initialStateSubtext}>
              Find great deals on items you want to buy or sell
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },
  filterChip: {
    marginRight: 8,
  },
  applyFiltersButton: {
    marginTop: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 48) / 2,
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
    marginBottom: 8,
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
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerText: {
    color: '#666',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    textAlign: 'center',
    color: '#666',
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  initialStateText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  initialStateSubtext: {
    textAlign: 'center',
    color: '#666',
  },
});

export default SearchScreen;
