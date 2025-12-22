import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Search, 
  Loader2, 
  AlertCircle,
  Github,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { ConfigWarning } from '@/components/ConfigWarning';
import { PaywallModal } from '@/components/PaywallModal';
import { AnalysisResults } from '@/components/AnalysisResults';
import { 
  fetchWith402, 
  type FetchStatus, 
  type PaymentRequirement,
  type PaymentPayload,
  type AnalysisResult,
  FetchWith402Error
} from '@/lib/fetchWith402';
import { createPaymentAuthorization } from '@/lib/x402';
import { unlockGrants, addToHistory } from '@/lib/storage';
import { devLog, validateConfig } from '@/lib/config';
import { toast } from 'sonner';

type PaywallStep = 'info' | 'signing' | 'settling' | 'success' | 'error';

export default function AnalyzePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // Form state
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallStep, setPaywallStep] = useState<PaywallStep>('info');
  const [paymentRequirement, setPaymentRequirement] = useState<PaymentRequirement | null>(null);
  const [paymentResolver, setPaymentResolver] = useState<{
    resolve: (payload: PaymentPayload | null) => void;
  } | null>(null);

  const { isValid: configValid } = validateConfig();

  // Validate GitHub URL
  const isValidGitHubUrl = (url: string): boolean => {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return pattern.test(url.trim());
  };

  // Handle payment request from fetchWith402
  const handlePaymentRequired = useCallback(
    (requirement: PaymentRequirement): Promise<PaymentPayload | null> => {
      return new Promise((resolve) => {
        setPaymentRequirement(requirement);
        setPaywallStep('info');
        setShowPaywall(true);
        setPaymentResolver({ resolve });
      });
    },
    []
  );

  // Handle payment confirmation from modal
  const handlePaymentConfirm = useCallback(async () => {
    if (!walletClient || !address || !paymentRequirement) {
      setPaywallStep('error');
      return;
    }

    try {
      setPaywallStep('signing');
      
      const paymentPayload = await createPaymentAuthorization(
        walletClient,
        paymentRequirement,
        address
      );
      
      setPaywallStep('settling');
      paymentResolver?.resolve(paymentPayload);
      
    } catch (err) {
      console.error('Payment signing failed:', err);
      setPaywallStep('error');
      paymentResolver?.resolve(null);
    }
  }, [walletClient, address, paymentRequirement, paymentResolver]);

  // Handle paywall close
  const handlePaywallClose = useCallback(() => {
    setShowPaywall(false);
    if (paywallStep === 'info') {
      paymentResolver?.resolve(null);
    }
    setPaywallStep('info');
  }, [paywallStep, paymentResolver]);

  // Analyze repository
  const handleAnalyze = async () => {
    devLog('analyze-submit', { repoUrl });
    
    // Validation
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    
    if (!isValidGitHubUrl(repoUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!configValid) {
      toast.error('API is not configured. Please check the configuration.');
      return;
    }

    // Reset state
    setError(null);
    setResult(null);
    setStatus('validating');

    try {
      const analysisResult = await fetchWith402<AnalysisResult>(
        '/v1/github/analyze-paid',
        {
          method: 'POST',
          body: JSON.stringify({ repoUrl: repoUrl.trim() }),
        },
        {
          onStatusChange: (newStatus) => {
            setStatus(newStatus);
            if (newStatus === 'success') {
              setPaywallStep('success');
              setTimeout(() => setShowPaywall(false), 1500);
            }
          },
          onPaymentRequired: handlePaymentRequired,
        }
      );

      devLog('analyze-success', { result: analysisResult });
      
      // Store result
      setResult(analysisResult);
      
      // Unlock grants access
      if (analysisResult.settlement?.success && address) {
        unlockGrants(address);
        addToHistory(repoUrl.trim(), analysisResult.result, analysisResult.settlement);
        toast.success('Analysis complete! Grants explorer is now unlocked.');
      }
      
    } catch (err) {
      devLog('analyze-error', err);
      
      if (err instanceof FetchWith402Error) {
        switch (err.code) {
          case 'CONFIG_MISSING':
            setError('API is not configured. Please set VITE_API_BASE_URL.');
            break;
          case 'CORS_BLOCKED':
            setError('CORS error: The API server is not allowing requests from this origin.');
            break;
          case 'NETWORK_ERROR':
            setError('Network error: Unable to reach the API. Check your connection or CORS settings.');
            break;
          case 'PAYMENT_REJECTED':
            setError('Payment was cancelled or rejected.');
            break;
          case 'SETTLEMENT_FAILED':
            setError('Payment settlement failed. Please try again.');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      setStatus('error');
    }
  };

  const statusLabels: Record<FetchStatus, string> = {
    idle: 'Ready',
    validating: 'Validating...',
    requesting: 'Connecting to API...',
    payment_required: 'Payment Required',
    signing: 'Awaiting Signature...',
    settling: 'Processing Payment...',
    retrying: 'Fetching Results...',
    success: 'Analysis Complete',
    error: 'Error',
  };

  const isLoading = ['validating', 'requesting', 'signing', 'settling', 'retrying'].includes(status);

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Github className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Repository Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Analyze Your Repository
          </h1>
          <p className="text-muted-foreground">
            Get AI-powered insights on your repo's grant eligibility, code quality, 
            and matching opportunities.
          </p>
        </motion.div>

        {/* Config Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-8"
        >
          <ConfigWarning />
        </motion.div>

        {/* Analysis Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-12"
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Enter Repository URL</span>
                <Badge variant="primary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  $0.10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet connection check */}
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your wallet to analyze repositories
                  </p>
                  <div onClick={() => devLog('analyze-connect-wallet')}>
                    <ConnectButton />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Input
                      type="url"
                      placeholder="https://github.com/owner/repository"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      disabled={isLoading}
                      className="font-mono text-sm"
                    />
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={isLoading || !configValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {statusLabels[status]}
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Analyze ($0.10)
                      </>
                    )}
                  </Button>

                  {/* Status indicator */}
                  {status !== 'idle' && status !== 'success' && status !== 'error' && (
                    <div className="text-center text-sm text-muted-foreground">
                      {statusLabels[status]}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {result && (
          <div className="max-w-4xl mx-auto">
            <AnalysisResults result={result.result} />
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={handlePaywallClose}
        onConfirm={handlePaymentConfirm}
        requirement={paymentRequirement}
        step={paywallStep}
        error={paywallStep === 'error' ? 'Failed to process payment. Please try again.' : undefined}
      />
    </Layout>
  );
}
