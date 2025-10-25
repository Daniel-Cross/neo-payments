import { supabase } from './supabase';
import { RequestStatus, RequestType } from '../constants/enums';

export interface PaymentRequest {
  id: string;
  type: RequestType;
  amount: number; // in SOL
  requester_wallet_address: string;
  requester_name?: string;
  recipient_wallet_address: string;
  recipient_name?: string;
  message?: string;
  status: RequestStatus;
  created_at: string;
  expires_at?: string;
  accepted_at?: string;
  declined_at?: string;
  transaction_signature?: string;
}

export interface CreateRequestParams {
  amount: number;
  recipient_wallet_address: string;
  recipient_name?: string;
  message?: string;
  expires_in_hours?: number; // default 24 hours
}

export interface RequestResponse {
  success: boolean;
  request?: PaymentRequest;
  error?: string;
}

export interface Contact {
  id: string;
  user_wallet_address: string;
  contact_wallet_address: string;
  contact_name?: string;
  contact_avatar_url?: string;
  created_at: string;
  updated_at: string;
}

class SupabaseRequestService {
  private static instance: SupabaseRequestService;

  private constructor() {}

  public static getInstance(): SupabaseRequestService {
    if (!SupabaseRequestService.instance) {
      SupabaseRequestService.instance = new SupabaseRequestService();
    }
    return SupabaseRequestService.instance;
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
   * Create a new payment request (only to contacts)
   */
  public async createRequest(
    requester_wallet_address: string,
    requester_name: string,
    params: CreateRequestParams
  ): Promise<RequestResponse> {
    try {
      await this.setCurrentWalletAddress(requester_wallet_address);

      // Check if recipient is in contacts
      const { data: contact, error: contactError } = await supabase
        .from('user_contacts')
        .select('*')
        .eq('user_wallet_address', requester_wallet_address)
        .eq('contact_wallet_address', params.recipient_wallet_address)
        .single();

      if (contactError || !contact) {
        return {
          success: false,
          error: 'Recipient must be in your contacts to send a payment request',
        };
      }

      const now = new Date();
      const expires_at = params.expires_in_hours
        ? new Date(now.getTime() + params.expires_in_hours * 60 * 60 * 1000)
        : new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24 hours

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          requester_wallet_address,
          requester_name,
          recipient_wallet_address: params.recipient_wallet_address,
          recipient_name: params.recipient_name || contact.contact_name,
          amount: params.amount,
          message: params.message,
          expires_at: expires_at.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Send push notification to recipient
      await this.sendRequestNotification(data);

      return {
        success: true,
        request: this.mapSupabaseToPaymentRequest(data),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create request',
      };
    }
  }

  /**
   * Accept a payment request
   */
  public async acceptRequest(requestId: string, walletAddress: string): Promise<RequestResponse> {
    try {
      await this.setCurrentWalletAddress(walletAddress);

      const { data, error } = await supabase
        .from('payment_requests')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('recipient_wallet_address', walletAddress)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Request not found or already processed',
        };
      }

      return {
        success: true,
        request: this.mapSupabaseToPaymentRequest(data),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept request',
      };
    }
  }

  /**
   * Decline a payment request
   */
  public async declineRequest(requestId: string, walletAddress: string): Promise<RequestResponse> {
    try {
      await this.setCurrentWalletAddress(walletAddress);

      const { data, error } = await supabase
        .from('payment_requests')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('recipient_wallet_address', walletAddress)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Request not found or already processed',
        };
      }

      return {
        success: true,
        request: this.mapSupabaseToPaymentRequest(data),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to decline request',
      };
    }
  }

  /**
   * Get all requests for a wallet address
   */
  public async getRequestsForWallet(walletAddress: string): Promise<PaymentRequest[]> {
    try {
      await this.setCurrentWalletAddress(walletAddress);

      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .or(
          `requester_wallet_address.eq.${walletAddress},recipient_wallet_address.eq.${walletAddress}`
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get requests:', error);
        return [];
      }

      return data.map(this.mapSupabaseToPaymentRequest);
    } catch (error) {
      console.error('Failed to get requests:', error);
      return [];
    }
  }

  /**
   * Get incoming requests for a wallet address
   */
  public async getIncomingRequests(walletAddress: string): Promise<PaymentRequest[]> {
    try {
      await this.setCurrentWalletAddress(walletAddress);

      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('recipient_wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get incoming requests:', error);
        return [];
      }

      return data.map(this.mapSupabaseToPaymentRequest);
    } catch (error) {
      console.error('Failed to get incoming requests:', error);
      return [];
    }
  }

  /**
   * Get outgoing requests for a wallet address
   */
  public async getOutgoingRequests(walletAddress: string): Promise<PaymentRequest[]> {
    try {
      await this.setCurrentWalletAddress(walletAddress);

      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('requester_wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get outgoing requests:', error);
        return [];
      }

      return data.map(this.mapSupabaseToPaymentRequest);
    } catch (error) {
      console.error('Failed to get outgoing requests:', error);
      return [];
    }
  }

  /**
   * Get a specific request by ID
   */
  public async getRequest(
    requestId: string,
    walletAddress: string
  ): Promise<PaymentRequest | null> {
    try {
      await this.setCurrentWalletAddress(walletAddress);

      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapSupabaseToPaymentRequest(data);
    } catch (error) {
      console.error('Failed to get request:', error);
      return null;
    }
  }

  /**
   * Add a contact
   */
  public async addContact(
    user_wallet_address: string,
    contact_wallet_address: string,
    contact_name?: string,
    contact_avatar_url?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.setCurrentWalletAddress(user_wallet_address);

      const { error } = await supabase.from('user_contacts').insert({
        user_wallet_address,
        contact_wallet_address,
        contact_name,
        contact_avatar_url,
      });

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
        error: error instanceof Error ? error.message : 'Failed to add contact',
      };
    }
  }

  /**
   * Get user's contacts
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

      return data;
    } catch (error) {
      console.error('Failed to get contacts:', error);
      return [];
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
   * Subscribe to real-time request updates
   */
  public subscribeToRequests(walletAddress: string, callback: (request: PaymentRequest) => void) {
    return supabase
      .channel('payment_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_requests',
          filter: `or(requester_wallet_address.eq.${walletAddress},recipient_wallet_address.eq.${walletAddress})`,
        },
        payload => {
          if (payload.new) {
            callback(this.mapSupabaseToPaymentRequest(payload.new as any));
          }
        }
      )
      .subscribe();
  }

  /**
   * Send push notification for new request
   */
  private async sendRequestNotification(request: any): Promise<void> {
    try {
      // Get recipient's push tokens
      const { data: tokens } = await supabase
        .from('push_notification_tokens')
        .select('device_token, platform')
        .eq('wallet_address', request.recipient_wallet_address)
        .eq('is_active', true);

      if (!tokens || tokens.length === 0) {
        console.log('No push tokens found for recipient');
        return;
      }

      // Send push notification via your push service (Expo, FCM, etc.)
      // This would integrate with your push notification service
      console.log('Sending push notification for request:', request.id);

      // Example with Expo Push Notifications:
      // await sendPushNotification({
      //   to: tokens.map(t => t.device_token),
      //   title: 'New Payment Request',
      //   body: `${request.requester_name || 'Someone'} requested ${request.amount} SOL`,
      //   data: { requestId: request.id, type: 'payment_request' }
      // });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Map Supabase data to PaymentRequest interface
   */
  private mapSupabaseToPaymentRequest(data: any): PaymentRequest {
    return {
      id: data.id,
      type: RequestType.PAYMENT_REQUEST,
      amount: parseFloat(data.amount),
      requester_wallet_address: data.requester_wallet_address,
      requester_name: data.requester_name,
      recipient_wallet_address: data.recipient_wallet_address,
      recipient_name: data.recipient_name,
      message: data.message,
      status: data.status as RequestStatus,
      created_at: data.created_at,
      expires_at: data.expires_at,
      accepted_at: data.accepted_at,
      declined_at: data.declined_at,
      transaction_signature: data.transaction_signature,
    };
  }
}

export const supabaseRequestService = SupabaseRequestService.getInstance();
