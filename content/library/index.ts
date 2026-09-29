import type { LibraryProject } from '@/lib/library/types';
import { BASIC_PROJECTS } from './basics';
import { SENSOR_PROJECTS } from './sensors';
import { BUILD_PROJECTS } from './builds';

export { ITEMS, ITEMS_BY_ID, KIT_PRESETS } from './items';

/** Every library project, easiest first. */
export const LIBRARY: LibraryProject[] = [...BASIC_PROJECTS, ...SENSOR_PROJECTS, ...BUILD_PROJECTS].sort(
  (a, b) => a.difficulty - b.difficulty,
);

export const LIBRARY_BY_ID: Record<string, LibraryProject> = Object.fromEntries(
  LIBRARY.map((p) => [p.id, p]),
);

export function getLibraryProject(id: string): LibraryProject | undefined {
  return LIBRARY_BY_ID[id];
}
