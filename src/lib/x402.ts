import { type WalletClient, parseUnits, keccak256, encodePacked, toHex } from 'viem';
import type { PaymentRequirement, PaymentPayload } from './fetchWith402';
import { config, devLog } from './config';

// EIP-3009 Domain separator for USDC on Avalanche Fuji
const DOMAIN_SEPARATOR_TYPEHASH = keccak256(
  encodePacked(
    ['string'],
    ['EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)']
  )
);

const TRANSFER_WITH_AUTHORIZATION_TYPEHASH = keccak256(
  encodePacked(
    ['string'],
    ['TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)']
  )
);

// USDC token details
const USDC_NAME = 'USD Coin';
const USDC_VERSION = '2';

/**
 * Create an EIP-3009 authorization signature for USDC transfer
 */
export async function createPaymentAuthorization(
  walletClient: WalletClient,
  requirement: PaymentRequirement,
  fromAddress: `0x${string}`
): Promise<PaymentPayload> {
  devLog('x402-create-auth', { requirement, fromAddress });
  
  const toAddress = requirement.payTo as `0x${string}`;
  const value = parseUnits(requirement.price, 6); // USDC has 6 decimals
  
  // Generate nonce
  const nonce = requirement.nonce 
    ? (requirement.nonce as `0x${string}`)
    : keccak256(encodePacked(['address', 'uint256'], [fromAddress, BigInt(Date.now())]));
  
  // Set validity window
  const now = Math.floor(Date.now() / 1000);
  const validAfter = now - 60; // Valid from 1 minute ago
  const validBefore = now + 3600; // Valid for 1 hour
  
  // Build the domain
  const domain = {
    name: USDC_NAME,
    version: USDC_VERSION,
    chainId: BigInt(config.chainId),
    verifyingContract: config.usdcAddress,
  };
  
  // Build the message (TransferWithAuthorization)
  const message = {
    from: fromAddress,
    to: toAddress,
    value: value,
    validAfter: BigInt(validAfter),
    validBefore: BigInt(validBefore),
    nonce: nonce,
  };
  
  // Type definitions for EIP-712
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
  
  devLog('x402-signing', { domain, message });
  
  // Sign typed data
  const signature = await walletClient.signTypedData({
    account: fromAddress,
    domain,
    types,
    primaryType: 'TransferWithAuthorization',
    message,
  });
  
  devLog('x402-signed', { signature: signature.slice(0, 20) + '...' });
  
  // Build payment payload
  const paymentPayload: PaymentPayload = {
    x402Version: 2,
    scheme: 'eip3009',
    network: 'avalanche-fuji',
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
  };
  
  return paymentPayload;
}

/**
 * Format price for display
 */
export function formatPrice(price: string, currency: string = 'USDC'): string {
  const amount = parseFloat(price);
  return `$${amount.toFixed(2)} ${currency}`;
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
