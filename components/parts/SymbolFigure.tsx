import type { SymbolKey } from '@/lib/parts/types';

/**
 * Schematic symbols, drawn from the standard shapes (nothing copied from a
 * library). They use the text colour so they read in either theme. Some books
 * draw a resistor as a plain box instead of a zigzag; the caption says so.
 */
const SYMBOLS: Record<SymbolKey, { caption: string; body: React.ReactNode }> = {
  resistor: {
    caption: 'A zigzag. Some books draw a plain box instead.',
    body: <path d="M8 30 H30 l5 -10 l10 20 l10 -20 l10 20 l10 -20 l5 10 H112" />,
  },
  led: {
    caption: 'A diode: current flows the way the triangle points. The arrows mean it gives off light.',
    body: (
      <>
        <path d="M8 30 H40 M40 14 V46 L68 30 Z M68 14 V46 M68 30 H112" />
        <path d="M76 20 L90 6 M84 6 H90 V12 M86 30 L100 16 M94 16 H100 V22" />
      </>
    ),
  },
  switch: {
    caption: 'A push switch: the bar joins the two contacts only while you press.',
    body: (
      <>
        <path d="M8 44 H37 M83 44 H112 M28 24 H92 M60 24 V8 M46 8 H74" />
        <circle cx="40" cy="44" r="3" />
        <circle cx="80" cy="44" r="3" />
      </>
    ),
  },
  potentiometer: {
    caption: 'A resistor with an arrow: the arrow is the wiper, the middle leg.',
    body: (
      <>
        <path d="M8 40 H30 l5 -10 l10 20 l10 -20 l10 20 l10 -20 l5 10 H112" />
        <path d="M60 6 V28 M53 21 L60 30 L67 21 M60 6 H100" />
      </>
    ),
  },
  ldr: {
    caption: 'A resistor with arrows pointing in: its resistance changes with light.',
    body: (
      <>
        <path d="M8 40 H30 l5 -10 l10 20 l10 -20 l10 20 l10 -20 l5 10 H112" />
        <path d="M22 6 L40 24 M34 24 H40 V18 M38 4 L56 22 M50 22 H56 V16" />
      </>
    ),
  },
  battery: {
    caption: 'The long line is positive, the short line is negative.',
    body: (
      <>
        <path d="M8 30 H50 M50 12 V48 M62 20 V40 M62 30 H112" />
        <text x="38" y="10" fontSize="12" fontWeight="700" fill="currentColor" stroke="none" fontFamily="sans-serif">
          +
        </text>
      </>
    ),
  },
  motor: {
    caption: 'A circle with an M.',
    body: (
      <>
        <path d="M8 30 H40 M80 30 H112" />
        <circle cx="60" cy="30" r="20" />
        <text x="60" y="37" fontSize="20" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="var(--font-head)">
          M
        </text>
      </>
    ),
  },
};

export function symbolCaption(key: SymbolKey): string {
  return SYMBOLS[key].caption;
}

export function SymbolFigure({ symbol, label }: { symbol: SymbolKey; label: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      role="img"
      aria-label={label}
      className="h-auto w-full max-w-[220px] text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {SYMBOLS[symbol].body}
    </svg>
  );
}
