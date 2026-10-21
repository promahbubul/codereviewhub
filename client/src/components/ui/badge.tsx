import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    default: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    secondary: 'bg-slate-800 text-slate-300 border border-slate-700',
    outline: 'text-slate-300 border border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    destructive: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}
