import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { contrast, AA_TEXT, AA_UI } from './contrast';

/**
 * The design tokens are a contract: every text colour must be readable on the
 * surfaces it is used on, in both themes, and every control border must be
 * visible. Axe checks the rendered page, but it can miss a bad colour that no
 * page happens to show yet; this checks the tokens themselves.
 */

const css = fs.readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8');

function vars(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]] = m[2];
  return out;
}

function grab(re: RegExp, what: string): string {
  const m = css.match(re);
  if (!m) throw new Error(`Could not find the ${what} block in globals.css`);
  return m[1];
}

const lightBlock = grab(/^:root\s*\{([^}]*)\}/m, 'light :root');
const darkMediaBlock = grab(
  /@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/,
  'dark (media query)',
);
const darkAttrBlock = grab(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/, 'dark (data-theme)');

const light = vars(lightBlock);
const dark = { ...light, ...vars(darkAttrBlock) };

/** [foreground token, background token, minimum ratio, why] */
const PAIRS: [string, string, number, string][] = [
  ['ink', 'bg', AA_TEXT, 'body text on the page'],
  ['ink', 'panel', AA_TEXT, 'body text on a panel'],
  ['ink', 'panel-2', AA_TEXT, 'body text on a subtle surface'],
  ['muted', 'bg', AA_TEXT, 'secondary text on the page'],
  ['muted', 'panel', AA_TEXT, 'secondary text on a panel'],
  ['muted', 'panel-2', AA_TEXT, 'secondary text on a subtle surface'],
  ['link', 'bg', AA_TEXT, 'links on the page'],
  ['link', 'panel', AA_TEXT, 'links on a panel'],
  ['on-accent', 'accent', AA_TEXT, 'text on the primary (yellow) button'],
  ['on-ok', 'ok', AA_TEXT, 'text on a green button'],
  ['ok', 'bg', AA_TEXT, 'success text on the page'],
  ['ok', 'panel', AA_TEXT, 'success text on a panel'],
  ['ok', 'ok-soft', AA_TEXT, 'success text on its tint'],
  ['bad', 'bg', AA_TEXT, 'error text on the page'],
  ['bad', 'panel', AA_TEXT, 'error text on a panel'],
  ['bad', 'bad-soft', AA_TEXT, 'error text on its tint'],
  ['warn', 'panel', AA_TEXT, 'warning text on a panel'],
  ['warn', 'warn-soft', AA_TEXT, 'warning text on its tint'],
  ['link', 'info-soft', AA_TEXT, 'info text on its tint'],
  ['ink', 'accent-soft', AA_TEXT, 'text on the highlight tint'],
  ['border-ui', 'bg', AA_UI, 'control border on the page'],
  ['border-ui', 'panel', AA_UI, 'control border on a panel'],
  ['code-ink', 'code-bg', AA_TEXT, 'code text'],
];

describe.each([
  ['light', light],
  ['dark', dark],
] as const)('%s theme tokens', (_name, tokens) => {
  for (const [fg, bg, min, why] of PAIRS) {
    it(`${fg} on ${bg} is at least ${min}:1 (${why})`, () => {
      expect(tokens[fg], `--${fg} is not defined`).toBeDefined();
      expect(tokens[bg], `--${bg} is not defined`).toBeDefined();
      expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(min);
    });
  }
});

describe('token structure', () => {
  it('the two dark blocks are identical, so OS-dark and forced-dark cannot drift', () => {
    expect(vars(darkMediaBlock)).toEqual(vars(darkAttrBlock));
  });

  it('every dark override replaces a token that exists in the light theme', () => {
    for (const name of Object.keys(vars(darkAttrBlock))) {
      expect(light[name], `--${name} is overridden in dark but not defined in :root`).toBeDefined();
    }
  });

  it('every colour token mapped into Tailwind is defined', () => {
    const themeBlock = grab(/@theme inline\s*\{([^}]*)\}/, '@theme inline');
    for (const m of themeBlock.matchAll(/--color-[a-z0-9-]+:\s*var\(--([a-z0-9-]+)\)/g)) {
      expect(light[m[1]], `--${m[1]} is mapped in @theme but not defined in :root`).toBeDefined();
    }
  });
});
