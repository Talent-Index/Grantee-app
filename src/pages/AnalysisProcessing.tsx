import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  RefreshCw,
  Github,
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { useRepoAnalysis } from '@/hooks/useRepoAnalysis';

type ProcessingStep = 'metadata' | 'languages' | 'activity' | 'finalizing';

const STEPS: { id: ProcessingStep; label: string }[] = [
  { id: 'metadata', label: 'Fetching repository metadata' },
  { id: 'languages', label: 'Analyzing languages & stack' },
  { id: 'activity', label: 'Calculating commit activity' },
  { id: 'finalizing', label: 'Generating insights' },
];

export default function AnalysisProcessing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const repoUrl = searchParams.get('repoUrl') || '';
  
  const { getAnalysis } = useRepoAnalysis();
  
  // Get analysis using stable key (repoUrl)
  const getCachedAnalysis = useCallback(() => getAnalysis(repoUrl), [getAnalysis, repoUrl]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const stepInterval = useRef<NodeJS.Timeout | null>(null);

  // Parse repo name from URL
  const repoName = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || 'Repository';

  // Check cached analysis status - NO backend polling
  useEffect(() => {
    if (!repoUrl) {
      setError('Missing repository URL. Please try analyzing again.');
      return;
    }

    // Check if already complete in cache
    const cached = getCachedAnalysis();
    if (cached.status === 'complete' && cached.repoUrl === repoUrl) {
      navigate(`/insights?repoUrl=${encodeURIComponent(repoUrl)}`);
      return;
    }

    // If not complete and not in cache, redirect to analyze
    if (cached.status === 'idle' || cached.status === 'error') {
      setError('No analysis in progress. Please analyze again.');
      return;
    }

    // Simulate progress while waiting for cache update
    // (Analysis result should already be cached by AnalyzePage after payment)
    stepInterval.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          // Check cache again
          const current = getCachedAnalysis();
          if (current.status === 'complete') {
            navigate(`/insights?repoUrl=${encodeURIComponent(repoUrl)}`);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    // Timeout after 10 seconds - analysis should already be cached
    const timeout = setTimeout(() => {
      const current = getCachedAnalysis();
      if (current.status === 'complete') {
        navigate(`/insights?repoUrl=${encodeURIComponent(repoUrl)}`);
      } else {
        setError('Analysis not found. Please try analyzing again.');
      }
    }, 10000);

    return () => {
      if (stepInterval.current) clearInterval(stepInterval.current);
      clearTimeout(timeout);
    };
  }, [repoUrl, getCachedAnalysis, navigate]);

  // Timer for elapsed seconds display
  useEffect(() => {
    if (error) return;

    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [error]);

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setElapsedSeconds(0);
    navigate(`/analyze?repo=${encodeURIComponent(repoUrl)}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Github className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{repoName}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Analyzing Your Repository</h1>
          <p className="text-muted-foreground">
            This usually takes 10-30 seconds
          </p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Analysis Progress</span>
              <span className="text-sm font-normal text-muted-foreground">
                {elapsedSeconds}s
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STEPS.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep && !error;
              const isPending = index > currentStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isCurrent ? 'bg-primary/5 border border-primary/20' : ''
                  }`}
                >
                  {isComplete && (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  )}
                  {isCurrent && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                  )}
                  {isPending && (
                    <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    isPending ? 'text-muted-foreground/60' : ''
                  }`}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Analysis Failed</p>
                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/analyze">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Link>
                  </Button>
                  <Button size="sm" onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
