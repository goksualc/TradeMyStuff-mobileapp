import api from './api';
import { Product } from '../store/slices/productSlice';

export interface ProductFilters {
  category?: string;
  priceRange?: [number, number];
  condition?: string;
  location?: string;
  search?: string;
}

export interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ProductDetailResponse {
  product: Product;
  relatedProducts: Product[];
  sellerInfo: {
    id: string;
    username: string;
    avatar?: string;
    rating: number;
    totalSales: number;
    memberSince: string;
    location: string;
  };
}

export const productAPI = {
  async getProducts(params?: {
    page?: number;
    filters?: ProductFilters;
  }): Promise<ProductResponse> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProductById(id: string): Promise<ProductDetailResponse> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async searchProducts(query: string): Promise<ProductResponse> {
    const response = await api.get('/products/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getFeaturedProducts(): Promise<ProductResponse> {
    const response = await api.get('/products/featured');
    return response.data;
  },

  async getProductsByCategory(category: string): Promise<ProductResponse> {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },

  async getProductsByUser(userId: string): Promise<ProductResponse> {
    const response = await api.get(`/users/${userId}/products`);
    return response.data;
  },

  async createProduct(productData: {
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    images: string[];
    location: string;
    tags: string[];
  }): Promise<{ product: Product }> {
    const response = await api.post('/products', productData);
    return response.data;
  },

  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<{ product: Product }> {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async getCategories(): Promise<{ categories: string[] }> {
    const response = await api.get('/products/categories');
    return response.data;
  },

  async getConditions(): Promise<{ conditions: string[] }> {
    const response = await api.get('/products/conditions');
    return response.data;
  },

  async uploadProductImage(imageUri: string): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product-image.jpg',
    } as any);

    const response = await api.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
