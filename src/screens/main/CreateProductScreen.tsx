import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  useTheme,
  HelperText,
  Chip,
  IconButton,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { productAPI } from '../../services/productAPI';

type CreateProductScreenNavigationProp = NavigationProp<MainStackParamList, 'CreateProduct'>;

const CreateProductScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    tags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [newTag, setNewTag] = useState('');

  const theme = useTheme();
  const navigation = useNavigation<CreateProductScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Automotive', 'Other'
  ];

  const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await productAPI.createProduct({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim(),
        images: [], // TODO: Implement image upload
        tags: formData.tags,
      });

      Alert.alert(
        'Success',
        'Product created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleCategorySelect = (category: string) => {
    updateFormData('category', category);
    setShowCategoryDialog(false);
  };

  const handleConditionSelect = (condition: string) => {
    updateFormData('condition', condition);
    setShowConditionDialog(false);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text variant="titleMedium" style={styles.headerTitle}>
              Create Product
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </Surface>

        {/* Form */}
        <Surface style={styles.formContainer} elevation={1}>
          <Text variant="headlineSmall" style={styles.formTitle}>
            Product Information
          </Text>

          {/* Title */}
          <TextInput
            label="Product Title"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            mode="outlined"
            error={!!errors.title}
            style={styles.input}
            left={<TextInput.Icon icon="tag" />}
          />
          <HelperText type="error" visible={!!errors.title}>
            {errors.title}
          </HelperText>

          {/* Description */}
          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            mode="outlined"
            multiline
            numberOfLines={4}
            error={!!errors.description}
            style={styles.input}
            left={<TextInput.Icon icon="text" />}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>

          {/* Price */}
          <TextInput
            label="Price ($)"
            value={formData.price}
            onChangeText={(value) => updateFormData('price', value)}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.price}
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />
          <HelperText type="error" visible={!!errors.price}>
            {errors.price}
          </HelperText>

          {/* Category */}
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryDialog(true)}
          >
            <View style={styles.pickerContent}>
              <Icon name="folder" size={20} color={theme.colors.textSecondary} />
              <Text
                variant="bodyLarge"
                style={[
                  styles.pickerText,
                  !formData.category && styles.placeholderText
                ]}
              >
                {formData.category || 'Select Category'}
              </Text>
              <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
          <HelperText type="error" visible={!!errors.category}>
            {errors.category}
          </HelperText>

          {/* Condition */}
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowConditionDialog(true)}
          >
            <View style={styles.pickerContent}>
              <Icon name="star" size={20} color={theme.colors.textSecondary} />
              <Text
                variant="bodyLarge"
                style={[
                  styles.pickerText,
                  !formData.condition && styles.placeholderText
                ]}
              >
                {formData.condition ? formData.condition.charAt(0).toUpperCase() + formData.condition.slice(1) : 'Select Condition'}
              </Text>
              <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
          <HelperText type="error" visible={!!errors.condition}>
            {errors.condition}
          </HelperText>

          {/* Location */}
          <TextInput
            label="Location"
            value={formData.location}
            onChangeText={(value) => updateFormData('location', value)}
            mode="outlined"
            error={!!errors.location}
            style={styles.input}
            left={<TextInput.Icon icon="map-marker" />}
          />
          <HelperText type="error" visible={!!errors.location}>
            {errors.location}
          </HelperText>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text variant="bodyMedium" style={styles.tagsLabel}>
              Tags (optional)
            </Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                label="Add tag"
                value={newTag}
                onChangeText={setNewTag}
                mode="outlined"
                style={styles.tagInput}
                onSubmitEditing={handleAddTag}
              />
              <Button
                mode="contained"
                onPress={handleAddTag}
                disabled={!newTag.trim()}
                style={styles.addTagButton}
              >
                Add
              </Button>
            </View>
            
            {formData.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tag}
                    mode="outlined"
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
            icon="plus"
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </Button>
        </Surface>
      </ScrollView>

      {/* Category Dialog */}
      <Portal>
        <Dialog visible={showCategoryDialog} onDismiss={() => setShowCategoryDialog(false)}>
          <Dialog.Title>Select Category</Dialog.Title>
          <Dialog.Content>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.dialogItem}
                onPress={() => handleCategorySelect(category)}
              >
                <Text variant="bodyLarge">{category}</Text>
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Condition Dialog */}
      <Portal>
        <Dialog visible={showConditionDialog} onDismiss={() => setShowConditionDialog(false)}>
          <Dialog.Title>Select Condition</Dialog.Title>
          <Dialog.Content>
            {conditions.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={styles.dialogItem}
                onPress={() => handleConditionSelect(condition)}
              >
                <View style={styles.conditionItem}>
                  <Text variant="bodyLarge">
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Text>
                  <View
                    style={[
                      styles.conditionIndicator,
                      { backgroundColor: getConditionColor(condition) }
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  formContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  formTitle: {
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  pickerButton: {
    marginBottom: 8,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  pickerText: {
    flex: 1,
    marginLeft: 12,
  },
  placeholderText: {
    color: '#999',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  submitButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dialogItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  conditionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default CreateProductScreen;
