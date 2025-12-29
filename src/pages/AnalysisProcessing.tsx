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
import { getSettings } from '@/lib/settings';
import type { RepoAnalysis } from '@/types/repoAnalysis';

type ProcessingStep = 'metadata' | 'languages' | 'activity' | 'finalizing';

const STEPS: { id: ProcessingStep; label: string }[] = [
  { id: 'metadata', label: 'Fetching repository metadata' },
  { id: 'languages', label: 'Analyzing languages & stack' },
  { id: 'activity', label: 'Calculating commit activity' },
  { id: 'finalizing', label: 'Generating insights' },
];

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 60000; // 60 seconds

export default function AnalysisProcessing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const settings = getSettings();
  const repoUrl = searchParams.get('repoUrl') || '';
  const jobId = searchParams.get('jobId') || '';
  
  const { getAnalysis, setAnalysis } = useRepoAnalysis();
  
  // Get analysis using stable key (repoUrl)
  const getCachedAnalysis = useCallback(() => getAnalysis(repoUrl), [getAnalysis, repoUrl]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pollStartTime = useRef<number>(Date.now());
  const isPolling = useRef(false);

  // Parse repo name from URL
  const repoName = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || 'Repository';

  // Poll backend for analysis status
  const pollStatus = useCallback(async () => {
    if (!jobId || isPolling.current) return;
    
    isPolling.current = true;
    
    try {
      const response = await fetch(
        `${settings.apiBaseUrl}/api/analyze/status?jobId=${encodeURIComponent(jobId)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update step progress based on status
      if (data.step) {
        const stepIndex = STEPS.findIndex(s => s.id === data.step);
        if (stepIndex >= 0) {
          setCurrentStep(stepIndex);
        }
      } else if (data.status === 'processing') {
        // Increment step gradually if no step info
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 2));
      }

      if (data.status === 'complete' && data.analysis) {
        // Store completed analysis in cache
        const analysis: RepoAnalysis = {
          ...data.analysis,
          status: 'complete',
          repoUrl,
        };
        setAnalysis(analysis);
        navigate(`/insights?repoUrl=${encodeURIComponent(repoUrl)}&jobId=${jobId}`);
        return;
      }

      if (data.status === 'error') {
        setError(data.error || 'Analysis failed. Please try again.');
        setAnalysis({
          ...getCachedAnalysis(),
          repoUrl,
          status: 'error',
          errors: [data.error || 'Unknown error'],
        });
        return;
      }

      // Check timeout
      const elapsed = Date.now() - pollStartTime.current;
      if (elapsed >= MAX_POLL_TIME) {
        setError('Analysis timed out. Please try again.');
        return;
      }

      // Continue polling
      setTimeout(pollStatus, POLL_INTERVAL);
    } catch (err) {
      console.error('[Analysis] Poll failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to check analysis status');
    } finally {
      isPolling.current = false;
    }
  }, [jobId, repoUrl, navigate, settings.apiBaseUrl, setAnalysis, getCachedAnalysis]);

  // Start polling on mount
  useEffect(() => {
    if (!jobId) {
      setError('Missing job ID. Please try analyzing again.');
      return;
    }

    // Check if already complete in cache
    const cached = getCachedAnalysis();
    if (cached.status === 'complete' && cached.repoUrl === repoUrl) {
      navigate(`/insights?repoUrl=${encodeURIComponent(repoUrl)}&jobId=${jobId}`);
      return;
    }

    // Start polling
    pollStartTime.current = Date.now();
    pollStatus();
  }, [jobId, repoUrl, getCachedAnalysis, navigate, pollStatus]);

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
