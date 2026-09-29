'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { LIBRARY, ITEMS, ITEMS_BY_ID, KIT_PRESETS } from '@/content/library';
import { matchProjects, sortMatches, type Match } from '@/lib/library/match';
import { useKit } from '@/lib/library/store';
import { useHydrated } from '@/lib/progress/useHydrated';
import { PhotoScan } from './PhotoScan';
import type { LibraryItem } from '@/lib/library/types';

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

const BTN = 'h-9 w-9 rounded-lg font-bold shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:bg-panel';

function Stepper({ item }: { item: LibraryItem }) {
  const qty = useKit((s) => s.items[item.id] ?? 0);
  const setQty = useKit((s) => s.setQty);
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`Fewer ${item.name}`} onClick={() => setQty(item.id, qty - 1)} className={BTN} disabled={qty === 0}>
        −
      </button>
      <span aria-live="polite" className="w-6 text-center font-bold tabular-nums">
        {qty}
      </span>
      <button type="button" aria-label={`More ${item.name}`} onClick={() => setQty(item.id, qty + 1)} className={BTN}>
        +
      </button>
    </div>
  );
}

function Card({ m }: { m: Match }) {
  const p = m.project;
  return (
    <li>
      <Link
        href={`/build/${p.id}`}
        className="block rounded-xl bg-panel p-4 shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1.5px_var(--line-strong)]"
      >
        <h4 className="m-0 text-lg font-extrabold">{p.name}</h4>
        <p className="mb-0 mt-1 text-muted">{p.summary}</p>
        <p className="mb-0 mt-2 text-[13px] font-bold uppercase tracking-wide text-muted">
          {LEVEL[p.difficulty]} · about {p.minutes} min
        </p>
        {m.missing.length > 0 && (
          <p className="mb-0 mt-2 text-[15px]">
            <span className="font-bold">You still need: </span>
            {m.missing
              .map((x) => `${x.qty > 1 ? `${x.qty} × ` : ''}${x.label.replace(/^\d+ × /, '')}`)
              .join('; ')}
            <span className="text-muted"> (about ₹{m.costInr})</span>
          </p>
        )}
      </Link>
    </li>
  );
}

function Section({ title, hint, matches }: { title: string; hint?: string; matches: Match[] }) {
  if (matches.length === 0) return null;
  return (
    <section>
      <h3 className="mb-1 text-xl font-extrabold">
        {title} <span className="font-normal text-muted">({matches.length})</span>
      </h3>
      {hint && <p className="mb-3 mt-0 text-[15px] text-muted">{hint}</p>}
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
        <h3 className="m-0 text-xl font-extrabold">What do you have?</h3>
        <p className="mb-3 mt-1 text-[15px] text-muted">
          Start from a typical kit, then adjust it to match yours. Saved in this browser.
        </p>
        <div className="mb-5 flex flex-wrap gap-2">
          {KIT_PRESETS.map((k) => (
            <button
              key={k.id}
              type="button"
              title={k.note}
              onClick={() => replace(k.items)}
              className="rounded-[10px] px-3.5 py-2 text-[15px] font-bold shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:bg-panel"
            >
              {k.name}
            </button>
          ))}
          {total > 0 && (
            <button type="button" onClick={clear} className="rounded-[10px] px-3.5 py-2 text-[15px] font-bold text-muted hover:bg-panel">
              Clear all
            </button>
          )}
        </div>

        {CATEGORIES.map((cat) => {
          const list = ITEMS.filter((i) => i.category === cat.id);
          return (
            <fieldset key={cat.id} className="m-0 mb-4 border-0 p-0">
              <legend className="mb-1 border-b border-line pb-1 text-[13px] font-bold uppercase tracking-wide text-muted">
                {cat.title}
              </legend>
              <ul className="m-0 list-none p-0">
                {list.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
                    <span>{item.name}</span>
                    <Stepper item={item} />
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
