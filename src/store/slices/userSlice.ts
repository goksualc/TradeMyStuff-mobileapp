import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userAPI } from '../../services/userAPI';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  rating: number;
  totalSales: number;
  totalPurchases: number;
  memberSince: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    pushNotifications: boolean;
  };
}

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  isUpdating: false,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId: string) => {
    const response = await userAPI.getProfile(userId);
    return response;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData: Partial<UserProfile>) => {
    const response = await userAPI.updateProfile(profileData);
    return response;
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (imageUri: string) => {
    const response = await userAPI.uploadAvatar(imageUri);
    return response;
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserProfile['preferences']>) => {
    const response = await userAPI.updatePreferences(preferences);
    return response;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'Failed to update profile';
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.avatar = action.payload.avatarUrl;
        }
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.preferences = { ...state.profile.preferences, ...action.payload };
        }
      });
  },
});

export const { clearError, setProfile } = userSlice.actions;
export default userSlice.reducer;
