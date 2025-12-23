import { motion } from 'framer-motion';
import { ExternalLink, Clock, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GrantOpportunity } from '@/types/grants';
import { formatGrantAmount } from '@/types/grants';
import { cn } from '@/lib/utils';

interface GrantOpportunityCardProps {
  grant: GrantOpportunity;
  index?: number;
}

const statusConfig = {
  open: { label: 'Open', className: 'bg-success/20 text-success border-success/30' },
  rolling: { label: 'Rolling', className: 'bg-primary/20 text-primary border-primary/30' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-border' },
};

const ecosystemColors: Record<string, string> = {
  'Ethereum': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Avalanche': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Polygon': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Arbitrum': 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  'Optimism': 'bg-red-400/20 text-red-300 border-red-400/30',
  'Base': 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  'Solana': 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-teal-400 border-teal-500/30',
  'Starknet': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Multi-chain': 'bg-primary/20 text-primary border-primary/30',
};

export function GrantOpportunityCard({ grant, index = 0 }: GrantOpportunityCardProps) {
  const status = statusConfig[grant.status];
  const ecosystemClass = ecosystemColors[grant.ecosystem] || 'bg-secondary text-foreground border-border';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Card className="h-full flex flex-col hover:border-primary/30 transition-all duration-200 group">
        <CardContent className="flex-1 pt-5 pb-4">
          {/* Status & Ecosystem Pills */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={cn('text-xs font-medium', status.className)}
            >
              {status.label}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn('text-xs', ecosystemClass)}
            >
              {grant.ecosystem}
            </Badge>
          </div>

          {/* Title & Org */}
          <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors">
            {grant.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {grant.organization}
          </p>

          {/* Description */}
          <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-4">
            {grant.shortDescription}
          </p>

          {/* Amount & Deadline */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success shrink-0" />
              <span className="font-medium text-success">
                {formatGrantAmount(grant.minAmountUsd, grant.maxAmountUsd)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {grant.isRolling ? (
                <>
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>Rolling applications</span>
                </>
              ) : grant.deadline ? (
                <>
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Deadline: {grant.deadline}</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>Open applications</span>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {grant.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {grant.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                +{grant.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // Could open a modal with full details
              window.open(grant.applyUrl, '_blank');
            }}
          >
            View Details
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90"
            asChild
          >
            <a href={grant.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
