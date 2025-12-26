import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sparkles, 
  AlertTriangle, 
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Target,
  Zap,
  ChevronRight,
  Copy,
  Github
} from 'lucide-react';
import type { OpportunityCard as OpportunityCardType, NextAction } from '@/lib/signals/types';
import { useState } from 'react';
import { toast } from 'sonner';

interface OpportunityCardViewProps {
  card: OpportunityCardType;
  onActionToggle?: (actionId: string, completed: boolean) => void;
}

function getStrengthColor(strength: 'strong' | 'moderate' | 'weak'): string {
  switch (strength) {
    case 'strong': return 'text-success';
    case 'moderate': return 'text-warning';
    case 'weak': return 'text-muted-foreground';
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'bg-success/20 text-success border-success/30';
  if (confidence >= 60) return 'bg-primary/20 text-primary border-primary/30';
  if (confidence >= 40) return 'bg-warning/20 text-warning border-warning/30';
  return 'bg-muted text-muted-foreground border-border';
}

export function OpportunityCardView({ card, onActionToggle }: OpportunityCardViewProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const handleActionToggle = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
    onActionToggle?.(actionId, newCompleted.has(actionId));
  };

  const handleCopyCard = () => {
    const text = `
# ${card.projectName} - Opportunity Card

## Summary
${card.summary}

## Scores
- Grant Fit: ${card.scores.grantFit.score}/100
- Capital Readiness: ${card.scores.capitalReadiness.score}/100
- Ecosystem Alignment: ${card.scores.ecosystemAlignment.score}/100
- Engagement Ease: ${card.scores.engagementEase.score}/100
- Overall: ${card.scores.overall}/100

## Top Grant Matches
${card.grantRecommendations.map(g => `- ${g.programName} (${g.confidence}% confidence)`).join('\n')}

## Next Actions
${card.nextActions.map(a => `- [${a.priority.toUpperCase()}] ${a.action}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Opportunity card copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <Card variant="glow" className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="primary">Opportunity Card</Badge>
              </div>
              <CardTitle className="text-2xl mb-1">{card.projectName}</CardTitle>
              <a 
                href={card.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <Github className="h-3 w-3" />
                {card.projectUrl.replace('https://github.com/', '')}
              </a>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold gradient-text">
                {card.scores.overall}
              </div>
              <p className="text-xs text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-muted-foreground">{card.summary}</p>
          
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={handleCopyCard}>
              <Copy className="h-4 w-4 mr-1.5" />
              Copy Card
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={card.projectUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-1.5" />
                View Repo
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strongest Signals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-warning" />
            Strongest Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {card.strongestSignals.map((signal, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    signal.strength === 'strong' ? 'bg-success' :
                    signal.strength === 'moderate' ? 'bg-warning' : 'bg-muted'
                  }`} />
                  <span className={`text-xs ${getStrengthColor(signal.strength)}`}>
                    {signal.strength}
                  </span>
                </div>
                <p className="font-medium text-sm">{signal.label}</p>
                <p className="text-lg font-mono text-primary">{signal.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Flags */}
      {card.riskFlags.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {card.riskFlags.map((flag, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    flag.type === 'critical' 
                      ? 'bg-destructive/10 border border-destructive/30' 
                      : 'bg-warning/10 border border-warning/30'
                  }`}
                >
                  {flag.type === 'critical' ? (
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  )}
                  <div>
                    <Badge variant="secondary" className="mb-1 text-xs">
                      {flag.category}
                    </Badge>
                    <p className="text-sm">{flag.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grant Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Recommended Grants
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {card.grantRecommendations.length} matching opportunities
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {card.grantRecommendations.map((grant, index) => (
            <motion.div
              key={grant.grantId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{grant.programName}</h4>
                  <p className="text-sm text-muted-foreground">{grant.ecosystem}</p>
                </div>
                <Badge className={`${getConfidenceColor(grant.confidence)}`}>
                  {grant.confidence}% match
                </Badge>
              </div>
              
              <div className="space-y-1 mb-3">
                {grant.whyFits.slice(0, 3).map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>

              {grant.applyUrl && (
                <Button size="sm" className="w-full" asChild>
                  <a href={grant.applyUrl} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </a>
                </Button>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Next Actions */}
      <Card variant="glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChevronRight className="h-5 w-5 text-primary" />
            Next Best Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete these to improve your scores
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {card.nextActions.map((action) => {
            const isCompleted = completedActions.has(action.id);
            
            return (
              <div
                key={action.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                  isCompleted 
                    ? 'bg-success/5 border-success/30 opacity-60' 
                    : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                }`}
              >
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => handleActionToggle(action.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={
                        action.priority === 'high' ? 'destructive' :
                        action.priority === 'medium' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {action.priority}
                    </Badge>
                  </div>
                  <p className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
                    {action.action}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Impact:</span> {action.impact}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        Generated at {new Date(card.generatedAt).toLocaleString()}
      </div>
    </motion.div>
  );
}
