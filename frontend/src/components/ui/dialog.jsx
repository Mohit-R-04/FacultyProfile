import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-sm', className)}
      {...props}
    />
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn('fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border/60 bg-background/70 p-6 shadow-2xl backdrop-blur-md supports-[backdrop-filter]:bg-background/60 max-h-[90vh] overflow-y-auto', className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-4 flex flex-col space-y-1.5', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
