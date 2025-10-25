import { supabase } from './supabase';

export interface Contact {
  id: string;
  user_wallet_address: string;
  contact_wallet_address: string;
  contact_name?: string;
  contact_avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AddContactParams {
  contact_wallet_address: string;
  contact_name?: string;
  contact_avatar_url?: string;
}

class ContactsService {
  private static instance: ContactsService;

  private constructor() {}

  public static getInstance(): ContactsService {
    if (!ContactsService.instance) {
      ContactsService.instance = new ContactsService();
    }
    return ContactsService.instance;
  }

  /**
   * Set the current wallet address for RLS policies
   */
  private async setCurrentWalletAddress(walletAddress: string): Promise<void> {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_wallet_address',
      new_value: walletAddress,
      is_local: true,
    });
  }

  /**
   * Add a new contact
   */
  public async addContact(
    user_wallet_address: string,
    params: AddContactParams
  ): Promise<{ success: boolean; contact?: Contact; error?: string }> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      // Prevent adding self as contact
      if (user_wallet_address === params.contact_wallet_address) {
        return {
          success: false,
          error: 'Cannot add yourself as a contact',
        };
      }

      const { data, error } = await supabase
        .from('user_contacts')
        .insert({
          user_wallet_address,
          contact_wallet_address: params.contact_wallet_address,
          contact_name: params.contact_name,
          contact_avatar_url: params.contact_avatar_url,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          return {
            success: false,
            error: 'Contact already exists',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        contact: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add contact',
      };
    }
  }

  /**
   * Get all contacts for a user
   */
  public async getContacts(user_wallet_address: string): Promise<Contact[]> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      const { data, error } = await supabase
        .from('user_contacts')
        .select('*')
        .eq('user_wallet_address', user_wallet_address)
        .order('contact_name', { ascending: true });

      if (error) {
        console.error('Failed to get contacts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get contacts:', error);
      return [];
    }
  }

  /**
   * Update a contact
   */
  public async updateContact(
    user_wallet_address: string,
    contact_wallet_address: string,
    updates: Partial<AddContactParams>
  ): Promise<{ success: boolean; contact?: Contact; error?: string }> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      const { data, error } = await supabase
        .from('user_contacts')
        .update(updates)
        .eq('user_wallet_address', user_wallet_address)
        .eq('contact_wallet_address', contact_wallet_address)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        contact: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact',
      };
    }
  }

  /**
   * Remove a contact
   */
  public async removeContact(
    user_wallet_address: string,
    contact_wallet_address: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      const { error } = await supabase
        .from('user_contacts')
        .delete()
        .eq('user_wallet_address', user_wallet_address)
        .eq('contact_wallet_address', contact_wallet_address);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove contact',
      };
    }
  }

  /**
   * Check if a wallet address is in contacts
   */
  public async isContact(
    user_wallet_address: string,
    contact_wallet_address: string
  ): Promise<boolean> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      const { data, error } = await supabase
        .from('user_contacts')
        .select('id')
        .eq('user_wallet_address', user_wallet_address)
        .eq('contact_wallet_address', contact_wallet_address)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Search contacts by name or wallet address
   */
  public async searchContacts(user_wallet_address: string, query: string): Promise<Contact[]> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      const { data, error } = await supabase
        .from('user_contacts')
        .select('*')
        .eq('user_wallet_address', user_wallet_address)
        .or(`contact_name.ilike.%${query}%,contact_wallet_address.ilike.%${query}%`)
        .order('contact_name', { ascending: true });

      if (error) {
        console.error('Failed to search contacts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to search contacts:', error);
      return [];
    }
  }

  /**
   * Get contact by wallet address
   */
  public async getContactByAddress(
    user_wallet_address: string,
    contact_wallet_address: string
  ): Promise<Contact | null> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      const { data, error } = await supabase
        .from('user_contacts')
        .select('*')
        .eq('user_wallet_address', user_wallet_address)
        .eq('contact_wallet_address', contact_wallet_address)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get contact:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time contact updates
   */
  public subscribeToContacts(user_wallet_address: string, callback: (contact: Contact) => void) {
    return supabase
      .channel('user_contacts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_contacts',
          filter: `user_wallet_address.eq.${user_wallet_address}`,
        },
        payload => {
          if (payload.new) {
            callback(payload.new as Contact);
          }
        }
      )
      .subscribe();
  }
}

export const contactsService = ContactsService.getInstance();
