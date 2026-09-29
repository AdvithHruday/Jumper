import type { BoardSpec } from '@/lib/boards/types';
import { uno, nano } from './avr';
import { esp32DevkitV1 } from './esp32';

export const BOARDS: BoardSpec[] = [uno, nano, esp32DevkitV1];

export const BOARDS_BY_ID: Record<string, BoardSpec> = Object.fromEntries(
  BOARDS.map((b) => [b.id, b]),
);

export function getBoard(id: string): BoardSpec | undefined {
  return BOARDS_BY_ID[id];
}
