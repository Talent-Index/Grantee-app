import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { validateConfig } from '@/lib/config';

export function ConfigWarning() {
  const { isValid, errors } = validateConfig();
  
  if (isValid) return null;
  
  return (
    <Card variant="glass" className="border-warning/50 bg-warning/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning mb-1">Configuration Required</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
