import { RequestStatus, RequestType } from '../constants/enums';

export interface PaymentRequest {
  id: string;
  type: RequestType;
  amount: number; // in SOL
  from: string; // requester's wallet address
  fromName?: string; // requester's display name
  to: string; // recipient's wallet address
  toName?: string; // recipient's display name
  message?: string;
  status: RequestStatus;
  createdAt: number;
  expiresAt?: number;
  acceptedAt?: number;
  declinedAt?: number;
}

export interface CreateRequestParams {
  amount: number;
  to: string; // recipient's wallet address
  toName?: string;
  message?: string;
  expiresInHours?: number; // default 24 hours
}

export interface RequestResponse {
  success: boolean;
  request?: PaymentRequest;
  error?: string;
}

class RequestService {
  private static instance: RequestService;
  private requests: Map<string, PaymentRequest> = new Map();

  private constructor() {
    // Load requests from storage on initialization
    this.loadRequests();
  }

  public static getInstance(): RequestService {
    if (!RequestService.instance) {
      RequestService.instance = new RequestService();
    }
    return RequestService.instance;
  }

  /**
   * Create a new payment request
   */
  public createRequest(
    from: string,
    fromName: string,
    params: CreateRequestParams
  ): RequestResponse {
    try {
      const requestId = this.generateRequestId();
      const now = Date.now();
      const expiresAt = params.expiresInHours
        ? now + params.expiresInHours * 60 * 60 * 1000
        : now + 24 * 60 * 60 * 1000; // Default 24 hours

      const request: PaymentRequest = {
        id: requestId,
        type: RequestType.PAYMENT_REQUEST,
        amount: params.amount,
        from,
        fromName,
        to: params.to,
        toName: params.toName,
        message: params.message,
        status: RequestStatus.PENDING,
        createdAt: now,
        expiresAt,
      };

      this.requests.set(requestId, request);
      this.saveRequests();

      return {
        success: true,
        request,
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
  public acceptRequest(requestId: string): RequestResponse {
    try {
      const request = this.requests.get(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Request not found',
        };
      }

      if (request.status !== RequestStatus.PENDING) {
        return {
          success: false,
          error: 'Request is no longer pending',
        };
      }

      if (request.expiresAt && Date.now() > request.expiresAt) {
        request.status = RequestStatus.EXPIRED;
        this.saveRequests();
        return {
          success: false,
          error: 'Request has expired',
        };
      }

      request.status = RequestStatus.ACCEPTED;
      request.acceptedAt = Date.now();
      this.saveRequests();

      return {
        success: true,
        request,
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
  public declineRequest(requestId: string): RequestResponse {
    try {
      const request = this.requests.get(requestId);
      if (!request) {
        return {
          success: false,
          error: 'Request not found',
        };
      }

      if (request.status !== RequestStatus.PENDING) {
        return {
          success: false,
          error: 'Request is no longer pending',
        };
      }

      request.status = RequestStatus.DECLINED;
      request.declinedAt = Date.now();
      this.saveRequests();

      return {
        success: true,
        request,
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
  public getRequestsForWallet(walletAddress: string): PaymentRequest[] {
    const allRequests = Array.from(this.requests.values());
    return allRequests.filter(
      request => request.from === walletAddress || request.to === walletAddress
    );
  }

  /**
   * Get pending requests for a wallet address
   */
  public getPendingRequests(walletAddress: string): PaymentRequest[] {
    return this.getRequestsForWallet(walletAddress).filter(
      request => request.status === RequestStatus.PENDING
    );
  }

  /**
   * Get incoming requests (requests sent TO this wallet)
   */
  public getIncomingRequests(walletAddress: string): PaymentRequest[] {
    return this.getRequestsForWallet(walletAddress).filter(request => request.to === walletAddress);
  }

  /**
   * Get outgoing requests (requests sent FROM this wallet)
   */
  public getOutgoingRequests(walletAddress: string): PaymentRequest[] {
    return this.getRequestsForWallet(walletAddress).filter(
      request => request.from === walletAddress
    );
  }

  /**
   * Get a specific request by ID
   */
  public getRequest(requestId: string): PaymentRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Clean up expired requests
   */
  public cleanupExpiredRequests(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [, request] of this.requests.entries()) {
      if (
        request.status === RequestStatus.PENDING &&
        request.expiresAt &&
        now > request.expiresAt
      ) {
        request.status = RequestStatus.EXPIRED;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveRequests();
    }
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save requests to storage
   */
  private saveRequests(): void {
    try {
      const requestsArray = Array.from(this.requests.values());
      // In a real app, you'd save to secure storage or a database
      // For now, we'll use a simple in-memory approach
      console.log('Saving requests:', requestsArray.length);
    } catch (error) {
      console.error('Failed to save requests:', error);
    }
  }

  /**
   * Load requests from storage
   */
  private loadRequests(): void {
    try {
      // In a real app, you'd load from secure storage or a database
      // For now, we'll start with an empty map
      console.log('Loading requests from storage');
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  }
}

export const requestService = RequestService.getInstance();
