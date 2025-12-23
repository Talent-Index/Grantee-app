import type { RepoAnalysisResult, SettlementResponse, HistoryItem } from './types';

const STORAGE_KEYS = {
  UNLOCKED: 'grantee_unlocked',
  PAYER_ADDRESS: 'grantee_payer_address',
  ANALYSIS_HISTORY: 'grantee_analysis_history',
} as const;

// Re-export HistoryItem for external use
export type { HistoryItem };

/**
 * Check if grants are unlocked
 */
export function isGrantsUnlocked(): boolean {
  return localStorage.getItem(STORAGE_KEYS.UNLOCKED) === 'true';
}

/**
 * Get payer address
 */
export function getPayerAddress(): string | null {
  return localStorage.getItem(STORAGE_KEYS.PAYER_ADDRESS);
}

/**
 * Unlock grants after successful payment
 */
export function unlockGrants(payerAddress: string): void {
  localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true');
  localStorage.setItem(STORAGE_KEYS.PAYER_ADDRESS, payerAddress);
}

/**
 * Get analysis history
 */
export function getAnalysisHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Add analysis to history
 */
export function addToHistory(
  repoUrl: string,
  result: RepoAnalysisResult,
  settlement?: SettlementResponse,
  depth: 'light' | 'full' = 'light',
  chainHint: string = 'avalanche-fuji'
): HistoryItem {
  const history = getAnalysisHistory();
  
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    repoUrl,
    timestamp: Date.now(),
    depth,
    chainHint,
    result,
    settlement,
  };
  
  history.unshift(item); // Add to beginning
  
  // Keep only last 50 items
  if (history.length > 50) {
    history.pop();
  }
  
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(history));
  
  return item;
}

/**
 * Get single history item by ID
 */
export function getHistoryItem(id: string): HistoryItem | null {
  const history = getAnalysisHistory();
  return history.find(item => item.id === id) || null;
}

/**
 * Delete a history item by ID
 */
export function deleteHistoryItem(id: string): void {
  const history = getAnalysisHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(filtered));
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
}

/**
 * Clear all stored data
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.UNLOCKED);
  localStorage.removeItem(STORAGE_KEYS.PAYER_ADDRESS);
  localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
}
