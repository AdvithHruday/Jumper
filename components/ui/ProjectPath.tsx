'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { useProgress } from '@/lib/progress/store';
import { useHydrated } from '@/lib/progress/useHydrated';
import type { Project } from '@/lib/schema/content';

/**
 * The project path (spec 9): a numbered list with dividers, not a grid of
 * cards. Order matters here — each project uses a skill from the one before.
 */
export function ProjectPath({ projects }: { projects: Project[] }) {
  const hydrated = useHydrated();
  const done = useProgress((s) => s.done);
  const at = useProgress((s) => s.at);

  return (
    <ol className="m-0 mb-10 list-none p-0">
      {projects.map((p) => {
        const isDone = hydrated && !!done[p.id];
        const resume = hydrated ? at[p.id] : undefined;
        return (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}/${!isDone && resume ? resume : 1}`}
              className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3.5 rounded border-b border-line px-2 py-5 hover:bg-panel sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-5"
            >
              <span
                aria-hidden="true"
                className={`text-center font-head text-[32px] font-extrabold leading-none sm:text-[44px] ${isDone ? 'text-ok' : 'text-line-strong'}`}
              >
                {p.order}
              </span>
              <span>
                <h3 className="text-[22px] font-extrabold">{p.name}</h3>
                <p className="mb-2 mt-1 text-muted">{p.summary}</p>
                <span className="flex flex-wrap gap-1.5">
                  {p.learn.map((l) => (
                    <Badge key={l}>{l}</Badge>
                  ))}
                </span>
              </span>
              <span
                className={`col-start-2 whitespace-nowrap text-sm font-bold sm:col-start-3 ${isDone ? 'text-ok' : 'text-muted'}`}
              >
                {isDone ? 'Done ✓' : resume ? `Continue at step ${resume}` : `${p.minutes} min`}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** The hero's primary action: start, or pick up where the student left off. */
export function ContinueButton({ projects }: { projects: Project[] }) {
  const hydrated = useHydrated();
  const done = useProgress((s) => s.done);
  const at = useProgress((s) => s.at);

  const next = projects.find((p) => !(hydrated && done[p.id]));
  const started = hydrated && Object.keys(at).length > 0;

  if (!next) {
    return (
      <ButtonLink href={`/projects/${projects[projects.length - 1].id}/1`} variant="primary">
        Build them again
      </ButtonLink>
    );
  }

  return (
    <ButtonLink href={`/projects/${next.id}/${(hydrated && at[next.id]) || 1}`} variant="primary">
      {started ? `Continue: ${next.name}` : 'Start with setup'}
    </ButtonLink>
  );
}

export function ResetProgress() {
  const reset = useProgress((s) => s.reset);
  return (
    <button
      type="button"
      className="border-0 bg-transparent p-0 text-sm text-link underline"
      onClick={() => {
        if (confirm('Clear your saved progress for all projects?')) reset();
      }}
    >
      Reset progress
    </button>
  );
}
