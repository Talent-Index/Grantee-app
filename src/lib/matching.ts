// Grant-Niche matching logic
import { type Grant } from '@/data/grants';
import { NICHES, type BuilderNiche } from '@/data/niches';

// Map niche chain names to grant ecosystem values
const CHAIN_ECOSYSTEM_MAP: Record<string, string[]> = {
  'ethereum': ['ethereum', 'multi-chain'],
  'avalanche': ['avalanche', 'multi-chain'],
  'polygon': ['polygon', 'multi-chain'],
  'solana': ['solana', 'multi-chain'],
  'cosmos': ['cosmos', 'multi-chain'],
  'arbitrum': ['ethereum', 'multi-chain'], // L2s map to ethereum
  'base': ['ethereum', 'multi-chain'],
  'optimism': ['ethereum', 'multi-chain'],
  'multi-chain': ['multi-chain', 'ethereum', 'avalanche', 'polygon', 'solana', 'cosmos'],
  'immutable': ['ethereum', 'multi-chain'],
};

/**
 * Score how well a grant matches a niche.
 * +2 per tag match, +1 per chain match, +1 per language match
 */
export function scoreGrantMatch(niche: BuilderNiche, grant: Grant): number {
  let score = 0;

  // Tag matching (case-insensitive)
  const nicheTags = niche.tags.map(t => t.toLowerCase());
  const grantTags = grant.tags.map(t => t.toLowerCase());
  
  for (const nicheTag of nicheTags) {
    if (grantTags.some(gt => gt.includes(nicheTag) || nicheTag.includes(gt))) {
      score += 2;
    }
  }

  // Category matching (treat category as a tag-like signal)
  if (nicheTags.some(t => t.includes(grant.category.toLowerCase()))) {
    score += 2;
  }

  // Chain/ecosystem matching
  const grantEcosystem = grant.ecosystem.toLowerCase();
  
  for (const chain of niche.recommendedChains) {
    const ecosystems = CHAIN_ECOSYSTEM_MAP[chain.toLowerCase()] || [chain.toLowerCase()];
    if (ecosystems.includes(grantEcosystem)) {
      score += 1;
      break;
    }
  }

  return score;
}

/**
 * Get grants that match a specific niche.
 * A grant matches if it has at least 1 tag match AND (chain match OR multi-chain).
 */
export function matchGrantsForNiche(nicheId: string, grants: Grant[]): Grant[] {
  const niche = NICHES.find(n => n.id === nicheId);
  if (!niche) return [];

  const nicheTags = niche.tags.map(t => t.toLowerCase());

  return grants.filter(grant => {
    const grantTags = grant.tags.map(t => t.toLowerCase());
    const grantEcosystem = grant.ecosystem.toLowerCase();
    const grantCategory = grant.category.toLowerCase();

    // Check tag match (including category as tag)
    const hasTagMatch = nicheTags.some(nt => 
      grantTags.some(gt => gt.includes(nt) || nt.includes(gt)) ||
      grantCategory.includes(nt) ||
      nt.includes(grantCategory)
    );

    // Check chain match
    let hasChainMatch = grantEcosystem === 'multi-chain';
    if (!hasChainMatch) {
      for (const chain of niche.recommendedChains) {
        const ecosystems = CHAIN_ECOSYSTEM_MAP[chain.toLowerCase()] || [chain.toLowerCase()];
        if (ecosystems.includes(grantEcosystem)) {
          hasChainMatch = true;
          break;
        }
      }
    }

    // A grant matches if it has at least 1 tag match AND chain match
    return hasTagMatch && hasChainMatch;
  }).sort((a, b) => {
    // Sort by score descending
    return scoreGrantMatch(niche, b) - scoreGrantMatch(niche, a);
  });
}

/**
 * Get niche by ID
 */
export function getNicheById(nicheId: string): BuilderNiche | undefined {
  return NICHES.find(n => n.id === nicheId);
}
