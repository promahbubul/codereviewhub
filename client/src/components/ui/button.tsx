import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-white shadow-xs font-semibold',
        secondary: 'bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 border border-zinc-700/60',
        outline:
          'border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700',
        destructive: 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-800/60',
        success: 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800/60',
        ghost: 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100',
      },
      size: {
        default: 'h-9 px-3.5 py-1.5',
        sm: 'h-7 rounded px-2.5 text-xs',
        lg: 'h-10 rounded-md px-5 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
