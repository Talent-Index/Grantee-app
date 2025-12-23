import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  ExternalLink
} from 'lucide-react';
import type { RepoAnalysisResult } from '@/lib/types';

interface AnalysisResultsProps {
  result: RepoAnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const qualityColor = result.codeQuality.score >= 80 
    ? 'text-success' 
    : result.codeQuality.score >= 60 
      ? 'text-warning' 
      : 'text-destructive';

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
            <div className="p-2 rounded-lg bg-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{result.issues.open}</p>
              <p className="text-xs text-muted-foreground">Open Issues</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{result.issues.closed}</p>
              <p className="text-xs text-muted-foreground">Closed Issues</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
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
              {/* Signals */}
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

              {/* Recommendations */}
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

              {/* Grant Matches */}
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
    </motion.div>
  );
}
