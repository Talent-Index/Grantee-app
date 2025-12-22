import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border-transparent",
        primary: "bg-primary/20 text-primary border-primary/30",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        success: "bg-success/20 text-success border-success/30",
        warning: "bg-warning/20 text-warning border-warning/30",
        destructive: "bg-destructive/20 text-destructive border-destructive/30",
        outline: "border-border text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
