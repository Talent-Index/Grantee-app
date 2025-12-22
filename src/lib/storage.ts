import type { AnalysisResult } from './fetchWith402';

const STORAGE_KEYS = {
  UNLOCKED: 'grantee_unlocked',
  PAYER_ADDRESS: 'grantee_payer_address',
  ANALYSIS_HISTORY: 'grantee_analysis_history',
} as const;

export interface AnalysisHistoryItem {
  id: string;
  repoUrl: string;
  timestamp: number;
  result: AnalysisResult['result'];
  settlement: AnalysisResult['settlement'];
}

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
export function getAnalysisHistory(): AnalysisHistoryItem[] {
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
  result: AnalysisResult['result'],
  settlement: AnalysisResult['settlement']
): AnalysisHistoryItem {
  const history = getAnalysisHistory();
  
  const item: AnalysisHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    repoUrl,
    timestamp: Date.now(),
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
export function getHistoryItem(id: string): AnalysisHistoryItem | null {
  const history = getAnalysisHistory();
  return history.find(item => item.id === id) || null;
}

/**
 * Clear all stored data
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.UNLOCKED);
  localStorage.removeItem(STORAGE_KEYS.PAYER_ADDRESS);
  localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
}
