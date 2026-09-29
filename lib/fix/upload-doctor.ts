import { z } from 'zod';

/**
 * Upload Doctor: matches the text of a failed upload against a table of known
 * failure signatures and returns a ranked list of causes and fixes.
 *
 * Deterministic on purpose. The knowledge lives in `content/fix`, this file
 * only matches and ranks, so a wrong instruction is a content bug the tests
 * catch, not something the engine invents.
 */

export const fixStepSchema = z.object({
  text: z.string().min(1),
  /** True when the student has to touch hardware (swap a cable, press BOOT). */
  physical: z.boolean().optional(),
});

export const uploadSignatureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  /** One plain sentence on what the message means. */
  meaning: z.string().min(1),
  /** Regex source, matched case-insensitively against the pasted log. */
  pattern: z.string().min(1),
  /** Higher wins when a log matches several signatures. */
  priority: z.number().int(),
  family: z.enum(['avr', 'esp32', 'any']),
  /** Most likely cause first. */
  causes: z.array(z.string().min(1)).min(1),
  /** Ordered checks and fixes, one action per step. */
  steps: z.array(fixStepSchema).min(1),
  /** Real log excerpts; each must match `pattern` (enforced by the tests). */
  examples: z.array(z.string().min(1)).min(1),
});

export type UploadSignature = z.infer<typeof uploadSignatureSchema>;
export type FixStep = z.infer<typeof fixStepSchema>;

export interface UsbInfo {
  vendorId: number;
  productId: number;
}

export interface UsbDevice {
  vid: number;
  pid: number;
  chip: string;
  family: 'avr' | 'esp32' | 'any';
  /** What this adapter usually sits on, so the student can sanity-check the board. */
  usuallyOn: string;
  /** True when Windows or macOS usually need a separate driver for this chip. */
  driverNeeded: boolean;
  hints: string[];
}

export interface Diagnosis {
  matches: UploadSignature[];
  usb?: UsbDevice & { known: true };
  unknownUsb?: UsbInfo;
}

export function hex4(n: number): string {
  return n.toString(16).toUpperCase().padStart(4, '0');
}

export function matches(signature: UploadSignature, log: string): boolean {
  return new RegExp(signature.pattern, 'i').test(log);
}

/**
 * Returns every signature the log matches, best first. Ties break on id so the
 * order is stable. An empty log or an unrecognised one returns no matches; the
 * caller decides what to show.
 */
export function diagnose(
  log: string,
  signatures: UploadSignature[],
  usbTable: UsbDevice[] = [],
  usb?: UsbInfo,
): Diagnosis {
  const found = log.trim()
    ? signatures.filter((s) => matches(s, log)).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
    : [];

  if (!usb) return { matches: found };

  const known = usbTable.find((d) => d.vid === usb.vendorId && d.pid === usb.productId);
  return known
    ? { matches: found, usb: { ...known, known: true } }
    : { matches: found, unknownUsb: usb };
}
