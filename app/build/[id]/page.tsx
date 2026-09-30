import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Layers } from 'lucide-react';
import { CodeBlock } from '@/components/step/CodeBlock';
import { ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { PageHeader } from '@/components/ui/PageHeader';
import { LIBRARY, ITEMS_BY_ID, getLibraryProject } from '@/content/library';

export function generateStaticParams() {
  return LIBRARY.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getLibraryProject(id);
  return p ? { title: p.name } : {};
}

const LEVEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const;

const H2 = 'mb-2 mt-8 border-b border-line pb-1.5 text-xl font-extrabold';

export default async function BuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getLibraryProject(id);
  if (!p) notFound();

  return (
    <article className="pb-12 pt-3">
      <ButtonLink href="/build" variant="ghost" size="sm" icon={ArrowLeft} className="-ml-3">
        All builds
      </ButtonLink>
      <PageHeader
        eyebrow={`${LEVEL[p.difficulty]} · about ${p.minutes} min`}
        title={p.name}
        description={p.summary}
      />

      {!p.verified && (
        <Callout variant="warning" title="Not built on real hardware yet" className="mt-4">
          The pins in the wiring and the sketch are checked against each other and the board, but nobody has tried this
          build. Read it against your parts, and tell us if something is wrong.
        </Callout>
      )}

      {p.warnings && (
        <div className="mt-3 grid gap-3">
          {p.warnings.map((w) => (
            <Callout key={w} variant="warning">
              {w}
            </Callout>
          ))}
        </div>
      )}

      <h2 className={H2}>What you need</h2>
      <ul className="m-0 list-disc space-y-1 pl-5">
        {p.requires.map((r) => (
          <li key={r.label}>
            {r.label}
            {r.oneOf.length > 1 && (
              <span className="text-muted"> (any of: {r.oneOf.map((i) => ITEMS_BY_ID[i]?.name ?? i).join(', ')})</span>
            )}
          </li>
        ))}
      </ul>
      {p.libraries && (
        <p className="mb-0 mt-3">
          <span className="font-bold">Install from the Library Manager: </span>
          {p.libraries.join(', ')}
        </p>
      )}

      <h2 className={H2}>Wiring</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink text-caption uppercase tracking-wide text-muted">
              <th scope="col" className="py-2 pr-4 font-bold">Board pin</th>
              <th scope="col" className="py-2 pr-4 font-bold">Connects to</th>
              <th scope="col" className="py-2 font-bold">Through</th>
            </tr>
          </thead>
          <tbody>
            {p.wiring.map((w, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-2 pr-4 font-mono font-bold">{w.board}</td>
                <td className="py-2 pr-4">{w.part}</td>
                <td className="py-2 text-muted">{w.via ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className={H2}>Build it</h2>
      <ol className="m-0 list-decimal space-y-2 pl-5">
        {p.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h2 className={H2}>The sketch</h2>
      <CodeBlock file={p.code.file} source={p.code.source} />
      <p className="mt-0 text-small text-muted">
        Changed something? Paste your version into{' '}
        <Link href="/check" className="font-bold text-link underline">
          Check my code
        </Link>{' '}
        to catch pin mistakes.
      </p>

      <h2 className={H2}>If it does not work</h2>
      <dl className="m-0 space-y-4">
        {p.errors.map((e, i) => (
          <div key={i}>
            <dt className="font-bold">{e.symptom}</dt>
            <dd className="m-0 text-muted">
              <span className="font-bold text-ink">Cause: </span>
              {e.cause}
            </dd>
            <dd className="m-0 text-muted">
              <span className="font-bold text-ink">Fix: </span>
              {e.fix}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mb-0 mt-4">
        Upload failing?{' '}
        <Link href="/fix/upload" className="font-bold text-link underline">
          Open the Upload Doctor
        </Link>
        .
      </p>

      {p.guidedId && (
        <p className="mb-0 mt-6">
          <ButtonLink href={`/projects/${p.guidedId}/1`} variant="primary" icon={Layers}>
            Build it step by step with diagrams
          </ButtonLink>
        </p>
      )}
    </article>
  );
}
