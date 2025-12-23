// Grant types for the Explore Grants experience

export type GrantStatus = 'open' | 'rolling' | 'closed';

export interface GrantOpportunity {
  id: string;
  name: string;
  organization: string;
  ecosystem: string;
  chains: string[];
  tags: string[];
  status: GrantStatus;
  minAmountUsd?: number;
  maxAmountUsd?: number;
  deadline?: string;
  isRolling?: boolean;
  shortDescription: string;
  applyUrl: string;
  detailsUrl?: string;
  lastUpdated?: string;
}

export interface BuilderNiche {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
}

// Tag synonyms for niche matching
export const NICHE_TAG_SYNONYMS: Record<string, string[]> = {
  'Infra / Tooling': ['Infrastructure', 'DevTools', 'Tooling', 'SDKs', 'Developer', 'Tools'],
  'AI + Crypto': ['AI', 'Agents', 'Oracles', 'Data', 'ML', 'Machine Learning'],
  'DeFi': ['DeFi', 'DEX', 'Lending', 'AMM', 'Yield', 'Liquidity'],
  'Fintech': ['Payments', 'Stablecoin', 'Fintech', 'Banking', 'Commerce'],
  'Gaming': ['Gaming', 'GameFi', 'Metaverse', 'Play-to-Earn', 'NFT'],
  'Social': ['Social', 'Consumer', 'Creator', 'Community', 'Identity'],
  'RWA / Enterprise': ['RWA', 'Enterprise', 'Tokenization', 'Real World', 'Compliance'],
  'Public Goods': ['Public Goods', 'Open Source', 'Retroactive', 'Grants', 'Community'],
};

// Format amount for display
export function formatGrantAmount(min?: number, max?: number): string {
  if (!min && !max) return 'Variable';
  
  const formatK = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${n}`;
  };
  
  if (min && max) return `${formatK(min)} - ${formatK(max)}`;
  if (min) return `From ${formatK(min)}`;
  if (max) return `Up to ${formatK(max)}`;
  return 'Variable';
}
