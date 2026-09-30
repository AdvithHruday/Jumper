import { describe, expect, it } from 'vitest';
import { DRAWINGS } from '@/components/parts/drawings';
import { PART_GUIDES } from '@/content/parts-guide';
import { ITEMS, LIBRARY } from '@/content/library';
import { boardFacts, buildsUsing, getGuide, partGroups } from './guide';
import { partGuideSchema, resistorValue } from './types';

describe('part guides', () => {
  it('has exactly one guide for every library part, and no others', () => {
    const guideIds = PART_GUIDES.map((g) => g.id).sort();
    expect(guideIds).toEqual(ITEMS.map((i) => i.id).sort());
    expect(new Set(guideIds).size).toBe(guideIds.length);
  });

  it('passes the schema and resolves full wording for every part', () => {
    for (const g of PART_GUIDES) {
      expect(partGuideSchema.safeParse(g).success, g.id).toBe(true);
      const resolved = getGuide(g.id);
      expect(resolved, g.id).toBeDefined();
      expect(resolved!.what.length, g.id).toBeGreaterThan(10);
      expect(resolved!.spot.length, g.id).toBeGreaterThan(10);
      expect(resolved!.watch.length, g.id).toBeGreaterThan(10);
    }
  });

  it('points every callout at a real anchor on its drawing, once', () => {
    for (const g of PART_GUIDES) {
      const anchors = DRAWINGS[g.drawing].anchors;
      const seen = new Set<string>();
      for (const c of g.callouts) {
        expect(anchors[c.at], `${g.id}: ${c.at}`).toBeDefined();
        expect(seen.has(c.at), `${g.id}: duplicate ${c.at}`).toBe(false);
        seen.add(c.at);
      }
    }
  });

  it('keeps the numbered markers on a drawing from overlapping', () => {
    const MARKER_DIAMETER = 13; // PartDrawing draws each marker with r=6.5
    for (const g of PART_GUIDES) {
      const anchors = DRAWINGS[g.drawing].anchors;
      const points = g.callouts.map((c) => ({ at: c.at, p: anchors[c.at] }));
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const d = Math.hypot(points[i].p[0] - points[j].p[0], points[i].p[1] - points[j].p[1]);
          expect(d, `${g.id}: ${points[i].at} and ${points[j].at}`).toBeGreaterThanOrEqual(MARKER_DIAMETER);
        }
      }
    }
  });

  it('lists pins for every part whose legs matter', () => {
    for (const g of PART_GUIDES) {
      if (g.polarity === 'polarized' || g.pinOrder !== 'none') expect(g.pins.length, g.id).toBeGreaterThan(0);
    }
  });

  it('says why a part has no schematic symbol', () => {
    for (const g of PART_GUIDES) {
      if (g.symbol === null) expect(g.symbolNote, g.id).toBeTruthy();
    }
  });

  it('draws each resistor with bands that read as its own value', () => {
    const expected: Record<string, string> = {
      'res-220': '220 Ω',
      'res-330': '330 Ω',
      'res-470': '470 Ω',
      'res-1k': '1 kΩ',
      'res-10k': '10 kΩ',
    };
    for (const [id, text] of Object.entries(expected)) {
      const g = PART_GUIDES.find((x) => x.id === id)!;
      expect(resistorValue(g.bands ?? [])?.text, id).toBe(text);
    }
  });

  it('reads resistor bands correctly and rejects bad ones', () => {
    expect(resistorValue(['yellow', 'violet', 'red', 'gold'])).toEqual({ ohms: 4700, tolerance: '±5%', text: '4.7 kΩ' });
    expect(resistorValue(['red', 'red', 'brown'])).toBeNull();
    expect(resistorValue(['red', 'red', 'pink', 'gold'])).toBeNull();
  });

  it('groups every part exactly once, in the kit builder order', () => {
    const ids = partGroups().flatMap((g) => g.items.map((i) => i.id));
    expect(ids.sort()).toEqual(ITEMS.map((i) => i.id).sort());
  });

  it('finds the builds that use a part, through capability requirements', () => {
    expect(buildsUsing('l298n').map((b) => b.id)).toContain('line-follower');
    for (const item of ITEMS) {
      for (const b of buildsUsing(item.id)) {
        expect(LIBRARY.includes(b)).toBe(true);
      }
    }
  });

  it('gives pin facts only for boards, taken from the linter data', () => {
    expect(boardFacts('led-5mm')).toBeNull();
    const esp = boardFacts('esp32-devkit-v1')!.join(' ');
    expect(esp).toContain('3.3 V');
    expect(esp).toContain('Input-only');
    expect(esp).toContain('ADC2');
    expect(boardFacts('uno')!.join(' ')).toContain('5 V');
  });
});
