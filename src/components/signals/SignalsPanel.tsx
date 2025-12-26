import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  Code2, 
  FileText, 
  Rocket,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import type { RawSignal, SignalCategory } from '@/lib/signals/types';

interface SignalsPanelProps {
  signals: RawSignal[];
}

const categoryConfig: Record<SignalCategory, { icon: typeof Activity; label: string; color: string }> = {
  activity: { icon: Activity, label: 'Activity', color: 'text-primary' },
  community: { icon: Users, label: 'Community', color: 'text-accent' },
  code_quality: { icon: Code2, label: 'Code Quality', color: 'text-success' },
  documentation: { icon: FileText, label: 'Documentation', color: 'text-warning' },
  deployment: { icon: Rocket, label: 'Deployment', color: 'text-primary' },
  team: { icon: Users, label: 'Team', color: 'text-accent' },
};

function getStrengthIndicator(value: number) {
  if (value >= 0.7) return { icon: TrendingUp, color: 'text-success', label: 'Strong' };
  if (value >= 0.4) return { icon: Minus, color: 'text-warning', label: 'Moderate' };
  return { icon: TrendingDown, color: 'text-destructive', label: 'Weak' };
}

export function SignalsPanel({ signals }: SignalsPanelProps) {
  // Group signals by category
  const groupedSignals = signals.reduce((acc, signal) => {
    if (!acc[signal.category]) {
      acc[signal.category] = [];
    }
    acc[signal.category].push(signal);
    return acc;
  }, {} as Record<SignalCategory, RawSignal[]>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Signal Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {signals.length} signals collected from your repository
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedSignals).map(([category, categorySignals]) => {
          const config = categoryConfig[category as SignalCategory];
          const Icon = config.icon;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span className="text-sm font-medium">{config.label}</span>
                <Badge variant="secondary" className="ml-auto">
                  {categorySignals.length}
                </Badge>
              </div>

              <div className="grid gap-3">
                {categorySignals.map((signal) => {
                  const strength = getStrengthIndicator(signal.normalizedValue);
                  const StrengthIcon = strength.icon;

                  return (
                    <div
                      key={signal.key}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{signal.label}</span>
                        <div className="flex items-center gap-1.5">
                          <StrengthIcon className={`h-3 w-3 ${strength.color}`} />
                          <span className={`text-xs ${strength.color}`}>
                            {strength.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {signal.description}
                      </p>
                      <Progress 
                        value={signal.normalizedValue * 100} 
                        className="h-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
