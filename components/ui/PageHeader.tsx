import type { ReactNode } from 'react';

/**
 * The top of a page: the only h1, a one-line promise, and where the primary
 * action goes. Every page had an h2 and a tagline pushed to the far right; this
 * gives each page a proper heading level and one focal point.
 */
export function PageHeader({ title, description, eyebrow, actions }: {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b-2 border-ink pb-4 pt-3">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="m-0 mb-1 text-caption font-bold uppercase tracking-wide text-muted">{eyebrow}</p>
          )}
          <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-extrabold">{title}</h1>
          {description && <p className="mb-0 mt-1.5 max-w-[62ch] text-body text-muted">{description}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}
