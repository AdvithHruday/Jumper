import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeBlock } from '@/components/step/CodeBlock';
import { LIBRARY, ITEMS_BY_ID, getLibraryProject } from '@/content/library';

export function generateStaticParams() {
  return LIBRARY.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getLibraryProject(id);
  return p ? { title: `${p.name} | Jumper` } : {};
}

const LEVEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const;

const H3 = 'mb-2 mt-8 border-b border-line pb-1.5 text-xl font-extrabold';

export default async function BuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getLibraryProject(id);
  if (!p) notFound();

  return (
    <article className="pt-3">
      <Link href="/build" className="text-[15px] font-bold text-link underline">
        All builds
      </Link>
      <h2 className="mb-1 mt-3 text-[32px] font-extrabold leading-tight">{p.name}</h2>
      <p className="m-0 max-w-[60ch] text-lg text-muted">{p.summary}</p>
      <p className="mb-0 mt-2 text-[13px] font-bold uppercase tracking-wide text-muted">
        {LEVEL[p.difficulty]} · about {p.minutes} min
      </p>

      {!p.verified && (
        <p className="mb-0 mt-4 rounded-xl bg-panel p-3.5 text-[15px] shadow-[inset_0_0_0_1.5px_var(--accent)]">
          <span className="font-bold">Not built on real hardware yet.</span> The pins in the wiring and the sketch
          are checked against each other and the board, but nobody has tried this build. Read it against your parts,
          and tell us if something is wrong.
        </p>
      )}

      {p.warnings && (
        <ul className="mb-0 mt-4 list-disc space-y-1 pl-5 font-bold">
          {p.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <h3 className={H3}>What you need</h3>
      <ul className="m-0 list-disc space-y-1 pl-5">
        {p.requires.map((r) => (
          <li key={r.label}>
            {r.label}
            {r.oneOf.length > 1 && (
              <span className="text-muted">
                {' '}
                (any of: {r.oneOf.map((i) => ITEMS_BY_ID[i]?.name ?? i).join(', ')})
              </span>
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

      <h3 className={H3}>Wiring</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink text-[13px] uppercase tracking-wide text-muted">
              <th className="py-2 pr-4 font-bold">Board pin</th>
              <th className="py-2 pr-4 font-bold">Connects to</th>
              <th className="py-2 font-bold">Through</th>
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

      <h3 className={H3}>Build it</h3>
      <ol className="m-0 list-decimal space-y-2 pl-5">
        {p.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h3 className={H3}>The sketch</h3>
      <CodeBlock file={p.code.file} source={p.code.source} />
      <p className="mt-0 text-[15px] text-muted">
        Changed something? Paste your version into{' '}
        <Link href="/check" className="font-bold text-link underline">
          Check my code
        </Link>{' '}
        to catch pin mistakes.
      </p>

      <h3 className={H3}>If it does not work</h3>
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
          <Link
            href={`/projects/${p.guidedId}/1`}
            className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4.5 py-3 font-bold text-on-accent hover:brightness-105"
          >
            Build it step by step with diagrams
          </Link>
        </p>
      )}
    </article>
  );
}
