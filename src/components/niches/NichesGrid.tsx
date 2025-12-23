import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { NICHES, type BuilderNiche } from '@/data/niches';
import { cn } from '@/lib/utils';
import { 
  Coins, 
  Gamepad2, 
  Wrench, 
  Brain, 
  Heart, 
  Building2, 
  Smartphone, 
  Wallet, 
  CreditCard, 
  GraduationCap 
} from 'lucide-react';

interface NichesGridProps {
  selectedNicheId: string | null;
  onSelectNiche: (nicheId: string | null) => void;
}

const nicheIcons: Record<string, React.ElementType> = {
  'defi': Coins,
  'gaming': Gamepad2,
  'infra': Wrench,
  'ai-crypto': Brain,
  'public-goods': Heart,
  'rwa': Building2,
  'consumer': Smartphone,
  'wallets': Wallet,
  'payments': CreditCard,
  'education': GraduationCap,
};

export function NichesGrid({ selectedNicheId, onSelectNiche }: NichesGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {NICHES.map((niche, index) => {
        const Icon = nicheIcons[niche.id] || Wrench;
        const isSelected = selectedNicheId === niche.id;
        
        return (
          <motion.button
            key={niche.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
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
                'h-4 w-4',
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
            <div className="flex flex-wrap gap-1">
              {niche.tags.slice(0, 2).map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className={cn(
                    'text-[10px] px-1.5 py-0',
                    isSelected && 'border-primary/50'
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
