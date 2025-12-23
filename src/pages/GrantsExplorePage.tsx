import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { GrantOpportunityCard } from '@/components/grants/GrantOpportunityCard';
import { NicheGrid } from '@/components/grants/NicheGrid';
import { GrantFiltersSheet, type GrantFilters } from '@/components/grants/GrantFiltersSheet';
import { 
  useGrantsQuery, 
  searchGrants, 
  filterGrantsByNiche 
} from '@/services/grants/grantsClient';
import { BUILDER_NICHES } from '@/data/niches.seed';
import type { GrantOpportunity } from '@/types/grants';

const DEFAULT_FILTERS: GrantFilters = {
  status: [],
  ecosystems: [],
  tags: [],
  minAmount: undefined,
  maxAmount: undefined,
};

export default function GrantsExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const nicheParam = searchParams.get('niche');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(nicheParam);
  const [filters, setFilters] = useState<GrantFilters>(DEFAULT_FILTERS);

  // Sync niche with URL
  useEffect(() => {
    if (selectedNicheId) {
      setSearchParams({ niche: selectedNicheId });
    } else {
      setSearchParams({});
    }
  }, [selectedNicheId, setSearchParams]);

  // React Query for real-time grants
  const { data: grants = [], isLoading, error, refetch, isFetching } = useGrantsQuery();

  // Get selected niche info
  const selectedNiche = selectedNicheId 
    ? BUILDER_NICHES.find(n => n.id === selectedNicheId) 
    : null;

  // Apply all filters
  const filteredGrants = useMemo(() => {
    let result = [...grants];

    // Search filter
    if (searchQuery.trim()) {
      result = searchGrants(result, searchQuery);
    }

    // Niche filter
    if (selectedNiche) {
      result = filterGrantsByNiche(result, selectedNiche.tags);
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(g => filters.status.includes(g.status));
    }

    // Ecosystem filter
    if (filters.ecosystems.length > 0) {
      result = result.filter(g => filters.ecosystems.includes(g.ecosystem));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter(g => 
        g.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Amount range filter
    if (filters.minAmount !== undefined) {
      result = result.filter(g => 
        g.maxAmountUsd !== undefined && g.maxAmountUsd >= filters.minAmount!
      );
    }
    if (filters.maxAmount !== undefined) {
      result = result.filter(g => 
        g.minAmountUsd !== undefined && g.minAmountUsd <= filters.maxAmount!
      );
    }

    return result;
  }, [grants, searchQuery, selectedNiche, filters]);

  const activeFiltersCount = 
    filters.status.length + 
    filters.ecosystems.length + 
    filters.tags.length +
    (filters.minAmount ? 1 : 0) +
    (filters.maxAmount ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedNicheId(null);
    setFilters(DEFAULT_FILTERS);
  };

  const handleNicheSelect = (nicheId: string | null) => {
    setSelectedNicheId(nicheId);
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-destructive mb-4">Failed to load grants</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Explore Grants
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover funding opportunities from top Web3 ecosystems. 
            Real-time updates ensure you never miss a deadline.
          </p>
        </motion.div>

        {/* Niche Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NicheGrid
            grants={grants}
            selectedNicheId={selectedNicheId}
            onSelectNiche={handleNicheSelect}
          />
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search grants by name, organization, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Button */}
          <GrantFiltersSheet
            grants={grants}
            filters={filters}
            onFiltersChange={setFilters}
            trigger={
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            }
          />

          {/* Refresh */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </motion.div>

        {/* Active Filters Display */}
        {(selectedNiche || activeFiltersCount > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-sm text-muted-foreground">Active:</span>
            
            {selectedNiche && (
              <Badge variant="secondary" className="gap-1">
                {selectedNiche.name}
                <button onClick={() => setSelectedNicheId(null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.status.map(s => (
              <Badge key={s} variant="secondary" className="gap-1">
                {s}
                <button onClick={() => setFilters(f => ({
                  ...f,
                  status: f.status.filter(x => x !== s)
                }))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {filters.ecosystems.map(e => (
              <Badge key={e} variant="secondary" className="gap-1">
                {e}
                <button onClick={() => setFilters(f => ({
                  ...f,
                  ecosystems: f.ecosystems.filter(x => x !== e)
                }))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredGrants.length} of {grants.length} grants
            {isFetching && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating...
              </span>
            )}
          </p>
        </div>

        {/* Grants Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="h-80 rounded-xl bg-card/50 animate-pulse border border-border"
              />
            ))}
          </div>
        ) : filteredGrants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGrants.map((grant, index) => (
              <GrantOpportunityCard 
                key={grant.id} 
                grant={grant} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground mb-4">
              No grants found matching your criteria.
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
