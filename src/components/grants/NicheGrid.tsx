import { motion } from 'framer-motion';
import { 
  Coins, 
  CreditCard, 
  Gamepad2, 
  Wrench, 
  Brain, 
  Users, 
  Building2, 
  Heart,
  type LucideIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BUILDER_NICHES } from '@/data/niches.seed';
import type { GrantOpportunity, BuilderNiche } from '@/types/grants';
import { countOpenGrantsForNiche } from '@/services/grants/grantsClient';
import { cn } from '@/lib/utils';

interface NicheGridProps {
  grants: GrantOpportunity[];
  selectedNicheId: string | null;
  onSelectNiche: (nicheId: string | null) => void;
}

const nicheIcons: Record<string, LucideIcon> = {
  'coins': Coins,
  'credit-card': CreditCard,
  'gamepad-2': Gamepad2,
  'wrench': Wrench,
  'brain': Brain,
  'users': Users,
  'building-2': Building2,
  'heart': Heart,
};

export function NicheGrid({ grants, selectedNicheId, onSelectNiche }: NicheGridProps) {
  return (
    <div className="mb-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">What are you building?</h2>
        <p className="text-muted-foreground">
          Jump into grants that match your focus area.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BUILDER_NICHES.map((niche, index) => {
          const Icon = nicheIcons[niche.icon] || Wrench;
          const isSelected = selectedNicheId === niche.id;
          const openCount = countOpenGrantsForNiche(grants, niche.tags);
          
          return (
            <motion.button
              key={niche.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => onSelectNiche(isSelected ? null : niche.id)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all duration-200',
                'hover:border-primary/50 hover:bg-secondary/50',
                isSelected 
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]' 
                  : 'border-border bg-card/50'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn(
                  'h-5 w-5',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'font-medium text-sm',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {niche.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {niche.description}
              </p>
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  openCount > 0 
                    ? 'text-success border-success/30' 
                    : 'text-muted-foreground'
                )}
              >
                {openCount} open
              </Badge>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
