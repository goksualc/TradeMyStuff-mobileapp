import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
