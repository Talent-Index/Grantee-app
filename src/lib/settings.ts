// Settings storage utilities

const SETTINGS_KEY = 'grantee_settings';

export interface AppSettings {
  apiBaseUrl: string;
  defaultChainHint: string;
  defaultDepth: 'light' | 'full';
}

const DEFAULT_SETTINGS: AppSettings = {
  apiBaseUrl: 'https://grantee.onrender.com',
  defaultChainHint: 'avalanche-fuji',
  defaultDepth: 'light',
};

export const CHAIN_HINTS = [
  { value: 'avalanche-fuji', label: 'Avalanche Fuji (Testnet)' },
  { value: 'avalanche', label: 'Avalanche (Mainnet)' },
  { value: 'evm', label: 'EVM (Generic)' },
  { value: 'eip155:43113', label: 'EIP-155: 43113' },
] as const;

export const DEPTH_OPTIONS = [
  { value: 'light', label: 'Light', description: 'Quick analysis with essential metrics' },
  { value: 'full', label: 'Full', description: 'Comprehensive analysis with all details' },
] as const;

/**
 * Get settings from localStorage
 */
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Reset to default settings
 */
export function resetSettings(): AppSettings {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}

/**
 * Get the API base URL
 */
export function getApiBaseUrl(): string {
  return getSettings().apiBaseUrl;
}
