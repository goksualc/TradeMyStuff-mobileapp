import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/store/store';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </StoreProvider>
  );
};

export default App;
