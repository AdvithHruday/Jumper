import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BandReader } from '@/components/parts/BandReader';
import { PartDrawing } from '@/components/parts/PartDrawing';
import { SymbolFigure, symbolCaption } from '@/components/parts/SymbolFigure';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { ITEMS_BY_ID } from '@/content/library';
import { CATEGORIES } from '@/content/library/categories';
import { boardFacts, buildsUsing, getGuide, partIds } from '@/lib/parts/guide';

export function generateStaticParams() {
  return partIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = getGuide(id);
  return guide ? { title: guide.name, description: guide.what } : {};
}

const POLARITY = {
  polarized: { tone: 'warn', text: 'Which way round matters' },
  either: { tone: 'ok', text: 'Either way round works' },
  none: { tone: 'neutral', text: 'Not a part you wire by its legs' },
} as const;

const H2 = 'mb-2 mt-8 border-b border-line pb-1.5 text-xl font-extrabold';

export default async function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = getGuide(id);
  const item = ITEMS_BY_ID[id];
  if (!guide || !item) notFound();

  const category = CATEGORIES.find((c) => c.id === item.category)?.title;
  const builds = buildsUsing(id);
  const facts = boardFacts(id);
  const polarity = POLARITY[guide.polarity];
  const markers = guide.callouts.map((c, i) => ({ n: i + 1, at: c.at }));

  return (
    <article className="pb-12 pt-3">
      <ButtonLink href="/parts" variant="ghost" size="sm" icon={ArrowLeft} className="-ml-3">
        All parts
      </ButtonLink>
      <PageHeader eyebrow={category} title={guide.name} description={guide.what} />

      <div className="mt-6 grid items-start gap-6 md:grid-cols-2">
        <PartDrawing
          drawing={guide.drawing}
          bands={guide.bands}
          markers={markers}
          label={`Drawing of ${guide.name}, with ${markers.length} numbered points explained in the list beside it`}
        />
        <div>
          <h2 className="mb-2 text-lg font-extrabold">What the numbers point to</h2>
          <ol className="m-0 grid list-none gap-2 p-0">
            {guide.callouts.map((c, i) => (
              <li key={c.at} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-caption font-extrabold text-on-accent"
                >
                  {i + 1}
                </span>
                <span>{c.text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Badge tone={polarity.tone}>{polarity.text}</Badge>
          </div>
        </div>
      </div>

      <h2 className={H2}>How to spot it</h2>
      <p className="m-0">{guide.spot}</p>

      <Callout variant="warning" title="Watch out" className="mt-4">
        {guide.watch}
      </Callout>

      {guide.bands && (
        <>
          <h2 className={H2}>Reading the bands</h2>
          <BandReader bands={guide.bands} />
        </>
      )}

      {guide.pins.length > 0 && (
        <>
          <h2 className={H2}>{guide.pinOrder === 'none' ? 'Legs' : 'Pins'}</h2>
          {guide.pinOrder === 'varies' && (
            <Callout variant="info" title="The order varies" className="mb-3">
              Different makers put these pins in a different order, so they are listed here by what they do. Read the
              labels printed on your own board before you connect anything.
            </Callout>
          )}
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {guide.pins.map((pin) => (
              <li key={pin.name}>
                <Panel variant="subtle" padding="sm" className="h-full">
                  <p className="m-0 font-bold">{pin.name}</p>
                  {pin.note && <p className="m-0 mt-0.5 text-small text-muted">{pin.note}</p>}
                </Panel>
              </li>
            ))}
          </ul>
        </>
      )}

      {facts && (
        <>
          <h2 className={H2}>Pin facts</h2>
          <ul className="m-0 list-disc space-y-1 pl-5">
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="mb-0 mt-2 text-small text-muted">
            These come from the same board data the code checker uses, so they match what it will tell you.
          </p>
        </>
      )}

      <h2 className={H2}>In a circuit diagram</h2>
      {guide.symbol ? (
        <div className="flex flex-wrap items-center gap-5">
          <SymbolFigure symbol={guide.symbol} label={`Circuit symbol for ${guide.name}`} />
          <p className="m-0 max-w-[46ch] text-muted">{symbolCaption(guide.symbol)}</p>
        </div>
      ) : (
        <p className="m-0 text-muted">{guide.symbolNote}</p>
      )}

      <h2 className={H2}>Builds that use it</h2>
      {builds.length > 0 ? (
        <ul className="m-0 list-disc space-y-1 pl-5">
          {builds.map((b) => (
            <li key={b.id}>
              <Link href={`/learn/build/${b.id}`} className="font-bold text-link underline underline-offset-2">
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-muted">No build in the library uses this part yet.</p>
      )}
      <p className="mb-0 mt-6 text-small text-muted">About ₹{item.approxInr} in India. A rough guide for planning, not a quote.</p>
    </article>
  );
}
