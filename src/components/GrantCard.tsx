import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Building2, DollarSign } from 'lucide-react';
import type { Grant } from '@/data/grants';
import { devLog } from '@/lib/config';

interface GrantCardProps {
  grant: Grant;
  index?: number;
  recommended?: boolean;
}

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  defi: 'primary',
  infrastructure: 'success',
  tooling: 'warning',
  nft: 'destructive',
  gaming: 'destructive',
  social: 'primary',
  dao: 'success',
  other: 'secondary',
};

const grantTypeLabels: Record<string, string> = {
  grant: 'Grant',
  bounty: 'Bounty',
  retroactive: 'Retro PGF',
  'equity-free': 'Equity-Free',
  accelerator: 'Accelerator',
};

export function GrantCard({ grant, index = 0, recommended = false }: GrantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        variant={recommended ? 'glow' : 'default'} 
        className="h-full flex flex-col hover:border-primary/30 transition-colors"
      >
        <CardContent className="flex-1 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {recommended && (
                  <Badge variant="primary" className="text-xs">
                    Recommended
                  </Badge>
                )}
                {grant.featured && !recommended && (
                  <Badge variant="warning" className="text-xs">
                    Featured
                  </Badge>
                )}
                <Badge variant={categoryColors[grant.category] || 'secondary'}>
                  {grant.category}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg leading-tight mb-1">
                {grant.title}
              </h3>
            </div>
          </div>

          {/* Organization */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Building2 className="h-4 w-4" />
            <span>{grant.organization}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {grant.description}
          </p>

          {/* Meta */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="font-medium text-success">{grant.amount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Deadline: {grant.deadline}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {grant.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {grant.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{grant.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Grant Type & Ecosystem */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span className="capitalize">{grant.ecosystem}</span>
            <span>•</span>
            <span>{grantTypeLabels[grant.grantType]}</span>
            <span>•</span>
            <span className="capitalize">{grant.region}</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            asChild
            onClick={() => devLog(`grant-apply-${grant.id}`)}
          >
            <a href={grant.link} target="_blank" rel="noopener noreferrer">
              Apply Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
