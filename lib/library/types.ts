import { z } from 'zod';

/**
 * The project library: builds a student can pick from, matched against the
 * parts they own. Separate from the guided step-by-step `Project` type in
 * `lib/schema/content.ts`, which draws every hole; a library project is a
 * wiring table, a sketch and the mistakes people actually make.
 *
 * Requirements are capabilities ("any resistor from 220 ohm to 1 kohm"), not
 * exact part ids, because students own whatever came in their kit.
 */

export const itemCategorySchema = z.enum(['board', 'basics', 'output', 'input', 'sensor', 'motion', 'display', 'power']);

export const itemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: itemCategorySchema,
  /** Rough Indian retail price in rupees. An estimate for planning, not a quote. */
  approxInr: z.number().int().min(0),
});

export const requirementSchema = z.object({
  /** What the student reads, e.g. "Resistor for the LED (220 Ω to 1 kΩ)". */
  label: z.string().min(1),
  /** Any one of these items satisfies the requirement, in any mix. */
  oneOf: z.array(z.string().min(1)).min(1),
  qty: z.number().int().min(1),
});

export const wireSchema = z.object({
  /** Board pin label: D9, A0, GPIO4, 5V, 3V3 or GND. */
  board: z.string().regex(/^(D\d+|A\d+|GPIO\d+|5V|3V3|GND)$/),
  /** Where it goes on the part, e.g. "LED long leg (anode)". */
  part: z.string().min(1),
  /** A part in between, e.g. "220 Ω resistor". */
  via: z.string().optional(),
  /** True when a library picks the pin (I2C on A4/A5, a constructor argument), so the sketch text does not name it. */
  implicit: z.boolean().optional(),
});

export const commonErrorSchema = z.object({
  symptom: z.string().min(1),
  cause: z.string().min(1),
  fix: z.string().min(1),
});

export const libraryProjectSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  summary: z.string().min(1),
  /** 1 easiest, 3 hardest. */
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  minutes: z.number().int().min(1),
  /** Board ids from `content/boards` this build is written for. */
  boards: z.array(z.string()).min(1),
  learn: z.array(z.string().min(1)).min(1),
  requires: z.array(requirementSchema).min(1),
  wiring: z.array(wireSchema).min(1),
  /** Short build steps; not a diagram, that is what the guided projects are for. */
  steps: z.array(z.string().min(1)).min(3),
  code: z.object({ file: z.string().min(1), source: z.string().min(1) }),
  /** Libraries to install from the Arduino Library Manager. */
  libraries: z.array(z.string().min(1)).optional(),
  errors: z.array(commonErrorSchema).min(2),
  /** Safety or context a student must read before building. */
  warnings: z.array(z.string().min(1)).optional(),
  /** Link to the step-by-step guided version, when Ohmwise has one. */
  guidedId: z.string().optional(),
  /** True only after someone built it on real hardware and it worked. */
  verified: z.boolean(),
});

export type LibraryItem = z.infer<typeof itemSchema>;
export type Requirement = z.infer<typeof requirementSchema>;
export type Wire = z.infer<typeof wireSchema>;
export type CommonError = z.infer<typeof commonErrorSchema>;
export type LibraryProject = z.infer<typeof libraryProjectSchema>;

/** "D9" -> 9, "A0" -> 14, "GPIO4" -> 4. Power pins return null. */
export function wirePinNumber(label: string): number | null {
  const d = label.match(/^D(\d+)$/);
  if (d) return Number(d[1]);
  const a = label.match(/^A(\d+)$/);
  if (a) return 14 + Number(a[1]);
  const g = label.match(/^GPIO(\d+)$/);
  if (g) return Number(g[1]);
  return null;
}
