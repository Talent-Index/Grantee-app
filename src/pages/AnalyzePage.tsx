import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Search, 
  Loader2, 
  AlertCircle,
  Github,
  DollarSign,
  ExternalLink,
  Copy,
  Download,
  RefreshCw,
  ChevronRight,
  Wallet,
  CheckCircle2,
  Bug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { PaywallModal } from '@/components/PaywallModal';
import { AnalysisResults } from '@/components/AnalysisResults';
import { 
  type PaymentRequirement,
  type PaymentPayload,
  type AnalysisResult,
} from '@/lib/fetchWith402';
import { createPaymentAuthorization } from '@/lib/x402';
import { unlockGrants, addToHistory } from '@/lib/storage';
import { getSettings, CHAIN_HINTS, DEPTH_OPTIONS } from '@/lib/settings';
import { devLog } from '@/lib/config';
import { toast } from 'sonner';

type AnalysisStep = 'input' | 'payment' | 'signing' | 'settling' | 'results' | 'error';
type PaywallStep = 'info' | 'signing' | 'settling' | 'success' | 'error';

interface PaymentRequirementExtended extends PaymentRequirement {
  timeout?: number;
}

export default function AnalyzePage() {
  const [searchParams] = useSearchParams();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const settings = getSettings();
  
  // Form state
  const [repoUrl, setRepoUrl] = useState(searchParams.get('repo') || '');
  const [depth, setDepth] = useState<'light' | 'full'>(settings.defaultDepth);
  const [chainHint, setChainHint] = useState(settings.defaultChainHint);
  
  // Analysis state
  const [step, setStep] = useState<AnalysisStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rawJson, setRawJson] = useState<string>('');
  
  // Payment state
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallStep, setPaywallStep] = useState<PaywallStep>('info');
  const [paymentRequirement, setPaymentRequirement] = useState<PaymentRequirementExtended | null>(null);

  // Validate GitHub URL
  const isValidGitHubUrl = (url: string): boolean => {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return pattern.test(url.trim());
  };

  // Step 1: Check payment requirements
  const handleContinue = async () => {
    devLog('analyze-continue', { repoUrl, depth, chainHint });
    setError(null);

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!isValidGitHubUrl(repoUrl)) {
      setError('Please enter a valid GitHub URL (e.g., https://github.com/owner/repo)');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setStep('payment');

    try {
      const response = await fetch(`${settings.apiBaseUrl}/v1/github/analyze-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          depth,
          chainHint,
        }),
      });

      if (response.status === 402) {
        // Parse payment requirement
        const data = await response.json();
        const requirement = data.accepts?.[0] || data.paymentRequirement || data;
        setPaymentRequirement({
          ...requirement,
          timeout: requirement.timeout || 300,
        });
        setShowPaywall(true);
        setPaywallStep('info');
        setIsLoading(false);
      } else if (response.ok) {
        // Unlikely but handle direct success
        const data = await response.json();
        handleAnalysisSuccess(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Analysis check failed:', err);
      handleError(err);
    }
  };

  // Step 2: Sign and pay
  const handlePaymentConfirm = async () => {
    if (!walletClient || !address || !paymentRequirement) {
      setPaywallStep('error');
      return;
    }

    devLog('analyze-sign-payment');
    setPaywallStep('signing');

    try {
      const paymentPayload = await createPaymentAuthorization(
        walletClient,
        paymentRequirement,
        address
      );

      setPaywallStep('settling');
      setStep('settling');

      // Retry with payment payload
      const response = await fetch(`${settings.apiBaseUrl}/v1/github/analyze-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-402-payment': JSON.stringify(paymentPayload),
        },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          depth,
          chainHint,
          paymentPayload,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaywallStep('success');
        setTimeout(() => {
          setShowPaywall(false);
          handleAnalysisSuccess(data);
        }, 1500);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Settlement failed: HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setPaywallStep('error');
      handleError(err);
    }
  };

  const handleAnalysisSuccess = (data: AnalysisResult) => {
    devLog('analyze-success', data);
    setResult(data);
    setRawJson(JSON.stringify(data, null, 2));
    setStep('results');
    setIsLoading(false);

    // Unlock grants and save to history
    if (data.settlement?.success && address) {
      unlockGrants(address);
      addToHistory(repoUrl.trim(), data.result, data.settlement);
      toast.success('Analysis complete! Grants explorer is now unlocked.');
    } else {
      toast.success('Analysis complete!');
    }
  };

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    
    // Provide helpful messages
    if (message.includes('fetch') || message.includes('network')) {
      setError('Network error: Unable to reach the API. The server may be waking up...');
    } else if (message.includes('CORS')) {
      setError('CORS error: The API is not configured to accept requests from this domain.');
    } else {
      setError(message);
    }
    
    setStep('error');
    setIsLoading(false);
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    if (paywallStep === 'info') {
      setStep('input');
    }
  };

  const handleReset = () => {
    devLog('analyze-reset');
    setRepoUrl('');
    setResult(null);
    setRawJson('');
    setError(null);
    setStep('input');
    setPaymentRequirement(null);
  };

  const handleCopyJson = () => {
    devLog('analyze-copy-json');
    navigator.clipboard.writeText(rawJson);
    toast.success('JSON copied to clipboard');
  };

  const handleDownloadJson = () => {
    devLog('analyze-download-json');
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grantee-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReportIssue = () => {
    devLog('analyze-report-issue');
    const subject = encodeURIComponent('Grantee Analysis Issue');
    const body = encodeURIComponent(`
Issue Report
============
Repo URL: ${repoUrl}
Depth: ${depth}
Chain Hint: ${chainHint}
Error: ${error || 'N/A'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim());
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`, '_blank');
  };

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
            Get AI-powered insights on grant eligibility, code quality, and matching opportunities.
          </p>
        </motion.div>

        {/* Step Indicator */}
        {step !== 'input' && step !== 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span>Input</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className={`flex items-center gap-1 ${['payment', 'signing', 'settling'].includes(step) ? 'text-primary' : 'text-muted-foreground'}`}>
                {step === 'signing' ? <Wallet className="h-4 w-4 animate-pulse" /> : <DollarSign className="h-4 w-4" />}
                <span>Payment</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Results</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Input Form */}
        {(step === 'input' || step === 'payment' || step === 'error') && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Repository Details</span>
                  <Badge variant="primary" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    $0.10 USDC
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Enter your GitHub repository URL and configure analysis options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Check */}
                {!isConnected ? (
                  <div className="text-center py-6 border border-dashed border-border rounded-lg">
                    <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your wallet to pay for analysis
                    </p>
                    <div onClick={() => devLog('analyze-connect-wallet')}>
                      <ConnectButton />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Repo URL */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Repository URL</label>
                      <Input
                        type="url"
                        placeholder="https://github.com/owner/repository"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        disabled={isLoading}
                        className="font-mono text-sm"
                      />
                    </div>

                    {/* Options Row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Depth */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Analysis Depth</label>
                        <select
                          value={depth}
                          onChange={(e) => setDepth(e.target.value as 'light' | 'full')}
                          disabled={isLoading}
                          className="w-full h-12 px-4 rounded-lg border border-border bg-input text-foreground"
                        >
                          {DEPTH_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Chain Hint */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Chain Hint</label>
                        <select
                          value={chainHint}
                          onChange={(e) => setChainHint(e.target.value)}
                          disabled={isLoading}
                          className="w-full h-12 px-4 rounded-lg border border-border bg-input text-foreground"
                        >
                          {CHAIN_HINTS.map((chain) => (
                            <option key={chain.value} value={chain.value}>
                              {chain.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-destructive">{error}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleReportIssue}
                              className="mt-2 text-xs"
                            >
                              <Bug className="h-3 w-3 mr-1" />
                              Report Issue
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={handleContinue}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {step === 'payment' ? 'Checking payment...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          Continue
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>

                    {/* Core Wallet Tip */}
                    <p className="text-xs text-center text-muted-foreground">
                      Using Core Wallet?{' '}
                      <a 
                        href="https://support.avax.network/en/articles/6066879-core-extension-how-do-i-add-core-to-my-browser"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Setup instructions
                      </a>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {result && step === 'results' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Actions Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Analysis Complete
                </Badge>
                {result.settlement?.transaction?.hash && (
                  <Badge variant="outline" className="font-mono text-xs">
                    TX: {result.settlement.transaction.hash.slice(0, 10)}...
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyJson}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy JSON
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadJson}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open on GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  New Analysis
                </Button>
              </div>
            </motion.div>

            {/* Results Component */}
            <AnalysisResults result={result.result} />

            {/* Bottom Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button variant="hero" asChild>
                <Link to="/grants">
                  Browse Matching Grants
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Another Analysis
              </Button>
            </motion.div>
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
        error={paywallStep === 'error' ? 'Payment failed. Please try again.' : undefined}
      />
    </Layout>
  );
}
