'use client';

import { RotateCcw } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { Button, ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

/**
 * Shown when a page throws while rendering. Says whose fault it is, offers the
 * one thing that can help (try again), and gives a reference to quote if it keeps
 * happening. It never shows a stack trace.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <PageHeader
        eyebrow="Something broke"
        title="That did not work"
        description="This is a fault in the app, not something you did. Try again, and if it keeps happening, please tell us."
      />
      <div className="my-6 flex flex-wrap gap-3">
        <Button variant="primary" icon={RotateCcw} onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href={`${BRAND.repoUrl}/issues`} variant="ghost" target="_blank" rel="noopener noreferrer">
          Report it
        </ButtonLink>
      </div>
      {error.digest && (
        <p className="m-0 text-small text-muted">
          If you report it, include this reference: <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </>
  );
}
