import React from 'react';
import { cn } from '../../lib/utils';

const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm';
const variants = {
  default: 'bg-primary/90 text-primary-foreground hover:bg-primary/80 h-10 px-4 py-2 shadow-md',
  secondary: 'bg-secondary/70 text-secondary-foreground hover:bg-secondary/60 h-10 px-4 py-2 border border-border shadow-sm',
  ghost: 'hover:bg-accent/50 hover:text-accent-foreground h-10 px-4 py-2',
  destructive: 'bg-destructive/90 text-destructive-foreground hover:bg-destructive/80 h-10 px-4 py-2 shadow-md',
  outline: 'border border-input/70 bg-background/60 hover:bg-accent/50 hover:text-accent-foreground h-10 px-4 py-2 backdrop-blur-sm',
  icon: 'h-10 w-10',
};

export function Button({ className, variant = 'default', asChild, ...props }) {
  const Comp = asChild ? 'span' : 'button';
  return <Comp className={cn(base, variants[variant], className)} {...props} />;
}

export default Button;


