import { ALL_PARTS } from '@/content/parts';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = { title: 'Meet your parts' };

/**
 * Milestone 1 stub. The full parts glossary, with a drawing of each part and
 * its own detail route, lands in milestone 2 alongside projects 2-5; the
 * content is already in the part records, so this page grows rather than
 * gets rewritten.
 */
export default function PartsPage() {
  return (
    <>
      <PageHeader
        title="Meet your parts"
        description="What each part does, how to recognise it, and what to watch out for."
      />
      <div className="my-6 grid gap-7 sm:grid-cols-2">
        {ALL_PARTS.map((part) => (
          <article key={part.id}>
            <h2 className="mb-1.5 text-xl font-extrabold">{part.name}</h2>
            <dl className="m-0 text-[15px]">
              <dt className="mt-1.5 font-bold">What it does</dt>
              <dd className="m-0 text-muted">{part.glossary.what}</dd>
              <dt className="mt-1.5 font-bold">How to spot it</dt>
              <dd className="m-0 text-muted">{part.glossary.spot}</dd>
              <dt className="mt-1.5 font-bold">Watch out</dt>
              <dd className="m-0 text-muted">{part.glossary.watch}</dd>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
