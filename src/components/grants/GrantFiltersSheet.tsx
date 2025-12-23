import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { GrantOpportunity, GrantStatus } from '@/types/grants';

export interface GrantFilters {
  status: GrantStatus[];
  ecosystems: string[];
  tags: string[];
  minAmount?: number;
  maxAmount?: number;
}

interface GrantFiltersSheetProps {
  grants: GrantOpportunity[];
  filters: GrantFilters;
  onFiltersChange: (filters: GrantFilters) => void;
  trigger: React.ReactNode;
}

export function GrantFiltersSheet({
  grants,
  filters,
  onFiltersChange,
  trigger,
}: GrantFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<GrantFilters>(filters);

  // Extract unique values from grants
  const availableEcosystems = useMemo(() => 
    [...new Set(grants.map(g => g.ecosystem))].sort(),
    [grants]
  );

  const availableTags = useMemo(() => 
    [...new Set(grants.flatMap(g => g.tags))].sort(),
    [grants]
  );

  const statusOptions: { value: GrantStatus; label: string }[] = [
    { value: 'open', label: 'Open' },
    { value: 'rolling', label: 'Rolling' },
    { value: 'closed', label: 'Closed' },
  ];

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const cleared: GrantFilters = {
      status: [],
      ecosystems: [],
      tags: [],
      minAmount: undefined,
      maxAmount: undefined,
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const toggleStatus = (status: GrantStatus) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status],
    }));
  };

  const toggleEcosystem = (ecosystem: string) => {
    setLocalFilters(prev => ({
      ...prev,
      ecosystems: prev.ecosystems.includes(ecosystem)
        ? prev.ecosystems.filter(e => e !== ecosystem)
        : [...prev.ecosystems, ecosystem],
    }));
  };

  const toggleTag = (tag: string) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const activeCount = 
    localFilters.status.length + 
    localFilters.ecosystems.length + 
    localFilters.tags.length +
    (localFilters.minAmount ? 1 : 0) +
    (localFilters.maxAmount ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Grants</SheetTitle>
          <SheetDescription>
            Narrow down grants by status, ecosystem, tags, and amount.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Status */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Status</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleStatus(value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    localFilters.status.includes(value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent border-border hover:border-primary/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Ecosystems */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Ecosystem</Label>
            <div className="flex flex-wrap gap-2">
              {availableEcosystems.map(ecosystem => (
                <button
                  key={ecosystem}
                  onClick={() => toggleEcosystem(ecosystem)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    localFilters.ecosystems.includes(ecosystem)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent border-border hover:border-primary/50'
                  }`}
                >
                  {ecosystem}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Tags</Label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    localFilters.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent border-border hover:border-primary/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Amount Range (USD)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.minAmount || ''}
                onChange={e => setLocalFilters(prev => ({
                  ...prev,
                  minAmount: e.target.value ? Number(e.target.value) : undefined,
                }))}
                className="flex-1"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.maxAmount || ''}
                onChange={e => setLocalFilters(prev => ({
                  ...prev,
                  maxAmount: e.target.value ? Number(e.target.value) : undefined,
                }))}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={handleClear} disabled={activeCount === 0}>
            Clear All
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
