'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { LIBRARY, ITEMS, ITEMS_BY_ID, KIT_PRESETS } from '@/content/library';
import { matchProjects, sortMatches, type Match } from '@/lib/library/match';
import { useKit } from '@/lib/library/store';
import { useHydrated } from '@/lib/progress/useHydrated';
import type { LibraryItem } from '@/lib/library/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Stepper } from '@/components/ui/Stepper';
import { PhotoScan } from './PhotoScan';

const CATEGORIES: { id: LibraryItem['category']; title: string }[] = [
  { id: 'board', title: 'Boards' },
  { id: 'basics', title: 'Basics' },
  { id: 'output', title: 'LEDs and sound' },
  { id: 'input', title: 'Buttons and dials' },
  { id: 'sensor', title: 'Sensors' },
  { id: 'motion', title: 'Motors and servos' },
  { id: 'display', title: 'Displays' },
  { id: 'power', title: 'Power' },
];

const LEVEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const;

function ItemStepper({ item }: { item: LibraryItem }) {
  const qty = useKit((s) => s.items[item.id] ?? 0);
  const setQty = useKit((s) => s.setQty);
  return <Stepper value={qty} onChange={(n) => setQty(item.id, n)} label={item.name} />;
}

function Card({ m }: { m: Match }) {
  const p = m.project;
  return (
    <li>
      <Link href={`/learn/build/${p.id}`} className="block rounded-panel">
        <Panel padding="sm" className="transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--border-ui)]">
          <h3 className="m-0 text-lg font-extrabold">{p.name}</h3>
          <p className="mb-0 mt-1 text-muted">{p.summary}</p>
          <p className="mb-0 mt-2">
            <Badge>
              {LEVEL[p.difficulty]} · about {p.minutes} min
            </Badge>
          </p>
          {m.missing.length > 0 && (
            <p className="mb-0 mt-2 text-small">
              <span className="font-bold">You still need: </span>
              {m.missing
                .map((x) => `${x.qty > 1 ? `${x.qty} × ` : ''}${x.label.replace(/^\d+ × /, '')}`)
                .join('; ')}
              <span className="text-muted"> (about ₹{m.costInr})</span>
            </p>
          )}
        </Panel>
      </Link>
    </li>
  );
}

function Section({ title, hint, matches }: { title: string; hint?: string; matches: Match[] }) {
  if (matches.length === 0) return null;
  return (
    <section>
      <h2 className="mb-1 text-xl font-extrabold">
        {title} <span className="font-normal text-muted">({matches.length})</span>
      </h2>
      {hint && <p className="mb-3 mt-0 text-small text-muted">{hint}</p>}
      <ul className="m-0 mb-6 grid list-none gap-3 p-0">
        {matches.map((m) => (
          <Card key={m.project.id} m={m} />
        ))}
      </ul>
    </section>
  );
}

export function KitMatcher() {
  const hydrated = useHydrated();
  const stored = useKit((s) => s.items);
  const replace = useKit((s) => s.replace);
  const clear = useKit((s) => s.clear);

  // Until hydrated the server and the first client render must agree: no kit.
  const items = useMemo(() => (hydrated ? stored : {}), [hydrated, stored]);
  const total = Object.values(items).reduce((a, b) => a + b, 0);

  const matches = useMemo(() => sortMatches(matchProjects(LIBRARY, ITEMS_BY_ID, items)), [items]);
  const ready = matches.filter((m) => m.status === 'ready');
  const almost = matches.filter((m) => m.status === 'almost');
  const later = matches.filter((m) => m.status === 'later');

  return (
    <>
      <PhotoScan />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div>
          <h2 className="m-0 text-xl font-extrabold">What do you have?</h2>
          <p className="mb-3 mt-1 text-small text-muted">
            Start from a typical kit, then adjust it to match yours. Saved in this browser.
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {KIT_PRESETS.map((k) => (
              <Button key={k.id} size="sm" title={k.note} onClick={() => replace(k.items)}>
                {k.name}
              </Button>
            ))}
            {total > 0 && (
              <Button size="sm" variant="ghost" icon={Trash2} onClick={clear}>
                Clear all
              </Button>
            )}
          </div>

          {CATEGORIES.map((cat) => {
            const list = ITEMS.filter((i) => i.category === cat.id);
            return (
              <fieldset key={cat.id} className="m-0 mb-4 border-0 p-0">
                <legend className="mb-1 w-full border-b border-line pb-1 text-caption font-bold uppercase tracking-wide text-muted">
                  {cat.title}
                </legend>
                <ul className="m-0 list-none p-0">
                  {list.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
                      <span>{item.name}</span>
                      <ItemStepper item={item} />
                    </li>
                  ))}
                </ul>
              </fieldset>
            );
          })}
        </div>

        <div>
          {total === 0 ? (
            <p className="m-0 text-muted">
              Pick a starter kit or add the parts you own, and the projects you can build show up here.
            </p>
          ) : (
            <div aria-live="polite">
              <Section title="You can build these now" matches={ready} />
              <Section
                title="Almost there"
                hint="Missing one or two parts. Prices are rough estimates in rupees."
                matches={almost}
              />
              {later.length > 0 && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-xl font-extrabold">
                    Later <span className="font-normal text-muted">({later.length})</span>
                  </summary>
                  <ul className="m-0 mt-3 grid list-none gap-3 p-0">
                    {later.map((m) => (
                      <Card key={m.project.id} m={m} />
                    ))}
                  </ul>
                </details>
              )}
              {ready.length === 0 && almost.length === 0 && (
                <p className="m-0 text-muted">Nothing is within reach yet. Add a board and a few basics to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
