import { config, devLog } from './config';

// Types for x402 payment flow
export interface PaymentRequirement {
  price: string;
  currency: string;
  network: string;
  payTo: string;
  validUntil: string;
  nonce?: string;
  maxAmountRequired?: string;
  resource?: string;
  description?: string;
  mimeType?: string;
  outputSchema?: unknown;
  extra?: Record<string, unknown>;
}

export interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

export interface SettlementResponse {
  success: boolean;
  transaction?: {
    hash: string;
    network: string;
  };
  error?: string;
  payer?: string;
  receiver?: string;
}

export interface AnalysisResult {
  settlement: SettlementResponse;
  result: {
    repo: string;
    stars: number;
    forks: number;
    issues: {
      open: number;
      closed: number;
    };
    languages: Record<string, number>;
    activity: {
      lastCommit: string;
      commits30d: number;
    };
    codeQuality: {
      score: number;
      notes: string[];
    };
    grantFit: {
      signals: string[];
      recommendations: string[];
    };
  };
}

export type FetchStatus = 
  | 'idle'
  | 'validating'
  | 'requesting'
  | 'payment_required'
  | 'signing'
  | 'settling'
  | 'retrying'
  | 'success'
  | 'error';

export interface FetchWith402Options {
  onStatusChange?: (status: FetchStatus) => void;
  onPaymentRequired?: (requirement: PaymentRequirement) => Promise<PaymentPayload | null>;
}

export class FetchWith402Error extends Error {
  constructor(
    message: string,
    public code: 'CONFIG_MISSING' | 'CORS_BLOCKED' | 'NETWORK_ERROR' | 'PAYMENT_REJECTED' | 'SETTLEMENT_FAILED' | 'API_ERROR' | 'UNKNOWN',
    public details?: unknown
  ) {
    super(message);
    this.name = 'FetchWith402Error';
  }
}

/**
 * Fetches a resource with x402 payment retry logic
 */
export async function fetchWith402<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  paymentOptions: FetchWith402Options = {}
): Promise<T> {
  const { onStatusChange, onPaymentRequired } = paymentOptions;
  
  // Validate config
  if (!config.apiBaseUrl) {
    throw new FetchWith402Error(
      'API base URL is not configured. Please set VITE_API_BASE_URL in your environment.',
      'CONFIG_MISSING'
    );
  }
  
  const url = `${config.apiBaseUrl}${endpoint}`;
  devLog('fetch-start', { url, method: options.method || 'GET' });
  
  onStatusChange?.('requesting');
  
  try {
    // First request
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    devLog('fetch-response', { status: response.status });
    
    // Handle 402 Payment Required
    if (response.status === 402) {
      onStatusChange?.('payment_required');
      
      // Parse payment requirement from response
      const paymentRequirement = await parsePaymentRequirement(response);
      devLog('payment-required', paymentRequirement);
      
      if (!onPaymentRequired) {
        throw new FetchWith402Error(
          'Payment required but no payment handler provided',
          'PAYMENT_REJECTED'
        );
      }
      
      // Request payment from user
      onStatusChange?.('signing');
      const paymentPayload = await onPaymentRequired(paymentRequirement);
      
      if (!paymentPayload) {
        throw new FetchWith402Error(
          'Payment was rejected or cancelled by user',
          'PAYMENT_REJECTED'
        );
      }
      
      devLog('payment-signed', { hasPayload: !!paymentPayload });
      
      // Retry with payment payload
      onStatusChange?.('settling');
      
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-402-payment': JSON.stringify(paymentPayload),
          ...options.headers,
        },
      });
      
      onStatusChange?.('retrying');
      
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new FetchWith402Error(
          errorData.error || `Settlement failed with status ${retryResponse.status}`,
          'SETTLEMENT_FAILED',
          errorData
        );
      }
      
      onStatusChange?.('success');
      return await retryResponse.json();
    }
    
    // Handle other error statuses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new FetchWith402Error(
        errorData.error || `API error: ${response.status}`,
        'API_ERROR',
        errorData
      );
    }
    
    onStatusChange?.('success');
    return await response.json();
    
  } catch (error) {
    if (error instanceof FetchWith402Error) {
      onStatusChange?.('error');
      throw error;
    }
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      onStatusChange?.('error');
      throw new FetchWith402Error(
        'Network error: Unable to reach the API. This may be a CORS issue or the server is unavailable.',
        'NETWORK_ERROR',
        error
      );
    }
    
    onStatusChange?.('error');
    throw new FetchWith402Error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      'UNKNOWN',
      error
    );
  }
}

/**
 * Parse payment requirement from 402 response
 */
async function parsePaymentRequirement(response: Response): Promise<PaymentRequirement> {
  // Try to get from X-Payment header first
  const paymentHeader = response.headers.get('X-Payment');
  if (paymentHeader) {
    try {
      return JSON.parse(paymentHeader);
    } catch {
      // Fall through to body parsing
    }
  }
  
  // Try to get from response body
  try {
    const body = await response.json();
    if (body.paymentRequirement) {
      return body.paymentRequirement;
    }
    if (body.accepts) {
      // Handle x402 v2 format
      return body.accepts[0] || body;
    }
    return body;
  } catch {
    throw new FetchWith402Error(
      'Unable to parse payment requirement from 402 response',
      'API_ERROR'
    );
  }
}
