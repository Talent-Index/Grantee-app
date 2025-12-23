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
      
      // Parse payment requirement from response with source tracking
      const { requirement: paymentRequirement, source } = await parsePaymentRequirement(response);
      devLog('payment-required', { requirement: paymentRequirement, source });
      
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
      
      devLog('payment-signed', { hasPayload: !!paymentPayload, source });
      
      // Retry with payment payload in x-402-payment header only
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
        const errorText = await retryResponse.text();
        let errorData: Record<string, unknown> = {};
        try { errorData = JSON.parse(errorText); } catch { /* ignore */ }
        
        throw new FetchWith402Error(
          errorData.error as string || `Settlement failed: HTTP ${retryResponse.status}`,
          'SETTLEMENT_FAILED',
          { status: retryResponse.status, body: errorText, parsed: errorData }
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
 * Priority: payment-required > x402-payment-required > x-402-payment-required > JSON body
 */
async function parsePaymentRequirement(response: Response): Promise<{ requirement: PaymentRequirement; source: string }> {
  // Header priority order per x402 spec
  const headerNames = [
    'payment-required',
    'x402-payment-required', 
    'x-402-payment-required',
  ];
  
  for (const headerName of headerNames) {
    const headerValue = response.headers.get(headerName);
    if (headerValue) {
      try {
        const parsed = JSON.parse(headerValue);
        // Handle x402 v2 format with accepts array
        const requirement = parsed.accepts?.[0] ?? parsed;
        return { requirement, source: `header:${headerName}` };
      } catch {
        // Continue to next header
      }
    }
  }
  
  // Fallback to JSON body
  try {
    const body = await response.json();
    if (body.accepts?.[0]) {
      return { requirement: body.accepts[0], source: 'body:accepts[0]' };
    }
    if (body.paymentRequirement) {
      return { requirement: body.paymentRequirement, source: 'body:paymentRequirement' };
    }
    return { requirement: body, source: 'body:root' };
  } catch {
    throw new FetchWith402Error(
      'Unable to parse payment requirement from 402 response. Checked headers: ' + headerNames.join(', ') + ' and JSON body.',
      'API_ERROR'
    );
  }
}
