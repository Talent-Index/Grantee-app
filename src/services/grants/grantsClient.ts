import { useQuery } from '@tanstack/react-query';
import type { GrantOpportunity } from '@/types/grants';
import { GRANTS_SEED } from '@/data/grants.seed';
import { API_BASE_URL } from '@/lib/config';

const GRANTS_QUERY_KEY = ['grants'];

/**
 * Fetch grants from API or fallback to seed data
 */
async function fetchGrants(): Promise<GrantOpportunity[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/grants`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Normalize API response to GrantOpportunity[]
      if (Array.isArray(data)) {
        return data as GrantOpportunity[];
      }
      if (data.grants && Array.isArray(data.grants)) {
        return data.grants as GrantOpportunity[];
      }
    }
    
    // API returned non-OK status, fallback to seed
    console.log('[Grants] API unavailable, using seed data');
    return GRANTS_SEED;
  } catch (error) {
    // Network error or API not available, fallback to seed
    console.log('[Grants] Fallback to seed data:', error);
    return GRANTS_SEED;
  }
}

/**
 * React Query hook for grants with polling and caching
 */
export function useGrantsQuery() {
  return useQuery({
    queryKey: GRANTS_QUERY_KEY,
    queryFn: fetchGrants,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Poll every 60 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Get open grants count for a specific niche
 */
export function countOpenGrantsForNiche(
  grants: GrantOpportunity[],
  nicheTags: string[]
): number {
  const normalizedNicheTags = nicheTags.map(t => t.toLowerCase());
  
  return grants.filter(grant => {
    if (grant.status === 'closed') return false;
    
    const grantTags = grant.tags.map(t => t.toLowerCase());
    return normalizedNicheTags.some(nt => 
      grantTags.some(gt => gt.includes(nt) || nt.includes(gt))
    );
  }).length;
}

/**
 * Filter grants by niche
 */
export function filterGrantsByNiche(
  grants: GrantOpportunity[],
  nicheTags: string[]
): GrantOpportunity[] {
  const normalizedNicheTags = nicheTags.map(t => t.toLowerCase());
  
  return grants.filter(grant => {
    const grantTags = grant.tags.map(t => t.toLowerCase());
    return normalizedNicheTags.some(nt => 
      grantTags.some(gt => gt.includes(nt) || nt.includes(gt))
    );
  });
}

/**
 * Search grants by query
 */
export function searchGrants(
  grants: GrantOpportunity[],
  query: string
): GrantOpportunity[] {
  if (!query.trim()) return grants;
  
  const q = query.toLowerCase();
  return grants.filter(grant => 
    grant.name.toLowerCase().includes(q) ||
    grant.organization.toLowerCase().includes(q) ||
    grant.ecosystem.toLowerCase().includes(q) ||
    grant.shortDescription.toLowerCase().includes(q) ||
    grant.tags.some(tag => tag.toLowerCase().includes(q))
  );
}
