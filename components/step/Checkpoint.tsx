'use client';

import { Button, ButtonLink } from '@/components/ui/Button';
import { InlineText } from './Body';
import { useProgress, checkpointKey } from '@/lib/progress/store';
import { useHydrated } from '@/lib/progress/useHydrated';
import { playSuccess, playTrouble, playPop } from '@/lib/sounds';
import type { Checkpoint as CheckpointData, Project } from '@/lib/schema/content';

/**
 * The checkpoint (spec 7.2): yes / no, then ordered fixes, then "It works now".
 *
 * Fixes are shown in content order, which content rules require to be
 * most-likely-first. Nothing here reorders or filters them.
 */
export function Checkpoint({
  checkpoint,
  project,
  stepIndex,
  isLast,
  nextProject,
}: {
  checkpoint: CheckpointData;
  project: Project;
  stepIndex: number;
  isLast: boolean;
  nextProject?: { id: string; name: string };
}) {
  const hydrated = useHydrated();
  const key = checkpointKey(project.id, stepIndex);
  const answer = useProgress((s) => s.checkpoints[key]);
  const setAnswer = useProgress((s) => s.answer);
  const complete = useProgress((s) => s.complete);

  // Until the store has hydrated we do not know what was answered before, so
  // render the unanswered state on both server and client.
  const shown = hydrated ? answer : undefined;

  function say(value: 'yes' | 'no') {
    setAnswer(project.id, stepIndex, value);
    if (value === 'yes') {
      playSuccess();
      if (isLast) complete(project.id);
    } else {
      playTrouble();
    }
  }

  const ring =
    shown === 'yes'
      ? 'shadow-[inset_0_0_0_2px_var(--ok)]'
      : shown === 'no'
        ? 'shadow-[inset_0_0_0_2px_var(--accent)]'
        : 'shadow-[inset_0_0_0_2px_var(--line)]';

  return (
    <div className={`my-4 rounded-xl p-4 ${ring}`} data-testid="checkpoint">
      <p className="mb-3 font-bold">
        <InlineText text={checkpoint.question} />
      </p>

      {!shown && (
        <div className="flex flex-wrap gap-2.5">
          <Button variant="success" onClick={() => say('yes')}>
            Yes, it works
          </Button>
          <Button onClick={() => say('no')}>No, something&apos;s off</Button>
        </div>
      )}

      <div className="mt-3.5" aria-live="polite">
        {shown === 'yes' && (
          <>
            <p className="font-bold text-ok">
              <InlineText text={checkpoint.success} />
            </p>
            {isLast && (
              <>
                <p className="mt-2.5">Project complete.</p>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {nextProject ? (
                    <ButtonLink href={`/learn/projects/${nextProject.id}/1`} variant="primary" onClick={() => playPop()}>
                      Next project: {nextProject.name}
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/learn" variant="primary">
                      See all projects
                    </ButtonLink>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {shown === 'no' && (
          <>
            <p className="mb-2.5">Work through these in order. Most problems are found in the first two.</p>
            <ol className="mb-3.5 list-decimal pl-6" data-testid="fixes">
              {checkpoint.fixes.map((fix, i) => (
                <li key={i} className="mb-2.5 pl-1">
                  <b className="block">{fix.title}</b>
                  <span className="text-muted">
                    <InlineText text={fix.detail} />
                  </span>
                  {fix.test && (
                    <span className="mt-1 block text-muted italic">
                      Try this: <InlineText text={fix.test} />
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <Button variant="success" onClick={() => say('yes')}>
              It works now
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
