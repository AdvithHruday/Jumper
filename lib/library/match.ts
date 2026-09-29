import type { LibraryItem, LibraryProject, Requirement } from './types';

/** Item id -> how many the student has. */
export type Inventory = Record<string, number>;

export interface MissingPart {
  label: string;
  /** Any of these would do. */
  oneOf: string[];
  qty: number;
  /** Cost of the cheapest way to fill the gap. */
  approxInr: number;
}

export type MatchStatus = 'ready' | 'almost' | 'later';

export interface Match {
  project: LibraryProject;
  status: MatchStatus;
  missing: MissingPart[];
  /** Total rough cost of everything missing. */
  costInr: number;
}

/** A build is "almost" when only this many kinds of part are missing. */
export const ALMOST_MAX_MISSING = 2;

/**
 * Works out what each project still needs given what the student owns.
 *
 * Requirements are filled in order and each item a requirement uses is
 * deducted before the next one looks, so two requirements that could both use
 * the same resistor cannot both claim it.
 */
export function matchProjects(
  projects: LibraryProject[],
  items: Record<string, LibraryItem>,
  inventory: Inventory,
): Match[] {
  return projects.map((project) => {
    const left: Inventory = { ...inventory };
    const missing: MissingPart[] = [];

    for (const req of project.requires) {
      const short = take(req, left);
      if (short > 0) {
        const cheapest = Math.min(...req.oneOf.map((id) => items[id]?.approxInr ?? Infinity));
        missing.push({
          label: req.label,
          oneOf: req.oneOf,
          qty: short,
          approxInr: Number.isFinite(cheapest) ? cheapest * short : 0,
        });
      }
    }

    const costInr = missing.reduce((sum, m) => sum + m.approxInr, 0);
    const status: MatchStatus =
      missing.length === 0 ? 'ready' : missing.length <= ALMOST_MAX_MISSING ? 'almost' : 'later';
    return { project, status, missing, costInr };
  });
}

/** Deducts what a requirement uses from `left` and returns how many are still short. */
function take(req: Requirement, left: Inventory): number {
  let need = req.qty;
  for (const id of req.oneOf) {
    if (need === 0) break;
    const have = left[id] ?? 0;
    const used = Math.min(have, need);
    if (used > 0) {
      left[id] = have - used;
      need -= used;
    }
  }
  return need;
}

/** Sorts matches within a status so the most useful come first. */
export function sortMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    if (a.status !== b.status) return rank(a.status) - rank(b.status);
    if (a.status === 'ready') return a.project.difficulty - b.project.difficulty || a.project.name.localeCompare(b.project.name);
    return a.costInr - b.costInr || a.project.name.localeCompare(b.project.name);
  });
}

const rank = (s: MatchStatus) => (s === 'ready' ? 0 : s === 'almost' ? 1 : 2);
