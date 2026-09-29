import { describe, it, expect } from 'vitest';
import { matchProjects, sortMatches } from './match';
import type { LibraryItem, LibraryProject } from './types';

const items: Record<string, LibraryItem> = Object.fromEntries(
  [
    ['uno', 450],
    ['res-220', 1],
    ['res-1k', 2],
    ['led', 2],
    ['sensor', 90],
    ['servo', 150],
    ['lcd', 250],
  ].map(([id, approxInr]) => [id, { id, name: id, category: 'basics', approxInr }]),
) as Record<string, LibraryItem>;

const project = (id: string, requires: LibraryProject['requires'], difficulty: 1 | 2 | 3 = 1): LibraryProject => ({
  id,
  name: id,
  summary: 's',
  difficulty,
  minutes: 10,
  boards: ['uno'],
  learn: ['l'],
  requires,
  wiring: [{ board: 'D9', part: 'x' }],
  steps: ['a', 'b', 'c'],
  code: { file: 'f.ino', source: 'void setup(){}' },
  errors: [
    { symptom: 's', cause: 'c', fix: 'f' },
    { symptom: 's', cause: 'c', fix: 'f' },
  ],
  verified: false,
});

const req = (oneOf: string[], qty = 1, label = oneOf.join('/')) => ({ label, oneOf, qty });

describe('matchProjects', () => {
  it('is ready when every requirement is covered', () => {
    const [m] = matchProjects([project('a', [req(['uno']), req(['led'], 2)])], items, { uno: 1, led: 3 });
    expect(m.status).toBe('ready');
    expect(m.missing).toEqual([]);
    expect(m.costInr).toBe(0);
  });

  it('accepts any of the alternatives, in any mix', () => {
    const p = project('a', [req(['res-220', 'res-1k'], 3)]);
    const [m] = matchProjects([p], items, { 'res-220': 1, 'res-1k': 2 });
    expect(m.status).toBe('ready');
  });

  it('reports what is missing and the cheapest way to fill it', () => {
    const p = project('a', [req(['res-220', 'res-1k'], 3)]);
    const [m] = matchProjects([p], items, { 'res-220': 1 });
    expect(m.missing).toHaveLength(1);
    expect(m.missing[0].qty).toBe(2);
    expect(m.missing[0].approxInr).toBe(2); // 2 x the cheapest option, 1 rupee
    expect(m.status).toBe('almost');
  });

  it('does not let two requirements claim the same part', () => {
    const p = project('a', [req(['res-220'], 1), req(['res-220', 'res-1k'], 1)]);
    const [m] = matchProjects([p], items, { 'res-220': 1 });
    expect(m.missing).toHaveLength(1); // the second slot has nothing left to use
  });

  it('is "almost" up to two missing kinds of part, then "later"', () => {
    const two = project('two', [req(['uno']), req(['sensor']), req(['servo'])]);
    const three = project('three', [req(['uno']), req(['sensor']), req(['servo']), req(['lcd'])]);
    const [a, b] = matchProjects([two, three], items, { uno: 1 });
    expect(a.status).toBe('almost');
    expect(b.status).toBe('later');
    expect(a.costInr).toBe(240);
  });

  it('with an empty inventory nothing is ready', () => {
    const [m] = matchProjects([project('a', [req(['uno'])])], items, {});
    expect(m.status).toBe('almost');
    expect(m.costInr).toBe(450);
  });

  it('does not mutate the inventory it is given', () => {
    const inv = { uno: 1 };
    matchProjects([project('a', [req(['uno'])])], items, inv);
    expect(inv).toEqual({ uno: 1 });
  });
});

describe('sortMatches', () => {
  it('lists ready first by difficulty, then almost by cost, then later', () => {
    const ps = [
      project('hard-ready', [req(['uno'])], 3),
      project('cheap-almost', [req(['uno']), req(['led'])], 1),
      project('easy-ready', [req(['uno'])], 1),
      project('dear-almost', [req(['uno']), req(['servo'])], 1),
      project('later', [req(['sensor']), req(['servo']), req(['lcd'])], 1),
    ];
    const order = sortMatches(matchProjects(ps, items, { uno: 1 })).map((m) => m.project.id);
    expect(order).toEqual(['easy-ready', 'hard-ready', 'cheap-almost', 'dear-almost', 'later']);
  });
});
