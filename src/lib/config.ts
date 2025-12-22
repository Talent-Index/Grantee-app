// Environment configuration with runtime validation

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  
  // Wallet Configuration
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  
  // Chain Configuration
  chainId: 43113, // Avalanche Fuji Testnet
  chainName: 'Avalanche Fuji',
  
  // USDC Contract on Fuji
  usdcAddress: '0x5425890298aed601595a70AB815c96711a31Bc65' as `0x${string}`,
  
  // Feature flags
  enableDevLogs: import.meta.env.DEV,
} as const;

// Runtime validation
export function validateConfig() {
  const errors: string[] = [];
  
  if (!config.apiBaseUrl) {
    errors.push('VITE_API_BASE_URL is not configured. Set it in your environment.');
  }
  
  if (!config.walletConnectProjectId) {
    errors.push('VITE_WALLETCONNECT_PROJECT_ID is not configured. Get one from cloud.walletconnect.com');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Dev logging helper
export function devLog(action: string, ...args: unknown[]) {
  if (config.enableDevLogs) {
    console.log(`[Grantee] clicked:${action}`, ...args);
  }
}
