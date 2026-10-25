import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono tracking-tight transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
        secondary: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
        outline: 'text-zinc-300 border border-zinc-800',
        success: 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50',
        destructive: 'bg-rose-950/50 text-rose-300 border border-rose-800/50',
        warning: 'bg-amber-950/50 text-amber-300 border border-amber-800/50',
        info: 'bg-blue-950/50 text-blue-300 border border-blue-800/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const dotVariants = cva('h-1.5 w-1.5 rounded-full', {
  variants: {
    variant: {
      default: 'bg-zinc-400',
      secondary: 'bg-zinc-500',
      outline: 'bg-zinc-400',
      success: 'bg-emerald-400',
      destructive: 'bg-rose-400',
      warning: 'bg-amber-400',
      info: 'bg-blue-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={dotVariants({ variant })} />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
