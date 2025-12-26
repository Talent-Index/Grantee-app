import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  GitFork, 
  AlertCircle, 
  CheckCircle2, 
  Code2, 
  Activity,
  Shield,
  Target,
  Lightbulb,
  ExternalLink,
  Sparkles,
  BarChart3
} from 'lucide-react';
import type { RepoAnalysisResult } from '@/lib/types';
import { SignalsPanel, ScoresOverview, OpportunityCardView } from '@/components/signals';
import { extractSignals, calculateScores, generateOpportunityCard } from '@/lib/signals';
import { useMemo } from 'react';

interface AnalysisResultsProps {
  result: RepoAnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const qualityColor = result.codeQuality.score >= 80 
    ? 'text-success' 
    : result.codeQuality.score >= 60 
      ? 'text-warning' 
      : 'text-destructive';

  // Generate Signal Intelligence data
  const signals = useMemo(() => extractSignals(result), [result]);
  const scores = useMemo(() => calculateScores(signals, result), [signals, result]);
  const opportunityCard = useMemo(() => generateOpportunityCard(result, signals, scores), [result, signals, scores]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <Star className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{result.stars.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Stars</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <GitFork className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{result.forks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Forks</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold gradient-text">{scores.overall}</p>
              <p className="text-xs text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{signals.length}</p>
              <p className="text-xs text-muted-foreground">Signals</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="opportunity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunity" className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Opportunity</span>
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Scores</span>
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Signals</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1.5">
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunity" className="mt-6">
          <OpportunityCardView card={opportunityCard} />
        </TabsContent>

        <TabsContent value="scores" className="mt-6">
          <ScoresOverview scores={scores} />
        </TabsContent>

        <TabsContent value="signals" className="mt-6">
          <SignalsPanel signals={signals} />
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          {/* Original detailed view */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Languages */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code2 className="h-5 w-5 text-primary" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(result.languages)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([lang, percentage]) => (
                      <div key={lang} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{lang}</span>
                          <span className="text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Last Commit</span>
                    <span className="font-mono text-sm">
                      {new Date(result.activity.lastCommit).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Commits (30 days)</span>
                    <Badge variant="primary">{result.activity.commits30d}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Quality */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Code Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold ${qualityColor}`}>
                    {result.codeQuality.score}
                  </div>
                  <p className="text-sm text-muted-foreground">Quality Score</p>
                </div>
                <div className="space-y-2">
                  {result.codeQuality.notes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{note}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grant Fit */}
            <Card variant="glow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Grant Fit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-warning" />
                      Signals
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.grantFit.signals.map((signal, i) => (
                        <Badge key={i} variant="secondary">{signal}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-1.5">
                      {result.grantFit.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result.grantFit.matches && result.grantFit.matches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Matches</h4>
                      <div className="space-y-2">
                        {result.grantFit.matches.slice(0, 5).map((match, i) => (
                          <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{match.program}</span>
                              <Badge variant="primary">{match.fitScore}%</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{match.ecosystem}</p>
                            {match.why && match.why.length > 0 && (
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {match.why.slice(0, 2).map((reason, j) => (
                                  <li key={j}>• {reason}</li>
                                ))}
                              </ul>
                            )}
                            {match.url && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 mt-2"
                                onClick={() => window.open(match.url, '_blank')}
                              >
                                Apply <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
