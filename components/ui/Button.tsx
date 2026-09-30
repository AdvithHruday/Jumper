import Link from 'next/link';
import type { ComponentProps } from 'react';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

/**
 * The one button. Yellow (`primary`) means "do this now", so a screen should
 * have at most one. Height is 44px (Apple HIG, WCAG 2.5.5 AAA); `sm` is 36px
 * for dense rows and still clears the WCAG 2.5.8 AA floor of 24px.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success';
export type ButtonSize = 'md' | 'sm';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-control font-bold transition-[filter,background-color] duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:brightness-105',
  secondary: 'bg-panel text-ink shadow-[inset_0_0_0_1.5px_var(--border-ui)] hover:bg-panel-2',
  ghost: 'text-muted hover:bg-panel hover:text-ink',
  success: 'bg-ok text-on-ok hover:brightness-105',
};

const SIZE: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4.5 py-2.5 text-small',
  sm: 'min-h-9 px-3 py-1.5 text-small',
};

export function buttonClasses(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  const { variant = 'secondary', size = 'md', className } = opts;
  return cn(BASE, VARIANT[variant], SIZE[size], className);
}

interface Shared {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** A Lucide icon shown before the label. Decorative; the label carries the meaning. */
  icon?: LucideIcon;
}

export type ButtonProps = Shared & ComponentProps<'button'> & { loading?: boolean };

export function Button({ variant, size, icon: Icon, loading, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {loading ? (
        <LoaderCircle aria-hidden size={18} className="motion-safe:animate-spin" />
      ) : (
        Icon && <Icon aria-hidden size={18} />
      )}
      {children}
    </button>
  );
}

export type ButtonLinkProps = Shared & ComponentProps<typeof Link>;

/** A link that looks like a button, for navigation. Use `Button` for actions. */
export function ButtonLink({ variant, size, icon: Icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...rest}>
      {Icon && <Icon aria-hidden size={18} />}
      {children}
    </Link>
  );
}
