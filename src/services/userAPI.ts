import api from './api';
import { UserProfile } from '../store/slices/userSlice';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface UpdatePreferencesData {
  notifications?: boolean;
  emailUpdates?: boolean;
  pushNotifications?: boolean;
}

export const userAPI = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  async updateProfile(profileData: UpdateProfileData): Promise<Partial<UserProfile>> {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  async uploadAvatar(imageUri: string): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updatePreferences(preferences: UpdatePreferencesData): Promise<UpdatePreferencesData> {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.put('/users/change-password', data);
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/account');
  },

  async getUserStats(userId: string): Promise<{
    totalSales: number;
    totalPurchases: number;
    rating: number;
    memberSince: string;
  }> {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  async getUserReviews(userId: string): Promise<{
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      reviewer: {
        id: string;
        username: string;
        avatar?: string;
      };
      createdAt: string;
    }>;
  }> {
    const response = await api.get(`/users/${userId}/reviews`);
    return response.data;
  },

  async followUser(userId: string): Promise<void> {
    await api.post(`/users/${userId}/follow`);
  },

  async unfollowUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/follow`);
  },

  async getFollowers(userId: string): Promise<{
    followers: Array<{
      id: string;
      username: string;
      avatar?: string;
      isFollowing: boolean;
    }>;
  }> {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  async getFollowing(userId: string): Promise<{
    following: Array<{
      id: string;
      username: string;
      avatar?: string;
      isFollowing: boolean;
    }>;
  }> {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  async reportUser(userId: string, reason: string): Promise<void> {
    await api.post(`/users/${userId}/report`, { reason });
  },
};
