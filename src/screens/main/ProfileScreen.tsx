import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  useTheme,
  Divider,
  List,
  Switch,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { fetchUserProfile, updateUserProfile, updatePreferences } from '../../store/slices/userSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenNavigationProp = NavigationProp<MainStackParamList, 'MainTabs'>;

const ProfileScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const theme = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, isLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      await dispatch(fetchUserProfile(user!.id)).unwrap();
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleEditProfile = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) return;

    try {
      const updateData: any = {};
      updateData[editField] = editValue.trim();
      
      await dispatch(updateUserProfile(updateData)).unwrap();
      setShowEditDialog(false);
      setEditValue('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    try {
      await dispatch(updatePreferences({ [key]: value })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      await AsyncStorage.clear();
      setShowLogoutDialog(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleNavigateTo = (screen: string) => {
    switch (screen) {
      case 'MyProducts':
        navigation.navigate('MyProducts');
        break;
      case 'UserProfile':
        if (user?.id) {
          navigation.navigate('UserProfile', { userId: user.id });
        }
        break;
      default:
        break;
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'firstName':
        return 'First Name';
      case 'lastName':
        return 'Last Name';
      case 'phone':
        return 'Phone Number';
      case 'location':
        return 'Location';
      case 'bio':
        return 'Bio';
      default:
        return field;
    }
  };

  const renderProfileHeader = () => (
    <Surface style={styles.profileHeader} elevation={2}>
      <View style={styles.avatarContainer}>
        {profile?.avatar ? (
          <FastImage
            source={{ uri: profile.avatar }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={80}
            label={`${user?.firstName?.charAt(0) || 'U'}${user?.lastName?.charAt(0) || ''}`}
            style={styles.avatar}
          />
        )}
        <TouchableOpacity style={styles.editAvatarButton}>
          <Icon name="camera" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <Text variant="headlineSmall" style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text variant="bodyMedium" style={styles.username}>
          @{user?.username}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <Button
        mode="outlined"
        onPress={() => setShowEditDialog(true)}
        style={styles.editProfileButton}
      >
        Edit Profile
      </Button>
    </Surface>
  );

  const renderStatsSection = () => (
    <Surface style={styles.statsSection} elevation={1}>
      <View style={styles.statItem}>
        <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
          {profile?.totalSales || 0}
        </Text>
        <Text variant="bodyMedium">Sales</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.secondary }]}>
          {profile?.totalPurchases || 0}
        </Text>
        <Text variant="bodyMedium">Purchases</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.accent }]}>
          {profile?.rating || 0}
        </Text>
        <Text variant="bodyMedium">Rating</Text>
      </View>
    </Surface>
  );

  const renderProfileDetails = () => (
    <Surface style={styles.detailsSection} elevation={1}>
      <List.Section>
        <List.Subheader>Profile Information</List.Subheader>
        
        <List.Item
          title="First Name"
          description={user?.firstName || 'Not set'}
          left={(props) => <List.Icon {...props} icon="account" />}
          right={(props) => (
            <TouchableOpacity onPress={() => handleEditProfile('firstName', user?.firstName || '')}>
              <Icon name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
        
        <List.Item
          title="Last Name"
          description={user?.lastName || 'Not set'}
          left={(props) => <List.Icon {...props} icon="account" />}
          right={(props) => (
            <TouchableOpacity onPress={() => handleEditProfile('lastName', user?.lastName || '')}>
              <Icon name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />

        <List.Item
          title="Phone"
          description={profile?.phone || 'Not set'}
          left={(props) => <List.Icon {...props} icon="phone" />}
          right={(props) => (
            <TouchableOpacity onPress={() => handleEditProfile('phone', profile?.phone || '')}>
              <Icon name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />

        <List.Item
          title="Location"
          description={profile?.location || 'Not set'}
          left={(props) => <List.Icon {...props} icon="map-marker" />}
          right={(props) => (
            <TouchableOpacity onPress={() => handleEditProfile('location', profile?.location || '')}>
              <Icon name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />

        <List.Item
          title="Bio"
          description={profile?.bio || 'No bio yet'}
          left={(props) => <List.Icon {...props} icon="information" />}
          right={(props) => (
            <TouchableOpacity onPress={() => handleEditProfile('bio', profile?.bio || '')}>
              <Icon name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
      </List.Section>
    </Surface>
  );

  const renderPreferences = () => (
    <Surface style={styles.preferencesSection} elevation={1}>
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        
        <List.Item
          title="Push Notifications"
          description="Receive push notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={profile?.preferences?.pushNotifications || false}
              onValueChange={(value) => handlePreferenceChange('pushNotifications', value)}
            />
          )}
        />

        <List.Item
          title="Email Updates"
          description="Receive email updates"
          left={(props) => <List.Icon {...props} icon="email" />}
          right={() => (
            <Switch
              value={profile?.preferences?.emailUpdates || false}
              onValueChange={(value) => handlePreferenceChange('emailUpdates', value)}
            />
          )}
        />
      </List.Section>
    </Surface>
  );

  const renderActions = () => (
    <Surface style={styles.actionsSection} elevation={1}>
      <List.Section>
        <List.Subheader>Actions</List.Subheader>
        
        <List.Item
          title="My Products"
          description="View and manage your listings"
          left={(props) => <List.Icon {...props} icon="package" />}
          onPress={() => handleNavigateTo('MyProducts')}
        />

        <List.Item
          title="View Public Profile"
          description="See how others see your profile"
          left={(props) => <List.Icon {...props} icon="account-eye" />}
          onPress={() => handleNavigateTo('UserProfile')}
        />

        <List.Item
          title="Change Password"
          description="Update your password"
          left={(props) => <List.Icon {...props} icon="lock" />}
          onPress={() => Alert.alert('Coming Soon', 'Password change feature will be available soon')}
        />

        <List.Item
          title="Delete Account"
          description="Permanently delete your account"
          left={(props) => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
          onPress={() => Alert.alert('Coming Soon', 'Account deletion feature will be available soon')}
        />
      </List.Section>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderStatsSection()}
        {renderProfileDetails()}
        {renderPreferences()}
        {renderActions()}

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={() => setShowLogoutDialog(true)}
            style={styles.logoutButton}
            textColor={theme.colors.error}
          >
            Logout
          </Button>
        </View>
      </ScrollView>

      {/* Edit Profile Dialog */}
      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>Edit {getFieldLabel(editField)}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={getFieldLabel(editField)}
              value={editValue}
              onChangeText={setEditValue}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onPress={handleSaveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>
              Logout
            </Button>
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
  profileHeader: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    color: '#666',
    marginBottom: 4,
  },
  email: {
    color: '#666',
  },
  editProfileButton: {
    borderRadius: 8,
  },
  statsSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  detailsSection: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  preferencesSection: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  actionsSection: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  logoutContainer: {
    margin: 16,
    marginBottom: 32,
  },
  logoutButton: {
    borderRadius: 8,
    borderColor: '#f44336',
  },
});

export default ProfileScreen;
