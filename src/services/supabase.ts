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
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

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
  // Check if username is available
  async checkUsernameAvailability(username: string, currentUserId?: string) {
    try {
      const query = supabase.from('profiles').select('id, username').ilike('username', username);

      // Exclude current user's username check (for updates)
      if (currentUserId) {
        query.neq('id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking username availability:', error);
        return { success: false, error: error.message, available: false };
      }

      // Username is available if no matching records found
      const available = !data || data.length === 0;
      return { success: true, available };
    } catch (error) {
      console.error('Unexpected error checking username:', error);
      return { success: false, error: 'Failed to check username availability', available: false };
    }
  },

  // Create user profile
  async createProfile(
    userId: string,
    profileData: {
      username: string;
      email?: string;
      phone_number?: string;
      display_name?: string;
    }
  ) {
    try {
      // Check username availability first
      const usernameCheck = await this.checkUsernameAvailability(profileData.username);
      if (!usernameCheck.available) {
        return { success: false, error: 'Username is already taken' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // Handle unique constraint violation
        if (error.code === '23505') {
          return { success: false, error: 'Username is already taken' };
        }
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
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

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
  async updateProfile(
    userId: string,
    updates: {
      username?: string;
      email?: string;
      phone_number?: string;
      display_name?: string;
    }
  ) {
    try {
      // If username is being updated, check availability
      if (updates.username) {
        const usernameCheck = await this.checkUsernameAvailability(updates.username, userId);
        if (!usernameCheck.available) {
          return { success: false, error: 'Username is already taken' };
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        // Handle unique constraint violation
        if (error.code === '23505') {
          return { success: false, error: 'Username is already taken' };
        }
        return { success: false, error: error.message };
      }

      // If email is being updated, update auth.users as well
      if (updates.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email,
        });

        if (authError) {
          console.warn('Warning: Profile updated but email sync failed:', authError);
          // Don't fail the whole operation, just log warning
        }
      }

      // If phone is being updated, update auth.users as well
      if (updates.phone_number) {
        const { error: authError } = await supabase.auth.updateUser({
          phone: updates.phone_number,
        });

        if (authError) {
          console.warn('Warning: Profile updated but phone sync failed:', authError);
          // Don't fail the whole operation, just log warning
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  },

  // Get profile by username
  async getProfileByUsername(username: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', username)
        .single();

      if (error) {
        console.error('Error getting profile by username:', error);
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };
    } catch (error) {
      console.error('Unexpected error getting profile by username:', error);
      return { success: false, error: 'Failed to get profile' };
    }
  },
};
