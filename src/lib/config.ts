// Environment configuration with runtime validation

const DEBUG_KEY = 'grantee_debug';

export const config = {
  // API Configuration - default to hosted version
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://grantee.onrender.com',
  
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

// Debug mode management
export function getDebugMode(): boolean {
  try {
    return localStorage.getItem(DEBUG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDebugMode(enabled: boolean): void {
  try {
    localStorage.setItem(DEBUG_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore
  }
}

// Runtime validation
export function validateConfig() {
  const errors: string[] = [];
  
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
  if (config.enableDevLogs || getDebugMode()) {
    console.log(`[Grantee] ${action}`, ...args);
  }
}
