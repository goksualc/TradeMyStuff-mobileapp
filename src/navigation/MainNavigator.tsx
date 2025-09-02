import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ChatListScreen from '../screens/main/ChatListScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import ChatScreen from '../screens/main/ChatScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen';
import CreateProductScreen from '../screens/main/CreateProductScreen';
import MyProductsScreen from '../screens/main/MyProductsScreen';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Chat: { conversationId: string; participantName: string };
  UserProfile: { userId: string };
  CreateProduct: undefined;
  MyProducts: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'magnify' : 'magnify';
              break;
            case 'Chat':
              iconName = focused ? 'chat' : 'chat-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="MyProducts" component={MyProductsScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
