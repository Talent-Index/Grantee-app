import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  History, 
  ExternalLink, 
  RefreshCw, 
  Search as SearchIcon,
  ChevronDown,
  ChevronUp,
  Star,
  GitFork,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { getAnalysisHistory, type AnalysisHistoryItem } from '@/lib/storage';
import { truncateAddress } from '@/lib/x402';
import { devLog } from '@/lib/config';

export default function HistoryPage() {
  const [history] = useState<AnalysisHistoryItem[]>(getAnalysisHistory);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    devLog(`history-toggle-${id}`);
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const extractRepoName = (url: string) => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    return match ? match[1] : url;
  };

  if (history.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
              <History className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">No Analysis History</h1>
            <p className="text-muted-foreground mb-8">
              You haven't analyzed any repositories yet. Start by analyzing your 
              first GitHub repo.
            </p>
            <Button
              variant="hero"
              size="lg"
              asChild
              onClick={() => devLog('history-empty-cta')}
            >
              <Link to="/analyze">
                <SearchIcon className="h-5 w-5 mr-2" />
                Analyze a Repository
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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
            <p className="text-muted-foreground">
              View your past repository analyses and results.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            onClick={() => devLog('history-new-analysis')}
          >
            <Link to="/analyze">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Analysis
            </Link>
          </Button>
        </motion.div>

        {/* History List */}
        <div className="space-y-4">
          {history.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="overflow-hidden">
                  {/* Header Row */}
                  <div
                    className="p-4 sm:p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold truncate">
                            {extractRepoName(item.repoUrl)}
                          </h3>
                          {item.settlement?.success && (
                            <Badge variant="success" className="shrink-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDate(item.timestamp)}</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-warning" />
                            {item.result.stars.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="h-4 w-4" />
                            {item.result.forks.toLocaleString()}
                          </span>
                          <Badge variant="outline">
                            Score: {item.result.codeQuality.score}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            devLog(`history-open-repo-${item.id}`);
                            window.open(item.repoUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border/50"
                    >
                      <CardContent className="pt-6">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Languages */}
                          <div>
                            <h4 className="text-sm font-medium mb-3">Languages</h4>
                            <div className="space-y-2">
                              {Object.entries(item.result.languages)
                                .slice(0, 4)
                                .map(([lang, pct]) => (
                                  <div key={lang} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{lang}</span>
                                    <span>{pct}%</span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Grant Fit Signals */}
                          <div>
                            <h4 className="text-sm font-medium mb-3">Grant Signals</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {item.result.grantFit.signals.map((signal, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {signal}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Settlement Info */}
                          {item.settlement && (
                            <div>
                              <h4 className="text-sm font-medium mb-3">Payment</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <Badge variant={item.settlement.success ? 'success' : 'destructive'}>
                                    {item.settlement.success ? 'Settled' : 'Failed'}
                                  </Badge>
                                </div>
                                {item.settlement.transaction?.hash && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">TX</span>
                                    <a
                                      href={`https://testnet.snowscan.xyz/tx/${item.settlement.transaction.hash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-xs text-primary hover:underline"
                                      onClick={() => devLog(`history-view-tx-${item.id}`)}
                                    >
                                      {truncateAddress(item.settlement.transaction.hash)}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            onClick={() => devLog(`history-reanalyze-${item.id}`)}
                          >
                            <Link to={`/analyze?repo=${encodeURIComponent(item.repoUrl)}`}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Re-analyze
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            onClick={() => devLog(`history-view-grants-${item.id}`)}
                          >
                            <Link to="/grants">
                              View Matching Grants
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
