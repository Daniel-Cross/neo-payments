import { create } from 'zustand';
import { authService, profileService } from '../services/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export interface UserProfile {
  id: string;
  phone_number: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  profile: UserProfile | null;
  phoneVerified: boolean;

  // Actions
  setLoading: (loading: boolean) => void;
  setUser: (user: any | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setPhoneVerified: (verified: boolean) => void;
  
  // Auth actions
  initializeAuth: () => Promise<void>;
  verifyPhoneNumber: (phoneNumber: string) => Promise<boolean>;
  createUserProfile: (phoneNumber: string, displayName?: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  signOut: () => Promise<void>;
  
  // Profile actions
  loadUserProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: false,
  user: null,
  profile: null,
  phoneVerified: false,

  // Basic setters
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setUser: (user: any | null) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile: UserProfile | null) => set({ profile }),
  setPhoneVerified: (verified: boolean) => set({ phoneVerified: verified }),

  // Initialize auth state
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Get current user
      const userResult = await authService.getCurrentUser();
      
      if (userResult.success && userResult.user) {
        set({ 
          user: userResult.user, 
          isAuthenticated: true,
          phoneVerified: !!userResult.user.phone
        });
        
        // Load user profile
        await get().loadUserProfile();
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          profile: null,
          phoneVerified: false 
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        profile: null,
        phoneVerified: false 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Verify phone number (this will be called after OTP verification)
  verifyPhoneNumber: async (phoneNumber: string) => {
    try {
      set({ isLoading: true });
      
      // The actual OTP verification is handled in the modal
      // This function is called after successful verification
      set({ phoneVerified: true });
      
      return true;
    } catch (error) {
      console.error('Error verifying phone number:', error);
      showErrorToast('Failed to verify phone number');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Create user profile
  createUserProfile: async (phoneNumber: string, displayName?: string) => {
    try {
      const { user } = get();
      if (!user) {
        showErrorToast('No authenticated user found');
        return false;
      }

      set({ isLoading: true });

      const result = await profileService.createProfile(user.id, {
        phone_number: phoneNumber,
        display_name: displayName || `User ${user.id.slice(0, 8)}`,
      });

      if (result.success) {
        set({ profile: result.data });
        showSuccessToast('Profile created successfully!');
        return true;
      } else {
        showErrorToast(result.error || 'Failed to create profile');
        return false;
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      showErrorToast('Failed to create profile');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update user profile
  updateUserProfile: async (updates: Partial<UserProfile>) => {
    try {
      const { user } = get();
      if (!user) {
        showErrorToast('No authenticated user found');
        return false;
      }

      set({ isLoading: true });

      const result = await profileService.updateProfile(user.id, updates);

      if (result.success) {
        // Reload profile to get updated data
        await get().loadUserProfile();
        showSuccessToast('Profile updated successfully!');
        return true;
      } else {
        showErrorToast(result.error || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      showErrorToast('Failed to update profile');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Load user profile
  loadUserProfile: async () => {
    try {
      const { user } = get();
      if (!user) {
        return;
      }

      const result = await profileService.getProfile(user.id);

      if (result.success) {
        set({ profile: result.profile });
      } else {
        console.error('Error loading profile:', result.error);
        // Don't show error toast here as it might be expected for new users
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true });

      const result = await authService.signOut();

      if (result.success) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          profile: null,
          phoneVerified: false 
        });
        showSuccessToast('Signed out successfully');
      } else {
        showErrorToast(result.error || 'Failed to sign out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      showErrorToast('Failed to sign out');
    } finally {
      set({ isLoading: false });
    }
  },
}));

