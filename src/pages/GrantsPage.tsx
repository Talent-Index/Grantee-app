import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Lock, 
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { GrantCard } from '@/components/GrantCard';
import { grantsData, getRecommendedGrants, type Grant } from '@/data/grants';
import { isGrantsUnlocked, getAnalysisHistory } from '@/lib/storage';
import { devLog } from '@/lib/config';

type FilterCategory = 'all' | Grant['category'];
type FilterEcosystem = 'all' | Grant['ecosystem'];
type FilterGrantType = 'all' | Grant['grantType'];

export default function GrantsPage() {
  const unlocked = isGrantsUnlocked();
  const history = getAnalysisHistory();
  
  // Get recommended grants based on last analysis
  const recommendedGrants = useMemo(() => {
    if (!unlocked || history.length === 0) return [];
    
    const lastAnalysis = history[0];
    const languages = Object.keys(lastAnalysis.result.languages);
    const tags = lastAnalysis.result.grantFit?.signals || [];
    
    return getRecommendedGrants(languages, tags);
  }, [unlocked, history]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [ecosystemFilter, setEcosystemFilter] = useState<FilterEcosystem>('all');
  const [grantTypeFilter, setGrantTypeFilter] = useState<FilterGrantType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter grants
  const filteredGrants = useMemo(() => {
    return grantsData.filter((grant) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          grant.title.toLowerCase().includes(query) ||
          grant.organization.toLowerCase().includes(query) ||
          grant.description.toLowerCase().includes(query) ||
          grant.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Category
      if (categoryFilter !== 'all' && grant.category !== categoryFilter) return false;
      
      // Ecosystem
      if (ecosystemFilter !== 'all' && grant.ecosystem !== ecosystemFilter) return false;
      
      // Grant Type
      if (grantTypeFilter !== 'all' && grant.grantType !== grantTypeFilter) return false;
      
      return true;
    });
  }, [searchQuery, categoryFilter, ecosystemFilter, grantTypeFilter]);

  const activeFiltersCount = [categoryFilter, ecosystemFilter, grantTypeFilter]
    .filter(f => f !== 'all').length;

  const clearFilters = () => {
    setCategoryFilter('all');
    setEcosystemFilter('all');
    setGrantTypeFilter('all');
    setSearchQuery('');
    devLog('grants-clear-filters');
  };

  // Locked state
  if (!unlocked) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Grants Explorer Locked</h1>
            <p className="text-muted-foreground mb-8">
              Analyze at least one GitHub repository to unlock access to our 
              curated grants database.
            </p>
            <Button
              variant="hero"
              size="lg"
              asChild
              onClick={() => devLog('locked-analyze-cta')}
            >
              <Link to="/analyze">
                Analyze a Repository
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Grants Explorer
          </h1>
          <p className="text-muted-foreground">
            Browse curated grant opportunities from top Web3 organizations.
          </p>
        </motion.div>

        {/* Recommended Grants */}
        {recommendedGrants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-warning" />
              <h2 className="text-xl font-semibold">Recommended for You</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedGrants.map((grant, index) => (
                <GrantCard key={grant.id} grant={grant} index={index} recommended />
              ))}
            </div>
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card variant="glass" className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search grants by name, organization, or tags..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    devLog('grants-search', e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
              
              {/* Filter Toggle */}
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => {
                  setShowFilters(!showFilters);
                  devLog('grants-toggle-filters');
                }}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value as FilterCategory);
                        devLog('grants-filter-category', e.target.value);
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground"
                    >
                      <option value="all">All Categories</option>
                      <option value="defi">DeFi</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="tooling">Tooling</option>
                      <option value="nft">NFT</option>
                      <option value="gaming">Gaming</option>
                      <option value="social">Social</option>
                      <option value="dao">DAO</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Ecosystem */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ecosystem</label>
                    <select
                      value={ecosystemFilter}
                      onChange={(e) => {
                        setEcosystemFilter(e.target.value as FilterEcosystem);
                        devLog('grants-filter-ecosystem', e.target.value);
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground"
                    >
                      <option value="all">All Ecosystems</option>
                      <option value="ethereum">Ethereum</option>
                      <option value="avalanche">Avalanche</option>
                      <option value="polygon">Polygon</option>
                      <option value="solana">Solana</option>
                      <option value="cosmos">Cosmos</option>
                      <option value="multi-chain">Multi-chain</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Grant Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Grant Type</label>
                    <select
                      value={grantTypeFilter}
                      onChange={(e) => {
                        setGrantTypeFilter(e.target.value as FilterGrantType);
                        devLog('grants-filter-type', e.target.value);
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground"
                    >
                      <option value="all">All Types</option>
                      <option value="grant">Grant</option>
                      <option value="bounty">Bounty</option>
                      <option value="retroactive">Retroactive</option>
                      <option value="equity-free">Equity-Free</option>
                      <option value="accelerator">Accelerator</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear all filters
                  </Button>
                )}
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {filteredGrants.length} of {grantsData.length} grants
        </div>

        {/* Grants Grid */}
        {filteredGrants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGrants.map((grant, index) => (
              <GrantCard key={grant.id} grant={grant} index={index} />
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-12 text-center">
            <p className="text-muted-foreground">
              No grants found matching your criteria.
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear filters
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
}
