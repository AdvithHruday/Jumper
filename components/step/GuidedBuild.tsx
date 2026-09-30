'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Scene } from '@/components/diagram/Scene';
import { WIRE_COLORS } from '@/components/diagram/Wire';
import { StepPanel } from './StepPanel';
import { useProgress } from '@/lib/progress/store';
import type { Part, Project } from '@/lib/schema/content';

/**
 * The guided build view (spec 7.2): diagram on the left and sticky, step panel
 * on the right. On mobile the diagram is sticky at the top instead.
 */
export function GuidedBuild({
  project,
  stepIndex,
  parts,
  nextProject,
}: {
  project: Project;
  stepIndex: number;
  parts: Record<string, Part>;
  nextProject?: { id: string; name: string };
}) {
  const [zoom, setZoom] = useState(true);
  const [pressed, setPressed] = useState(false);
  const [pressedStep, setPressedStep] = useState(stepIndex);
  const visit = useProgress((s) => s.visit);
  const step = project.steps[stepIndex];

  useEffect(() => {
    visit(project.id, stepIndex + 1);
  }, [visit, project.id, stepIndex]);

  // A press only makes sense on the step that asks for one. Adjusting state
  // during render (rather than in an effect) drops the press in the same pass
  // that changes step, so the new step never paints as already pressed.
  if (pressedStep !== stepIndex) {
    setPressedStep(stepIndex);
    setPressed(false);
  }

  return (
    <div className="grid items-start gap-6 pb-12 pt-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(330px,1fr)]">
      <div className="sticky top-0 z-[5] -mx-4 min-w-0 bg-bg px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+6px)] lg:top-3 lg:mx-0 lg:bg-transparent lg:p-0">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
          <nav aria-label="Breadcrumb" className="text-small text-muted">
            <Link href="/" className="text-muted underline-offset-2 hover:underline">
              Projects
            </Link>{' '}
            / <h1 className="m-0 inline font-body text-small font-bold tracking-normal text-ink">{project.name}</h1>
          </nav>
          {project.usesBreadboard && (
            <Button size="sm" onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>
              {zoom ? 'Show whole board' : 'Zoom to this step'}
            </Button>
          )}
        </div>

        <div className="mat">
          <Scene project={project} stepIndex={stepIndex} parts={parts} zoom={zoom} pressed={pressed} />
        </div>

        {step?.interactive && (
          <div className="mt-2.5">
            <Button
              variant="primary"
              size="sm"
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') setPressed(true);
              }}
              onKeyUp={() => setPressed(false)}
            >
              Press and hold the button
            </Button>
          </div>
        )}

        {project.usesBreadboard && (
          <div className="mt-2.5 hidden flex-wrap gap-3.5 px-1 text-[13px] text-muted lg:flex">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-[5px] w-[18px] rounded-[3px]" style={{ background: WIRE_COLORS.red }} />
              Power (5V)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-[5px] w-[18px] rounded-[3px]" style={{ background: WIRE_COLORS.black }} />
              Ground (GND)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
              This step
            </span>
          </div>
        )}
      </div>

      <StepPanel project={project} stepIndex={stepIndex} nextProject={nextProject} />
    </div>
  );
}
