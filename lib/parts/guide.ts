import { PART_GUIDES } from '@/content/parts-guide';
import { ITEMS, ITEMS_BY_ID, LIBRARY } from '@/content/library';
import { CATEGORIES } from '@/content/library/categories';
import { BOARDS_BY_ID } from '@/content/boards';
import { PARTS } from '@/content/parts';
import type { LibraryItem, LibraryProject } from '@/lib/library/types';
import type { ResolvedGuide } from './types';

/**
 * Joins a part's guide to the rest of the app's data: its name and price come
 * from the library, its wording from the guided part record when it has one,
 * and its board pin facts from the same board data the pin checker reads.
 */

const GUIDES_BY_ID = new Map(PART_GUIDES.map((g) => [g.id, g]));

export function getGuide(id: string): ResolvedGuide | undefined {
  const guide = GUIDES_BY_ID.get(id);
  const item = ITEMS_BY_ID[id];
  if (!guide || !item) return undefined;
  const guided = guide.guidedPartId ? PARTS[guide.guidedPartId]?.glossary : undefined;
  const what = guided?.what ?? guide.what;
  const spot = guided?.spot ?? guide.spot;
  const watch = guided?.watch ?? guide.watch;
  if (!what || !spot || !watch) return undefined;
  return { ...guide, name: item.name, what, spot, watch };
}

export function partIds(): string[] {
  return ITEMS.map((i) => i.id);
}

export interface PartGroup {
  id: LibraryItem['category'];
  title: string;
  items: LibraryItem[];
}

/** Parts grouped and ordered the same way as the kit builder. */
export function partGroups(): PartGroup[] {
  return CATEGORIES.map((c) => ({ ...c, items: ITEMS.filter((i) => i.category === c.id) })).filter(
    (g) => g.items.length > 0,
  );
}

/** Library builds that can use this part. */
export function buildsUsing(id: string): LibraryProject[] {
  return LIBRARY.filter((p) => p.requires.some((r) => r.oneOf.includes(id)));
}

/** A short line for a catalog card: what the part is, without the detail. */
export function oneLine(what: string): string {
  const first = what.split(/(?<=\.)\s/)[0] ?? what;
  return first;
}

/** Board pin facts for boards, taken from the linter's own data. */
export function boardFacts(id: string): string[] | null {
  const board = BOARDS_BY_ID[id];
  if (!board) return null;
  const entries = Object.entries(board.pins).map(([n, spec]) => ({ n: Number(n), spec }));
  const list = (nums: number[]) => (nums.length ? nums.sort((a, b) => a - b).join(', ') : null);
  const facts: string[] = [`Logic level: ${board.logicVoltage} V. Pins must not be given more than that.`];

  const pwm = list(entries.filter((e) => e.spec.pwm).map((e) => e.n));
  if (board.pwmRestricted && pwm) facts.push(`analogWrite gives real PWM only on pins ${pwm}.`);
  else if (!board.pwmRestricted) facts.push('analogWrite works on any output pin.');

  const inputOnly = list(entries.filter((e) => !e.spec.output && !e.spec.reserved).map((e) => e.n));
  if (inputOnly) facts.push(`Input-only pins (cannot drive an output): ${inputOnly}.`);

  const adc2 = list(entries.filter((e) => e.spec.adc === 'adc2').map((e) => e.n));
  if (adc2) facts.push(`Pins ${adc2} share the ADC2 unit, which stops working while WiFi is on.`);

  const strapping = list(entries.filter((e) => e.spec.strapping).map((e) => e.n));
  if (strapping) facts.push(`Boot-time (strapping) pins: ${strapping}. A circuit on these can stop the board starting.`);

  const reserved = list(entries.filter((e) => e.spec.reserved).map((e) => e.n));
  if (reserved) facts.push(`Not free to use: ${reserved}.`);

  const uart = entries.filter((e) => e.spec.uart).map((e) => e.n);
  if (uart.length) facts.push(`Pins ${uart.sort((a, b) => a - b).join(', ')} are shared with the USB serial connection.`);
  return facts;
}
