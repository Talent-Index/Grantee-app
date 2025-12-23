import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Settings, Save, RotateCcw, CheckCircle2, AlertCircle, Loader2, ExternalLink, Wallet, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Layout } from '@/components/Layout';
import { 
  getSettings, 
  saveSettings, 
  resetSettings, 
  CHAIN_HINTS, 
  DEPTH_OPTIONS,
  type AppSettings 
} from '@/lib/settings';
import { getDebugMode, setDebugMode, devLog } from '@/lib/config';
import { truncateAddress } from '@/lib/x402';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [settings, setSettings] = useState<AppSettings>(getSettings);
  const [debugMode, setDebugModeState] = useState(getDebugMode());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = getSettings();
    setHasChanges(
      saved.apiBaseUrl !== settings.apiBaseUrl ||
      saved.defaultChainHint !== settings.defaultChainHint ||
      saved.defaultDepth !== settings.defaultDepth ||
      saved.showDebugLogs !== settings.showDebugLogs
    );
  }, [settings]);

  const handleSave = () => {
    devLog('settings-save');
    saveSettings(settings);
    setHasChanges(false);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    devLog('settings-reset');
    const defaults = resetSettings();
    setSettings(defaults);
    setDebugModeState(false);
    setDebugMode(false);
    setHasChanges(false);
    toast.info('Settings reset to defaults');
  };

  const handleDebugToggle = (enabled: boolean) => {
    devLog('settings-debug-toggle', enabled);
    setDebugModeState(enabled);
    setDebugMode(enabled);
    setSettings({ ...settings, showDebugLogs: enabled });
    toast.info(enabled ? 'Debug mode enabled' : 'Debug mode disabled');
  };

  const handleTestConnection = async () => {
    devLog('settings-test-connection');
    setTestStatus('testing');
    setTestMessage('');

    try {
      const response = await fetch(`${settings.apiBaseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setTestStatus('success');
        const version = data.version || 'unknown';
        const network = data.network || 'unknown';
        const price = data.price ? `$${data.price}` : '';
        setTestMessage(`Connected! v${version} on ${network} ${price ? `- ${price}/call` : ''}`);
      } else {
        setTestStatus('error');
        setTestMessage(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(err instanceof Error ? err.message : 'Network error - check CORS settings');
    }
  };

  const openHealthPage = () => {
    devLog('settings-open-health');
    window.open(`${settings.apiBaseUrl}/health`, '_blank');
  };

  const getNetworkName = (id: number) => {
    const networks: Record<number, string> = {
      43113: 'Avalanche Fuji',
      43114: 'Avalanche',
      1: 'Ethereum',
      137: 'Polygon',
    };
    return networks[id] || `Chain ${id}`;
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
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Configuration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground">
            Configure your API connection, wallet, and default analysis options.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Wallet Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet
                </CardTitle>
                <CardDescription>
                  Your connected wallet details and network status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected && address ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="font-mono text-sm">{truncateAddress(address)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">Network</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getNetworkName(chainId)}</span>
                        {chainId === 43113 ? (
                          <Badge variant="success">Correct</Badge>
                        ) : (
                          <Badge variant="destructive">Switch to Fuji</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">Chain ID</span>
                      <span className="font-mono text-sm">{chainId}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-border rounded-lg">
                    <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your wallet to use paid features
                    </p>
                    <ConnectButton />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* API Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure the Grantee API endpoint. The default is the hosted version.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Base URL</label>
                  <Input
                    type="url"
                    placeholder="https://grantee.onrender.com"
                    value={settings.apiBaseUrl}
                    onChange={(e) => setSettings({ ...settings, apiBaseUrl: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="flex-1"
                  >
                    {testStatus === 'testing' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : testStatus === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                    ) : testStatus === 'error' ? (
                      <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                    ) : null}
                    Test Connection
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={openHealthPage}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Health Page
                  </Button>
                </div>

                {testMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    testStatus === 'success' 
                      ? 'bg-success/10 text-success border border-success/30' 
                      : 'bg-destructive/10 text-destructive border border-destructive/30'
                  }`}>
                    {testMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Default Analysis Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Default Analysis Options</CardTitle>
                <CardDescription>
                  Set default values for repository analysis. You can override these per-analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chain Hint */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Chain Hint</label>
                  <select
                    value={settings.defaultChainHint}
                    onChange={(e) => setSettings({ ...settings, defaultChainHint: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border bg-input text-foreground"
                  >
                    {CHAIN_HINTS.map((chain) => (
                      <option key={chain.value} value={chain.value}>
                        {chain.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Depth */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Default Analysis Depth</label>
                  <div className="grid grid-cols-2 gap-4">
                    {DEPTH_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSettings({ ...settings, defaultDepth: option.value })}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          settings.defaultDepth === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{option.label}</span>
                          {settings.defaultDepth === option.value && (
                            <Badge variant="primary" className="text-xs">Selected</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Debug Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Debug Mode
                </CardTitle>
                <CardDescription>
                  Enable debug logging to see x402 payment payloads in the console.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">Show Debug Logs</p>
                    <p className="text-xs text-muted-foreground">
                      Logs 402 responses and signed payloads (never logs private keys)
                    </p>
                  </div>
                  <Switch
                    checked={debugMode}
                    onCheckedChange={handleDebugToggle}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              variant="hero"
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </motion.div>

          {/* Info Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="border-primary/20">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Settings are stored locally in your browser. 
                  The API must allow requests from this domain (CORS). If you're having connection issues, 
                  ensure the backend is configured to accept requests from Lovable app domains.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
