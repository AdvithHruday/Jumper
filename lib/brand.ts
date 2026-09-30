/**
 * The product's name and the sentences that describe it, in one place, so the
 * page title, the social preview, the manifest and the header cannot drift.
 * Colours are hex here only because icon and image files cannot read CSS
 * variables; they mirror the tokens in app/globals.css.
 */

export const BRAND = {
  name: 'Ohmwise',
  tagline: "Find out why your Arduino build isn't working",
  description:
    "Paste an upload error, check your sketch's pins, or follow a guided build. Plain-English fixes for Arduino and ESP32 beginners.",
  /** The public repository, used by the feedback and about links. */
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL ?? 'https://github.com/vishnu601/Jumper',
} as const;

/** Who built it, as shown on the About page. Change here, nowhere else. */
export const TEAM = [
  { name: 'Advith Hruday Ravulapati', email: 'advithruday@gmail.com' },
  { name: 'Vishnu Ganesh Mukkavilli', email: 'Mukkavilli.vishnu@gmail.com' },
] as const;

/**
 * Where privacy and data questions go. Deliberately unset until a dedicated
 * project address exists: the Privacy page shows this only when it is set and
 * never invents one.
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Mirrors --accent, --mat, --bg, --ink and --muted for files that cannot use CSS variables. */
export const BRAND_COLORS = {
  accent: '#f2b53a',
  mat: '#2c5873',
  light: '#eef2f5',
  ink: '#15202b',
  dark: '#0f151b',
  muted: '#98a8b6',
} as const;

/** The mark's geometry: a jumper wire bent into an omega, with a pin at each end. */
export const MARK = {
  viewBox: '-1.5 1.1 43 29',
  path: 'M3 25 H15.5 A10.5 10.5 0 1 1 24.5 25 H37',
  strokeWidth: 3.8,
  pinLeft: { x: 0.5, y: 22, width: 5, height: 6, rx: 1 },
  pinRight: { x: 34.5, y: 22, width: 5, height: 6, rx: 1 },
  /** The centre of the drawn shape, for centring it inside a tile. */
  center: { x: 20, y: 15.55 },
} as const;
