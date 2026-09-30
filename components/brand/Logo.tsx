import { MARK } from '@/lib/brand';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/ui/cn';

/**
 * The mark: a jumper wire bent into an omega (the ohm sign), a pin at each
 * end. The wire is the accent colour token, the pins take the text colour, so
 * it follows light and dark themes on its own. Decorative unless given a title.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={MARK.viewBox}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {title && <title>{title}</title>}
      <path
        d={MARK.path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={MARK.strokeWidth}
        strokeLinejoin="round"
      />
      <rect {...MARK.pinLeft} fill="currentColor" />
      <rect {...MARK.pinRight} fill="currentColor" />
    </svg>
  );
}

/** Mark plus wordmark, in the heading typeface. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-head text-2xl font-extrabold text-ink', className)}>
      <LogoMark className="h-7 w-auto" />
      {BRAND.name}
    </span>
  );
}
