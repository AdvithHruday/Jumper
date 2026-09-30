import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

/** A small label: a tag on a project, a "by hand" marker, a finding's severity. */

export type BadgeTone = 'neutral' | 'ok' | 'bad' | 'warn' | 'info';

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-panel-2 text-muted shadow-[inset_0_0_0_1px_var(--line-strong)]',
  ok: 'bg-ok-soft text-ok',
  bad: 'bg-bad-soft text-bad',
  warn: 'bg-warn-soft text-warn',
  info: 'bg-info-soft text-link',
};

export function Badge({ tone = 'neutral', icon: Icon, className, children }: {
  tone?: BadgeTone;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-bold', TONE[tone], className)}>
      {Icon && <Icon aria-hidden size={14} />}
      {children}
    </span>
  );
}

export type Severity = 'error' | 'warning' | 'info' | 'ok';

const SEVERITY: Record<Severity, { tone: BadgeTone; icon: LucideIcon; label: string }> = {
  error: { tone: 'bad', icon: CircleAlert, label: 'Problem' },
  warning: { tone: 'warn', icon: TriangleAlert, label: 'Check this' },
  info: { tone: 'info', icon: Info, label: 'Note' },
  ok: { tone: 'ok', icon: CircleCheck, label: 'Passed' },
};

/**
 * Severity as icon + word + colour. Colour alone fails for colour-blind
 * readers, so the word is always present.
 */
export function SeverityBadge({ severity, label }: { severity: Severity; label?: string }) {
  const s = SEVERITY[severity];
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {label ?? s.label}
    </Badge>
  );
}
