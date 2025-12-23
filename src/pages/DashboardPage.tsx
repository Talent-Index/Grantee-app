import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Search, 
  FolderOpen, 
  History, 
  ArrowRight, 
  Activity,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { getAnalysisHistory } from '@/lib/storage';
import { getSettings } from '@/lib/settings';
import { devLog } from '@/lib/config';

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const history = getAnalysisHistory();
  const settings = getSettings();
  const recentAnalyses = history.slice(0, 3);

  const cards = [
    {
      id: 'analyze',
      title: 'Repo Analysis',
      description: 'Analyze a GitHub repository for grant eligibility and code quality.',
      icon: Search,
      badge: '$0.10',
      badgeVariant: 'primary' as const,
      href: '/analyze',
      cta: 'Analyze Repo',
    },
    {
      id: 'grants',
      title: 'Grant Explorer',
      description: 'Browse available grants and find the best matches for your project.',
      icon: FolderOpen,
      badge: `${history.length} analyzed`,
      badgeVariant: 'secondary' as const,
      href: '/grants',
      cta: 'Browse Grants',
    },
    {
      id: 'history',
      title: 'Recent Activity',
      description: 'View your past analyses and re-run them with updated data.',
      icon: History,
      badge: `${history.length} total`,
      badgeVariant: 'secondary' as const,
      href: '/history',
      cta: 'View History',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground">
            {isConnected 
              ? `Welcome back! Ready to analyze your next repository.`
              : 'Connect your wallet to get started with paid analysis.'
            }
          </p>
        </motion.div>

        {/* Wallet Connection */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card variant="glass" className="border-primary/30">
              <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Connect Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to pay for repository analysis via x402.
                  </p>
                </div>
                <div onClick={() => devLog('dashboard-connect-wallet')}>
                  <ConnectButton />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={card.badgeVariant}>
                      {card.id === 'analyze' && <DollarSign className="h-3 w-3 mr-1" />}
                      {card.badge}
                    </Badge>
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                    onClick={() => devLog(`dashboard-${card.id}`)}
                  >
                    <Link to={card.href}>
                      {card.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Analyses
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/history">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentAnalyses.map((item) => {
                const repoName = item.repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || item.repoUrl;
                return (
                  <Card key={item.id} variant="glass" className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{repoName}</span>
                          {item.settlement?.success && (
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Score: {item.result.codeQuality.score} • {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/history`}>View</Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* API Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card variant="glass">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <span>API: </span>
                <code className="text-foreground bg-secondary/50 px-2 py-0.5 rounded">
                  {settings.apiBaseUrl}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  devLog('dashboard-check-api');
                  window.open(`${settings.apiBaseUrl}/health`, '_blank');
                }}
              >
                Check API Status
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
