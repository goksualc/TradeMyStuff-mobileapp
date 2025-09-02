import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    location?: string;
  };
  token: string;
}

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    
    // Store token and user data
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    
    return response.data;
  },

  async signup(userData: SignupData): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', userData);
    const { user, token } = response.data;
    
    // Store token and user data
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API response
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh');
    const { token } = response.data;
    
    await AsyncStorage.setItem('authToken', token);
    return { token };
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },
};
