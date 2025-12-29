import { useEffect, useState } from 'react';
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
import { emptyAnalysis } from '@/types/repoAnalysis';

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
  const jobId = searchParams.get('jobId') || '';
  
  const { getAnalysis, completeAnalysis, setAnalysisError } = useRepoAnalysis();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Parse repo name from URL
  const repoName = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || 'Repository';

  // Simulate progress steps (since we don't have real backend polling yet)
  useEffect(() => {
    if (error) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    const elapsedInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(elapsedInterval);
    };
  }, [error]);

  // Check for cached analysis or simulate completion
  useEffect(() => {
    const analysis = getAnalysis();
    
    // If already complete, navigate to insights
    if (analysis.status === 'complete') {
      navigate(`/insights?repoUrl=${encodeURIComponent(repoUrl)}`);
      return;
    }

    // Simulate completion after all steps
    if (currentStep >= STEPS.length - 1 && elapsedSeconds >= 8) {
      // Create a mock complete analysis for demo
      // In production, this would come from polling the backend
      const mockAnalysis = {
        ...emptyAnalysis(repoUrl),
        status: 'complete' as const,
        summary: {
          niche: 'Infrastructure',
          oneLiner: 'A Web3 development toolkit',
          matchScore: 75,
          confidence: 0.8,
        },
        repo: {
          owner: repoName.split('/')[0] || '',
          name: repoName.split('/')[1] || '',
          stars: 150,
          forks: 25,
          watchers: 150,
          openIssues: 12,
          closedIssues: 45,
          topics: ['web3', 'ethereum', 'typescript'],
          homepage: null,
          lastPush: new Date().toISOString(),
        },
        activity: {
          commits30d: 42,
          commits90d: 120,
          commits7d: 15,
          contributors: 5,
          lastCommitDate: new Date().toISOString(),
        },
        stack: {
          primaryLanguage: 'TypeScript',
          languages: { TypeScript: 75, JavaScript: 20, Solidity: 5 },
          frameworks: ['React', 'Vite'],
        },
        quality: {
          hasReadme: true,
          hasLicense: true,
          hasTests: true,
          hasCI: true,
          documentationScore: 80,
          codeHealthScore: 75,
        },
        recommendations: {
          nextSteps: ['Apply for Ethereum Foundation grants', 'Add more test coverage'],
          missingPieces: ['Security audit', 'Multi-chain support'],
        },
        grantMatches: [],
      };

      // Store in cache and navigate
      completeAnalysis({ result: mockAnalysis as any, success: true }, repoUrl);
      navigate(`/insights?repoUrl=${encodeURIComponent(repoUrl)}`);
    }

    // Timeout after 60 seconds
    if (elapsedSeconds >= 60) {
      setError('Analysis timed out. Please try again.');
      setAnalysisError(repoUrl, 'Analysis timed out');
    }
  }, [currentStep, elapsedSeconds, repoUrl, navigate, getAnalysis, completeAnalysis, setAnalysisError, repoName]);

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
