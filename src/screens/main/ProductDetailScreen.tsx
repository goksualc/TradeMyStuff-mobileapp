import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
  useTheme,
  Avatar,
  Divider,
  IconButton,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchProductById } from '../../store/slices/productSlice';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { chatAPI } from '../../services/chatAPI';

const { width } = Dimensions.get('window');

type ProductDetailScreenNavigationProp = NavigationProp<MainStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<MainStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const theme = useTheme();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { productId } = route.params;
  const { currentProduct, isLoading } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      await dispatch(fetchProductById(productId)).unwrap();
    } catch (error) {
      console.error('Error loading product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    }
  };

  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageDialog(true);
  };

  const handleChatWithSeller = async () => {
    if (!currentProduct || !user) return;

    setIsCreatingChat(true);
    try {
      const response = await chatAPI.createConversation(
        currentProduct.seller.id,
        currentProduct.id
      );
      
      navigation.navigate('Chat', {
        conversationId: response.conversation.id,
        participantName: currentProduct.seller.username,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleViewSellerProfile = () => {
    if (currentProduct) {
      navigation.navigate('UserProfile', { userId: currentProduct.seller.id });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return theme.colors.success;
      case 'like-new':
        return theme.colors.accent;
      case 'good':
        return theme.colors.info;
      case 'fair':
        return theme.colors.warning;
      case 'poor':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (isLoading || !currentProduct) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isOwnProduct = user?.id === currentProduct.seller.id;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text variant="titleMedium" style={styles.headerTitle}>
              Product Details
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </Surface>

        {/* Product Images */}
        <View style={styles.imagesContainer}>
          <FastImage
            source={{ uri: currentProduct.images[currentImageIndex] || 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          {currentProduct.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {currentProduct.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                >
                  <FastImage
                    source={{ uri: image }}
                    style={[
                      styles.thumbnail,
                      index === currentImageIndex && styles.activeThumbnail
                    ]}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <Surface style={styles.productInfo} elevation={1}>
          <View style={styles.priceRow}>
            <Text variant="headlineMedium" style={[styles.price, { color: theme.colors.primary }]}>
              ${currentProduct.price}
            </Text>
            <Chip
              mode="outlined"
              textStyle={[styles.conditionChip, { color: getConditionColor(currentProduct.condition) }]}
              style={[styles.conditionChip, { borderColor: getConditionColor(currentProduct.condition) }]}
            >
              {currentProduct.condition}
            </Chip>
          </View>

          <Text variant="headlineSmall" style={styles.title}>
            {currentProduct.title}
          </Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.metaText}>
                {currentProduct.location}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.metaText}>
                Listed {formatDate(currentProduct.createdAt)}
              </Text>
            </View>
          </View>

          {currentProduct.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text variant="bodyMedium" style={styles.tagsLabel}>
                Tags:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentProduct.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tag} mode="outlined">
                    {tag}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          )}
        </Surface>

        {/* Description */}
        <Surface style={styles.descriptionSection} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Description
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {currentProduct.description}
          </Text>
        </Surface>

        {/* Seller Info */}
        <Surface style={styles.sellerSection} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Seller Information
          </Text>
          
          <TouchableOpacity
            style={styles.sellerInfo}
            onPress={handleViewSellerProfile}
          >
            <Avatar.Text
              size={50}
              label={currentProduct.seller.username.charAt(0).toUpperCase()}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text variant="titleMedium" style={styles.sellerName}>
                {currentProduct.seller.username}
              </Text>
              <View style={styles.sellerRating}>
                <Icon name="star" size={16} color={theme.colors.warning} />
                <Text variant="bodyMedium" style={styles.ratingText}>
                  {currentProduct.seller.rating} rating
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.sellerLocation}>
                {currentProduct.location}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!isOwnProduct && (
            <Button
              mode="contained"
              onPress={handleChatWithSeller}
              loading={isCreatingChat}
              disabled={isCreatingChat}
              style={styles.chatButton}
              contentStyle={styles.buttonContent}
              icon="chat"
            >
              Chat with Seller
            </Button>
          )}
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Coming Soon', 'Share feature will be available soon')}
            style={styles.shareButton}
            contentStyle={styles.buttonContent}
            icon="share"
          >
            Share
          </Button>
        </View>
      </ScrollView>

      {/* Image Dialog */}
      <Portal>
        <Dialog visible={showImageDialog} onDismiss={() => setShowImageDialog(false)}>
          <Dialog.Content>
            <FastImage
              source={{ uri: currentProduct.images[currentImageIndex] }}
              style={styles.dialogImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowImageDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  imagesContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
  },
  mainImage: {
    width: width,
    height: width,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#2196F3',
  },
  productInfo: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontWeight: 'bold',
  },
  conditionChip: {
    height: 32,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 28,
  },
  metaInfo: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  tag: {
    marginRight: 8,
  },
  descriptionSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    lineHeight: 22,
    color: '#333',
  },
  sellerSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    marginRight: 16,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
  },
  sellerLocation: {
    color: '#666',
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  chatButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  shareButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dialogImage: {
    width: width - 64,
    height: width - 64,
  },
});

export default ProductDetailScreen;
