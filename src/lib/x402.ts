import { type WalletClient, parseUnits, keccak256, encodePacked, toHex } from 'viem';
import type { X402PaymentRequirement, X402PaymentPayload } from './types';
import { devLog, getDebugMode } from './config';

/**
 * Parse amount from x402 requirement safely
 * Handles both base units (string integer) and decimal format
 */
export function parseAmountSafe(amountRaw: string | undefined, decimals: number = 6): bigint {
  if (!amountRaw) {
    throw new Error('Payment requirement missing amount');
  }
  
  // If it looks like base units (no decimal), use BigInt directly
  if (/^\d+$/.test(amountRaw)) {
    return BigInt(amountRaw);
  }
  
  // Otherwise parse as decimal
  try {
    return parseUnits(amountRaw, decimals);
  } catch (err) {
    throw new Error(`Invalid amount format: ${amountRaw}`);
  }
}

/**
 * Extract chain ID from network string
 * Supports: avalanche-fuji, eip155:43113, etc.
 */
export function parseChainId(network: string): number {
  if (network === 'avalanche-fuji' || network === 'fuji') {
    return 43113;
  }
  
  // Handle CAIP-2 format: eip155:43113
  const caip2Match = network.match(/^eip155:(\d+)$/);
  if (caip2Match) {
    return parseInt(caip2Match[1], 10);
  }
  
  // Default to Avalanche Fuji
  return 43113;
}

/**
 * Create an EIP-3009 TransferWithAuthorization signature for x402 payment
 */
export async function createPaymentAuthorization(
  walletClient: WalletClient,
  requirement: X402PaymentRequirement,
  fromAddress: `0x${string}`
): Promise<X402PaymentPayload> {
  const debug = getDebugMode();
  
  if (debug) {
    console.log('[x402] Creating payment authorization', { requirement, fromAddress });
  }
  devLog('x402-create-auth', { requirement, fromAddress });
  
  // Extract and validate amount
  const amountRaw = requirement.amount ?? requirement.maxAmountRequired;
  if (!amountRaw) {
    throw new Error('Payment requirement missing amount. Check backend response.');
  }
  
  const value = parseAmountSafe(amountRaw, 6);
  const toAddress = requirement.payTo as `0x${string}`;
  const assetAddress = requirement.asset as `0x${string}`;
  const chainId = parseChainId(requirement.network);
  
  // Generate random 32-byte nonce
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const nonce = ('0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;
  
  // Set validity window
  const now = Math.floor(Date.now() / 1000);
  const validAfter = 0; // Valid immediately
  const validBefore = now + (requirement.maxTimeoutSeconds ?? 600);
  
  // Build domain from requirement.extra if available
  const domain = {
    name: requirement.extra?.name ?? 'USDC',
    version: requirement.extra?.version ?? '2',
    chainId: BigInt(chainId),
    verifyingContract: assetAddress,
  };
  
  // Build message (TransferWithAuthorization)
  const message = {
    from: fromAddress,
    to: toAddress,
    value: value,
    validAfter: BigInt(validAfter),
    validBefore: BigInt(validBefore),
    nonce: nonce,
  };
  
  // EIP-712 types
  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  } as const;
  
  if (debug) {
    console.log('[x402] Signing typed data', { domain, message, types });
  }
  devLog('x402-signing', { domain, message });
  
  // Sign typed data
  const signature = await walletClient.signTypedData({
    account: fromAddress,
    domain,
    types,
    primaryType: 'TransferWithAuthorization',
    message,
  });
  
  if (debug) {
    console.log('[x402] Signature obtained', { signature: signature.slice(0, 20) + '...' });
  }
  devLog('x402-signed', { signature: signature.slice(0, 20) + '...' });
  
  // Build x402 payment payload matching backend expectations
  const paymentPayload: X402PaymentPayload = {
    x402Version: 2,
    scheme: requirement.scheme ?? 'exact',
    network: requirement.network,
    payload: {
      signature,
      authorization: {
        from: fromAddress,
        to: toAddress,
        value: value.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce: nonce,
      },
    },
    // Include accepted requirement info for backend
    accepted: {
      scheme: requirement.scheme ?? 'exact',
      network: requirement.network,
      asset: requirement.asset,
      payTo: requirement.payTo,
      amount: value.toString(),
      maxTimeoutSeconds: requirement.maxTimeoutSeconds ?? 600,
      extra: requirement.extra ?? {},
    },
  };
  
  if (debug) {
    console.log('[x402] Payment payload built', paymentPayload);
  }
  
  return paymentPayload;
}

/**
 * Format amount for display
 */
export function formatAmount(amountRaw: string | undefined, decimals: number = 6): string {
  if (!amountRaw) return '$0.00';
  
  try {
    // If base units, convert to decimal
    if (/^\d+$/.test(amountRaw)) {
      const value = BigInt(amountRaw);
      const divisor = BigInt(10 ** decimals);
      const whole = value / divisor;
      const fraction = value % divisor;
      const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
      return `$${whole}.${fractionStr}`;
    }
    
    // Already decimal
    const amount = parseFloat(amountRaw);
    return `$${amount.toFixed(2)}`;
  } catch {
    return '$0.00';
  }
}

/**
 * Format price for display (alias for backward compatibility)
 */
export function formatPrice(price: string | undefined, currency: string = 'USDC'): string {
  return `${formatAmount(price)} ${currency}`;
}

/**
 * Get network display name
 */
export function getNetworkName(network: string): string {
  const networks: Record<string, string> = {
    'avalanche-fuji': 'Avalanche Fuji',
    'fuji': 'Avalanche Fuji',
    'avalanche': 'Avalanche',
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'eip155:43113': 'Avalanche Fuji',
  };
  return networks[network.toLowerCase()] || network;
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
