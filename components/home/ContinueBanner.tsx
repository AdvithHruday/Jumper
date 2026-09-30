'use client';

import { ButtonLink } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { useProgress } from '@/lib/progress/store';
import { useHydrated } from '@/lib/progress/useHydrated';
import type { Project } from '@/lib/schema/content';

/**
 * For someone who has started a guided project: a slim bar to pick it up again.
 * It renders nothing for a first-time visitor, on the server, and until the
 * saved progress has been read, so the home page is never different between
 * server and client. It is a secondary button on purpose: the page's one
 * primary action is the hero's.
 */
export function ContinueBanner({ projects }: { projects: Project[] }) {
  const hydrated = useHydrated();
  const done = useProgress((s) => s.done);
  const at = useProgress((s) => s.at);

  if (!hydrated) return null;
  // The project they were last working through: the furthest one that has a
  // saved position and is not finished. (Projects arrive in build order.)
  const inProgress = projects.filter((p) => at[p.id] && !done[p.id]);
  const next = inProgress[inProgress.length - 1];
  if (!next) return null;
  const step = at[next.id];

  return (
    <Panel variant="subtle" padding="sm" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="m-0">
        <span className="font-bold">Welcome back.</span> You were on {next.name}, step {step}.
      </p>
      <ButtonLink href={`/learn/projects/${next.id}/${step}`} size="sm">
        Continue where you left off
      </ButtonLink>
    </Panel>
  );
}
