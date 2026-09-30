import type { ComponentProps } from 'react';
import { cn } from '@/lib/ui/cn';

/**
 * A surface. `default` is the standard raised panel, `subtle` sits inside one,
 * and `highlight` is a yellow ring meaning "start here". Rings are inset
 * shadows, matching the rest of the app, so panels never change size.
 */

export type PanelVariant = 'default' | 'subtle' | 'highlight';
export type PanelPadding = 'none' | 'sm' | 'md';

const VARIANT: Record<PanelVariant, string> = {
  default: 'bg-panel shadow-[inset_0_0_0_1px_var(--line)]',
  subtle: 'bg-panel-2 shadow-[inset_0_0_0_1px_var(--line)]',
  highlight: 'bg-panel shadow-[inset_0_0_0_2px_var(--accent)]',
};

const PADDING: Record<PanelPadding, string> = { none: '', sm: 'p-3.5', md: 'p-5' };

export type PanelProps = ComponentProps<'div'> & {
  as?: 'div' | 'section' | 'article' | 'aside';
  variant?: PanelVariant;
  padding?: PanelPadding;
};

export function Panel({ as: Tag = 'div', variant = 'default', padding = 'md', className, ...rest }: PanelProps) {
  return <Tag className={cn('rounded-panel', VARIANT[variant], PADDING[padding], className)} {...rest} />;
}
