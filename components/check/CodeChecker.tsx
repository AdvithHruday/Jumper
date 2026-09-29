'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BOARDS, getBoard } from '@/content/boards';
import { SAMPLES } from '@/content/sketches/checker-samples';
import { PROJECTS } from '@/content/projects';
import { PARTS } from '@/content/parts';
import { lintSketch, type LintFinding, type LintSeverity } from '@/lib/sketch/lint';
import { expectedWiring } from '@/lib/sketch/wiring';

const LABEL: Record<LintSeverity, string> = { error: 'Problem', warning: 'Check this', info: 'Good to know' };
const TONE: Record<LintSeverity, string> = { error: 'text-bad', warning: 'text-ink', info: 'text-muted' };

const SELECT =
  'w-full rounded-[10px] bg-panel px-3 py-2.5 text-ink shadow-[inset_0_0_0_1.5px_var(--line-strong)]';

function FindingCard({ f }: { f: LintFinding }) {
  return (
    <article className="rounded-xl bg-panel p-4 shadow-[inset_0_0_0_1px_var(--line)]">
      <p className="m-0 flex flex-wrap items-baseline gap-x-3 text-[13px] font-bold uppercase tracking-wide">
        <span className={TONE[f.severity]}>{LABEL[f.severity]}</span>
        {f.line && <span className="text-muted">Line {f.line}</span>}
      </p>
      <p className="mb-0 mt-1.5">{f.message}</p>
      {f.link && (
        <p className="mb-0 mt-2 text-[15px]">
          <Link href={f.link.href} className="font-bold text-link underline">
            Open the {f.link.label}
          </Link>
        </p>
      )}
    </article>
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
            <label htmlFor="check-board" className="mb-1.5 block font-bold">
              Your board
            </label>
            <select id="check-board" value={boardId} onChange={(e) => pickBoard(e.target.value)} className={SELECT}>
              {BOARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="check-project" className="mb-1.5 block font-bold">
              Compare with a Jumper project
            </label>
            <select
              id="check-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={projects.length === 0}
              className={`${SELECT} disabled:opacity-60`}
            >
              <option value="">None</option>
              {projects.map(({ project }) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {board.family !== 'avr' && (
          <p className="mb-0 mt-2 text-[15px] text-muted">
            Jumper&apos;s guided projects are wired to an Arduino Uno, so comparing wiring is not available for this board yet.
          </p>
        )}

        <label htmlFor="check-code" className="mb-1.5 mt-5 block font-bold">
          Paste your sketch
        </label>
        <textarea
          id="check-code"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={16}
          spellCheck={false}
          placeholder={'void setup() {\n  pinMode(9, OUTPUT);\n}'}
          className="w-full rounded-xl bg-panel p-3 font-mono text-[14px] text-ink shadow-[inset_0_0_0_1.5px_var(--line-strong)]"
        />
        <div className="mt-3 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSource(SAMPLES[boardId]);
              if (board.family === 'avr' && projects[0]) setProjectId(projects[0].project.id);
            }}
            className="rounded-[10px] px-4 py-2.5 font-bold shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:bg-panel"
          >
            Try an example with bugs
          </button>
          {hasSource && (
            <button
              type="button"
              onClick={() => setSource('')}
              className="rounded-[10px] px-4 py-2.5 font-bold text-muted hover:bg-panel"
            >
              Clear
            </button>
          )}
        </div>
        <p className="mb-0 mt-3 text-[15px] text-muted">
          Your code stays in this browser. Nothing is uploaded.
        </p>
      </div>

      <div aria-live="polite" className="space-y-4">
        {!hasSource && <p className="m-0 text-muted">Paste a sketch to check its pins against the {board.name}.</p>}

        {hasSource && findings.length > 0 && (
          <p className="m-0 font-bold">{summary(findings)}</p>
        )}

        {findings.map((f, i) => (
          <FindingCard key={`${f.rule}-${f.line ?? 'x'}-${i}`} f={f} />
        ))}

        {hasSource && findings.length === 0 && (
          <article className="rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <h3 className="m-0 text-xl font-extrabold text-ok">No pin problems found</h3>
            <p className="mb-0 mt-1 text-muted">
              Every pin this sketch uses is valid on the {board.name}. That does not prove the sketch
              works: this checks pin use, not your logic, timing or wiring you have not told it about.
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
