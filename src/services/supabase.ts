import { createClient } from '@supabase/supabase-js';

// These should be moved to environment variables in production
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helper functions
export const authService = {
  // Send OTP to phone number
  async sendOTP(phoneNumber: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      
      if (error) {
        console.error('Error sending OTP:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error sending OTP:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  },

  // Verify OTP code
  async verifyOTP(phoneNumber: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });
      
      if (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error verifying OTP:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Unexpected error getting current user:', error);
      return { success: false, error: 'Failed to get user information' };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected error signing out:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Profile management functions
export const profileService = {
  // Create user profile
  async createProfile(userId: string, profileData: {
    phone_number?: string;
    display_name?: string;
    avatar_url?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      
      if (error) {
        console.error('Error creating profile:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
      return { success: false, error: 'Failed to create profile' };
    }
  },

  // Get user profile
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error getting profile:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, profile: data };
    } catch (error) {
      console.error('Unexpected error getting profile:', error);
      return { success: false, error: 'Failed to get profile' };
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    phone_number?: string;
    display_name?: string;
    avatar_url?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  },
};

