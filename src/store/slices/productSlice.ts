import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productAPI } from '../../services/productAPI';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  seller: {
    id: string;
    username: string;
    avatar?: string;
    rating: number;
  };
  location: string;
  createdAt: string;
  status: 'available' | 'sold' | 'pending';
  tags: string[];
}

export interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  searchResults: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    priceRange: [number, number];
    condition: string;
    location: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  searchResults: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {
    category: '',
    priceRange: [0, 10000],
    condition: '',
    location: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params?: { page?: number; filters?: any }) => {
    const response = await productAPI.getProducts(params);
    return response;
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string) => {
    const response = await productAPI.searchProducts(query);
    return response;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string) => {
    const response = await productAPI.getProductById(id);
    return response;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    const response = await productAPI.getFeaturedProducts();
    return response;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.products = action.payload.products;
        } else {
          state.products = [...state.products, ...action.payload.products];
        }
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.products;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Search failed';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.products;
      });
  },
});

export const {
  clearSearchResults,
  setFilters,
  clearFilters,
  setCurrentProduct,
  resetPagination,
} = productSlice.actions;
export default productSlice.reducer;
