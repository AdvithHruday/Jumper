import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

/**
 * A message that stands apart from the page: something to know, watch for, fix
 * or celebrate. The icon and the tint are backup, never the only signal; the
 * text says what it is. Use `role="alert"` only for something that appears
 * because of a user action, `role="status"` for a quiet confirmation.
 */

export type CalloutVariant = 'info' | 'warning' | 'error' | 'success';

const STYLE: Record<CalloutVariant, { icon: LucideIcon; box: string; tone: string }> = {
  info: { icon: Info, box: 'bg-info-soft shadow-[inset_0_0_0_1px_var(--link)]', tone: 'text-link' },
  warning: { icon: TriangleAlert, box: 'bg-warn-soft shadow-[inset_0_0_0_1px_var(--warn)]', tone: 'text-warn' },
  error: { icon: CircleAlert, box: 'bg-bad-soft shadow-[inset_0_0_0_1px_var(--bad)]', tone: 'text-bad' },
  success: { icon: CircleCheck, box: 'bg-ok-soft shadow-[inset_0_0_0_1px_var(--ok)]', tone: 'text-ok' },
};

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  role?: 'alert' | 'status';
  className?: string;
  children?: ReactNode;
}

export function Callout({ variant = 'info', title, role, className, children }: CalloutProps) {
  const { icon: Icon, box, tone } = STYLE[variant];
  return (
    <div role={role} className={cn('flex gap-3 rounded-panel p-3.5 text-ink', box, className)}>
      <Icon aria-hidden size={20} className={cn('mt-0.5 flex-none', tone)} />
      <div className="min-w-0 text-small">
        {title && <p className="m-0 font-bold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
      </div>
    </div>
  );
}
