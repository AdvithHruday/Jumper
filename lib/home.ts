import { BOARDS } from '@/content/boards';
import { UPLOAD_SIGNATURES } from '@/content/fix/upload-signatures';
import { RULES } from '@/lib/sketch/lint';

export interface HomeStat {
  value: string;
  label: string;
}

/**
 * The numbers on the home page, read from the content they describe rather than
 * typed in, so "13 pin checks" is true on the day it is shown and every day
 * after. Nothing here is a claim about users, accuracy or hardware testing.
 */
export function getHomeStats(): HomeStat[] {
  return [
    { value: String(UPLOAD_SIGNATURES.length), label: 'upload errors recognised' },
    { value: String(RULES.length), label: 'pin checks' },
    { value: String(BOARDS.length), label: 'boards' },
    { value: 'MIT', label: 'open source' },
  ];
}
