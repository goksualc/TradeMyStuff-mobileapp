import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../store/slices/authSlice';
import { authAPI } from '../services/authAPI';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        // Verify token is still valid
        try {
          const user = await authAPI.getCurrentUser();
          dispatch(setToken(token));
          dispatch(setUser(user));
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userData');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
