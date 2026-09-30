import type { LibraryItem } from '@/lib/library/types';

/**
 * The groups parts are shown in, in the order they appear. The kit builder and
 * the Parts page both read this, so a part is always in the same group in both.
 */
export const CATEGORIES: { id: LibraryItem['category']; title: string }[] = [
  { id: 'board', title: 'Boards' },
  { id: 'basics', title: 'Basics' },
  { id: 'output', title: 'LEDs and sound' },
  { id: 'input', title: 'Buttons and dials' },
  { id: 'sensor', title: 'Sensors' },
  { id: 'motion', title: 'Motors and servos' },
  { id: 'display', title: 'Displays' },
  { id: 'power', title: 'Power' },
];
