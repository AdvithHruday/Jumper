'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

/**
 * A quantity control. The buttons are 36px with a mouse and 44px on a touch
 * screen (`pointer-coarse`). Their labels ("Fewer LED", "More LED") name the
 * thing being counted so a screen reader hears more than "plus".
 */

const BTN =
  'inline-flex h-9 w-9 pointer-coarse:h-11 pointer-coarse:w-11 flex-none items-center justify-center rounded-control bg-panel text-ink shadow-[inset_0_0_0_1.5px_var(--border-ui)] hover:bg-panel-2 disabled:cursor-not-allowed disabled:opacity-40';

export function Stepper({ value, onChange, label, min = 0, max = 99, className }: {
  value: number;
  onChange: (next: number) => void;
  /** What is being counted, e.g. "5 mm LED". */
  label: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button type="button" aria-label={`Fewer ${label}`} className={BTN} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus aria-hidden size={18} />
      </button>
      <span aria-live="polite" className="w-7 text-center font-bold tabular-nums">
        {value}
      </span>
      <button type="button" aria-label={`More ${label}`} className={BTN} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus aria-hidden size={18} />
      </button>
    </div>
  );
}
