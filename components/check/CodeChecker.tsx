'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bug, Eraser } from 'lucide-react';
import { BOARDS, getBoard } from '@/content/boards';
import { SAMPLES } from '@/content/sketches/checker-samples';
import { PROJECTS } from '@/content/projects';
import { PARTS } from '@/content/parts';
import { SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Label, Select, Textarea } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { lintSketch, type LintFinding, type LintSeverity } from '@/lib/sketch/lint';
import { expectedWiring } from '@/lib/sketch/wiring';

function FindingCard({ f }: { f: LintFinding }) {
  return (
    <Panel as="article" padding="sm">
      <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1">
        <SeverityBadge severity={f.severity} />
        {f.line && <span className="text-caption font-bold uppercase tracking-wide text-muted">Line {f.line}</span>}
      </p>
      <p className="mb-0 mt-2">{f.message}</p>
      {f.link && (
        <p className="mb-0 mt-2 text-small">
          <Link href={f.link.href} className="font-bold text-link underline">
            Open {f.link.label}
          </Link>
        </p>
      )}
    </Panel>
  );
}

function summary(findings: LintFinding[]): string {
  const n = (s: LintSeverity) => findings.filter((f) => f.severity === s).length;
  const parts = [
    n('error') && `${n('error')} problem${n('error') > 1 ? 's' : ''}`,
    n('warning') && `${n('warning')} to check`,
    n('info') && `${n('info')} note${n('info') > 1 ? 's' : ''}`,
  ].filter(Boolean);
  return parts.join(', ');
}

export function CodeChecker() {
  const [boardId, setBoardId] = useState('uno');
  const [projectId, setProjectId] = useState('');
  const [source, setSource] = useState('');

  const board = getBoard(boardId)!;

  // Guide projects are wired to an Uno, so they apply to the AVR boards only.
  const projects = useMemo(
    () =>
      board.family === 'avr'
        ? PROJECTS.flatMap((p) => {
            const wiring = expectedWiring(p, PARTS);
            return wiring ? [{ project: p, wiring }] : [];
          })
        : [],
    [board.family],
  );
  const wiring = projects.find((p) => p.project.id === projectId)?.wiring;

  const findings = useMemo(() => lintSketch(source, board, { wiring }), [source, board, wiring]);
  const hasSource = source.trim().length > 0;

  function pickBoard(id: string) {
    setBoardId(id);
    if (getBoard(id)!.family !== 'avr') setProjectId('');
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="check-board">Your board</Label>
            <Select id="check-board" value={boardId} onChange={(e) => pickBoard(e.target.value)}>
              {BOARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="check-project">Compare with a guided project</Label>
            <Select
              id="check-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={projects.length === 0}
            >
              <option value="">None</option>
              {projects.map(({ project }) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {board.family !== 'avr' && (
          <p className="mb-0 mt-2 text-small text-muted">
            The guided projects are wired to an Arduino Uno, so comparing wiring is not available for this board yet.
          </p>
        )}

        <Label htmlFor="check-code" className="mt-5">
          Paste your sketch
        </Label>
        <Textarea
          id="check-code"
          mono
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={16}
          spellCheck={false}
          placeholder={'void setup() {\n  pinMode(9, OUTPUT);\n}'}
        />
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Button
            icon={Bug}
            onClick={() => {
              setSource(SAMPLES[boardId]);
              if (board.family === 'avr' && projects[0]) setProjectId(projects[0].project.id);
            }}
          >
            Try an example with bugs
          </Button>
          {hasSource && (
            <Button variant="ghost" icon={Eraser} onClick={() => setSource('')}>
              Clear
            </Button>
          )}
        </div>
        <p className="mb-0 mt-3 text-small text-muted">Your code stays in this browser. Nothing is uploaded.</p>
      </div>

      <div aria-live="polite" className="space-y-4">
        {!hasSource && <p className="m-0 text-muted">Paste a sketch to check its pins against the {board.name}.</p>}

        {hasSource && findings.length > 0 && <p className="m-0 font-bold">{summary(findings)}</p>}

        {findings.map((f, i) => (
          <FindingCard key={`${f.rule}-${f.line ?? 'x'}-${i}`} f={f} />
        ))}

        {hasSource && findings.length === 0 && (
          <Callout variant="success" title="No pin problems found">
            Every pin this sketch uses is valid on the {board.name}. That does not prove the sketch works: this checks
            pin use, not your logic, timing or wiring you have not told it about.
          </Callout>
        )}
      </div>
    </div>
  );
}
