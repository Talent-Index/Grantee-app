import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Wallet, 
  Globe, 
  Handshake,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import type { ProjectScores, ScoreBreakdown } from '@/lib/signals/types';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ScoresOverviewProps {
  scores: ProjectScores;
}

const scoreConfig = {
  grantFit: { 
    icon: Target, 
    gradient: 'from-primary to-accent',
    bgColor: 'bg-primary/10'
  },
  capitalReadiness: { 
    icon: Wallet, 
    gradient: 'from-success to-primary',
    bgColor: 'bg-success/10'
  },
  ecosystemAlignment: { 
    icon: Globe, 
    gradient: 'from-accent to-primary',
    bgColor: 'bg-accent/10'
  },
  engagementEase: { 
    icon: Handshake, 
    gradient: 'from-warning to-primary',
    bgColor: 'bg-warning/10'
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-destructive';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

function ScoreCard({ breakdown, type }: { breakdown: ScoreBreakdown; type: keyof typeof scoreConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = scoreConfig[type];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
      >
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(breakdown.score)}`}>
                {breakdown.score}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-1">{breakdown.label}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {breakdown.description}
          </p>
          <Badge 
            variant={breakdown.score >= 60 ? 'default' : 'secondary'} 
            className="mt-2 text-xs"
          >
            {getScoreLabel(breakdown.score)}
          </Badge>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Info className="h-3 w-3" />
              <span>Score Breakdown</span>
            </div>
            {breakdown.factors.map((factor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{factor.name}</span>
                  <span className="text-primary">+{factor.contribution}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {factor.explanation}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
}

export function ScoresOverview({ scores }: ScoresOverviewProps) {
  return (
    <Card variant="glow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Intelligence Scores
          </CardTitle>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
              {scores.overall}
            </div>
            <p className="text-xs text-muted-foreground">Overall Score</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Deterministic scoring based on {Object.keys(scores).length - 2} categories
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreCard breakdown={scores.grantFit} type="grantFit" />
          <ScoreCard breakdown={scores.capitalReadiness} type="capitalReadiness" />
          <ScoreCard breakdown={scores.ecosystemAlignment} type="ecosystemAlignment" />
          <ScoreCard breakdown={scores.engagementEase} type="engagementEase" />
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <span className="font-medium">Last calculated:</span>{' '}
          {new Date(scores.calculatedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
