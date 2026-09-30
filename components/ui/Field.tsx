import type { ComponentProps } from 'react';
import { cn } from '@/lib/ui/cn';

/**
 * Form controls. Borders use --border-ui (3:1 against the page and panels);
 * the decorative --line tokens are too faint to mark a control.
 */

const CONTROL =
  'w-full rounded-control bg-panel px-3 py-2.5 text-ink shadow-[inset_0_0_0_1.5px_var(--border-ui)] disabled:cursor-not-allowed disabled:opacity-60';

export function Label({ className, ...rest }: ComponentProps<'label'>) {
  return <label className={cn('mb-1.5 block font-bold', className)} {...rest} />;
}

export function Select({ className, ...rest }: ComponentProps<'select'>) {
  return <select className={cn(CONTROL, className)} {...rest} />;
}

export function Textarea({ mono, className, ...rest }: ComponentProps<'textarea'> & { mono?: boolean }) {
  return <textarea className={cn(CONTROL, mono && 'font-mono text-small', className)} {...rest} />;
}

export function Checkbox({ className, ...rest }: Omit<ComponentProps<'input'>, 'type'>) {
  return <input type="checkbox" className={cn('h-5 w-5 flex-none accent-ink', className)} {...rest} />;
}
