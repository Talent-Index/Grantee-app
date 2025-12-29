import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Github,
  Code,
  GitCommit,
  Users,
  Flame,
  Snowflake,
  Sun,
  ArrowRight,
  Star,
  GitFork,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { useRepoAnalysis } from '@/hooks/useRepoAnalysis';
import { emptyAnalysis, buildGrantsUrlFromAnalysis } from '@/types/repoAnalysis';
import { getSettings } from '@/lib/settings';
import type { RepoAnalysis } from '@/types/repoAnalysis';

// Contributor momentum trend based on commits30d
// Hot >= 30, Warm 10-29, Cold 0-9
function getMomentumTrend(commits30d: number): { label: string; icon: React.ReactNode; color: string } {
  if (commits30d >= 30) {
    return { label: 'Hot', icon: <Flame className="h-4 w-4" />, color: 'text-orange-500' };
  }
  if (commits30d >= 10) {
    return { label: 'Warm', icon: <Sun className="h-4 w-4" />, color: 'text-yellow-500' };
  }
  return { label: 'Cold', icon: <Snowflake className="h-4 w-4" />, color: 'text-blue-400' };
}

export default function InsightsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const settings = getSettings();
  const repoUrl = searchParams.get('repoUrl') || '';
  const jobId = searchParams.get('jobId') || '';
  
  const { getAnalysis, setAnalysis } = useRepoAnalysis();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Get cached analysis using stable key (repoUrl)
  const cachedAnalysis = getAnalysis(repoUrl);
  const isComplete = cachedAnalysis.status === 'complete';
  const analysis = isComplete ? cachedAnalysis : null;

  // Fetch result if not cached
  useEffect(() => {
    if (analysis || !jobId) return;

    const fetchResult = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${settings.apiBaseUrl}/api/analyze/result?jobId=${encodeURIComponent(jobId)}`,
          {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status === 'complete' && data.analysis) {
          const result: RepoAnalysis = {
            ...data.analysis,
            status: 'complete',
            repoUrl,
          };
          setAnalysis(result);
        } else if (data.status === 'error') {
          setFetchError(data.error || 'Analysis failed');
        } else {
          // Still processing, redirect back to analysis page
          navigate(`/analysis?repoUrl=${encodeURIComponent(repoUrl)}&jobId=${jobId}`);
        }
      } catch (err) {
        console.error('[Insights] Fetch failed:', err);
        setFetchError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [jobId, analysis, repoUrl, settings.apiBaseUrl, setAnalysis, navigate]);

  // Safe access with defaults - only render details when complete
  const safeAnalysis = analysis ?? emptyAnalysis(repoUrl);
  const hasError = cachedAnalysis.status === 'error' || !!fetchError;

  // Safe destructuring with fallbacks
  const niche = safeAnalysis.summary?.niche ?? 'Unknown';
  const matchScore = safeAnalysis.summary?.matchScore ?? 0;
  const primaryLanguage = safeAnalysis.stack?.primaryLanguage ?? 'Unknown';
  const commits30d = safeAnalysis.activity?.commits30d ?? 0;
  const contributors = safeAnalysis.activity?.contributors ?? 0;
  const lastCommitDate = safeAnalysis.activity?.lastCommitDate ?? null;
  const owner = safeAnalysis.repo?.owner ?? '';
  const name = safeAnalysis.repo?.name ?? '';
  const stars = safeAnalysis.repo?.stars ?? 0;
  const forks = safeAnalysis.repo?.forks ?? 0;
  const topics = safeAnalysis.repo?.topics ?? [];

  const momentum = getMomentumTrend(commits30d);
  const lastCommitFormatted = lastCommitDate 
    ? new Date(lastCommitDate).toLocaleDateString() 
    : 'Unknown';

  // Handle grants navigation
  const handleFindGrants = () => {
    const grantsUrl = buildGrantsUrlFromAnalysis(safeAnalysis);
    navigate(grantsUrl);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading analysis results...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Error or no data state
  if (hasError || !isComplete) {
    const errorMessage = fetchError || cachedAnalysis.errors?.[0] || 'Please analyze a repository first.';
    
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No Analysis Found</h2>
              <p className="text-muted-foreground text-sm mb-6">{errorMessage}</p>
              <Button asChild>
                <Link to="/analyze">
                  <Github className="h-4 w-4 mr-2" />
                  Analyze a Repository
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Github className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{owner}/{name}</h1>
              <a 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                View on GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{niche}</Badge>
            {topics.slice(0, 3).map(topic => (
              <Badge key={topic} variant="outline">{topic}</Badge>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Code className="h-4 w-4" />
                  Language
                </div>
                <p className="text-lg font-semibold">{primaryLanguage}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <GitCommit className="h-4 w-4" />
                  Commits (30d)
                </div>
                <p className="text-lg font-semibold">{commits30d}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Star className="h-4 w-4" />
                  Stars
                </div>
                <p className="text-lg font-semibold">{stars.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <GitFork className="h-4 w-4" />
                  Forks
                </div>
                <p className="text-lg font-semibold">{forks.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Contributor Momentum - Cool Signal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Contributor Momentum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contributors</p>
                  <p className="text-2xl font-bold">{contributors}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Commit</p>
                  <p className="text-lg font-semibold">{lastCommitFormatted}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Activity Trend</p>
                  <div className={`flex items-center gap-2 ${momentum.color}`}>
                    {momentum.icon}
                    <span className="text-lg font-bold">{momentum.label}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Match Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Grant Match Score</p>
                  <p className="text-3xl font-bold text-primary">{matchScore}/100</p>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/20"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(matchScore / 100) * 251} 251`}
                      className="text-primary"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Find Grants CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="w-full"
            onClick={handleFindGrants}
          >
            Find Grants for This Project
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
