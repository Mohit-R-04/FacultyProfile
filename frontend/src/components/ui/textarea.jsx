import React from 'react';
import { cn } from '../../lib/utils';

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      className={cn('flex min-h-[80px] w-full rounded-md border border-input/60 bg-background/60 px-3 py-2 text-sm ring-offset-background backdrop-blur-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)}
      ref={ref}
      {...props}
    />
  );
});

export default Textarea;
