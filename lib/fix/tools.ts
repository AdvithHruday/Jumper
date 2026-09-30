import { FileSearch, Upload, type LucideIcon } from 'lucide-react';

/**
 * The Fix tools, described once. The Fix hub and the home page both read this,
 * so a symptom is worded the same everywhere and a new tool cannot be added to
 * one place and forgotten in the other.
 */
export interface FixTool {
  id: 'upload' | 'code';
  href: string;
  icon: LucideIcon;
  /** What the tool is called: a verb phrase in the user's own voice. */
  name: string;
  /** What the person is experiencing when they need it. */
  symptom: string;
  what: string;
  when: string;
}

export const FIX_TOOLS: FixTool[] = [
  {
    id: 'upload',
    href: '/fix/upload',
    icon: Upload,
    name: 'Fix my upload',
    symptom: "Why won't it upload?",
    what: 'Paste the error from the Arduino IDE and get the likely causes, most likely first, with one fix per step.',
    when: 'The IDE shows a red error when you press Upload.',
  },
  {
    id: 'code',
    href: '/fix/code',
    icon: FileSearch,
    name: 'Check my code',
    symptom: 'It uploads, but nothing happens',
    what: 'Paste your sketch and check every pin against your board, and against a guided project’s wiring.',
    when: 'The upload works but an LED, sensor or motor does nothing.',
  },
];
