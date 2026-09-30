import { z } from 'zod';

/**
 * The Parts page: for every part in the kit library, how to recognise it, how
 * to read its legs and pins, and where it is used. A guide is keyed by the same
 * id as the library item it describes, so the two catalogs cannot disagree
 * about which parts exist (a test enforces it).
 *
 * The drawings are original artwork, not traced from photos or from other
 * projects' diagrams (many of which are share-alike or non-commercial licensed
 * and could not be combined with this project's MIT licence).
 */

export const DRAWING_KEYS = [
  'uno',
  'nano',
  'esp32',
  'breadboard',
  'jumper-wires',
  'resistor',
  'led',
  'rgb-led',
  'buzzer',
  'push-button',
  'potentiometer',
  'ldr',
  'hc-sr04',
  'dht11',
  'pir',
  'ir-line',
  'soil',
  'servo',
  'l298n',
  'dc-motor',
  'chassis',
  'lcd',
  'battery-pack',
] as const;

export const SYMBOL_KEYS = ['resistor', 'led', 'switch', 'potentiometer', 'ldr', 'battery', 'motor'] as const;

export type DrawingKey = (typeof DRAWING_KEYS)[number];
export type SymbolKey = (typeof SYMBOL_KEYS)[number];

export const pinRoleSchema = z.enum([
  'power',
  'ground',
  'signal',
  'input',
  'output',
  'control',
  'passive',
  'anode',
  'cathode',
  'common',
]);

/** One leg or pin, described by what it does rather than where it sits. */
export const guidePinSchema = z.object({
  name: z.string().min(1),
  role: pinRoleSchema,
  note: z.string().optional(),
});

export const calloutSchema = z.object({
  /** An anchor point defined by the part's drawing. */
  at: z.string().min(1),
  text: z.string().min(1),
});

export const partGuideSchema = z.object({
  /** The library item this describes. */
  id: z.string().min(1),
  drawing: z.enum(DRAWING_KEYS),
  /** Artwork options, such as the colour bands of a resistor. */
  bands: z.array(z.string()).optional(),
  symbol: z.enum(SYMBOL_KEYS).nullable(),
  /** Says why there is no symbol, when there is none. */
  symbolNote: z.string().optional(),
  /** Set when a guided-project part record already describes this part; its glossary is reused. */
  guidedPartId: z.string().optional(),
  what: z.string().min(1).optional(),
  spot: z.string().min(1).optional(),
  watch: z.string().min(1).optional(),
  /** Whether swapping the legs matters. */
  polarity: z.enum(['polarized', 'either', 'none']),
  pins: z.array(guidePinSchema),
  /**
   * `varies`: the pin order differs between makers, so the page lists pins by
   * function and tells the reader to check the labels on their own board.
   */
  pinOrder: z.enum(['standard', 'varies', 'none']),
  callouts: z.array(calloutSchema).min(1),
});

export type PartGuide = z.infer<typeof partGuideSchema>;

/** A guide with its wording filled in, from the guided part record when it has one. */
export interface ResolvedGuide extends Omit<PartGuide, 'what' | 'spot' | 'watch'> {
  name: string;
  what: string;
  spot: string;
  watch: string;
}

const DIGIT: Record<string, number> = {
  black: 0,
  brown: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  green: 5,
  blue: 6,
  violet: 7,
  grey: 8,
  white: 9,
};
/** The third band is a power of ten: red is ×100, orange ×1000, gold ×0.1. */
const MULTIPLIER: Record<string, number> = {
  ...Object.fromEntries(Object.entries(DIGIT).map(([band, digit]) => [band, 10 ** digit])),
  gold: 0.1,
  silver: 0.01,
};
const TOLERANCE: Record<string, string> = { brown: '±1%', red: '±2%', gold: '±5%', silver: '±10%' };

/** Reads a four-band resistor. Returns null for anything it cannot read. */
export function resistorValue(bands: string[]): { ohms: number; tolerance: string; text: string } | null {
  if (bands.length !== 4) return null;
  const [a, b, m, t] = bands;
  if (!(a in DIGIT) || !(b in DIGIT) || !(m in MULTIPLIER) || !(t in TOLERANCE)) return null;
  const ohms = Math.round((DIGIT[a] * 10 + DIGIT[b]) * MULTIPLIER[m] * 100) / 100;
  const text =
    ohms >= 1_000_000 ? `${ohms / 1_000_000} MΩ` : ohms >= 1000 ? `${ohms / 1000} kΩ` : `${ohms} Ω`;
  return { ohms, tolerance: TOLERANCE[t], text };
}

export const BAND_DIGITS = DIGIT;
