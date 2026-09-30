import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated accessibility scan of every route in both colour schemes. Axe
 * reads the rendered page, so it catches what the token test cannot (a
 * missing label, a heading level, a control with no name); the token test
 * catches what axe can miss (a bad colour no page shows yet). Both are needed.
 *
 * Axe only finds a fraction of accessibility problems. Passing is the floor,
 * not evidence of an accessible app.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

type Scenario = { name: string; path: string; act?: (page: Page) => Promise<void> };

const SCENARIOS: Scenario[] = [
  { name: 'home', path: '/' },
  { name: 'parts', path: '/parts' },
  { name: 'fix hub', path: '/fix' },
  { name: 'learn hub', path: '/learn' },
  { name: 'build (empty)', path: '/learn/build' },
  {
    name: 'build (kit chosen)',
    path: '/learn/build',
    act: async (page) => {
      await page.getByRole('button', { name: 'Bigger Uno kit' }).click();
      await page.getByRole('heading', { name: /you can build these now/i }).waitFor();
    },
  },
  { name: 'build project', path: '/learn/build/line-follower' },
  {
    name: 'check my code (findings)',
    path: '/fix/code',
    act: async (page) => {
      await page.getByRole('button', { name: /try an example with bugs/i }).click();
      await page.getByText(/problems?,/).waitFor();
    },
  },
  {
    name: 'upload doctor (diagnosis)',
    path: '/fix/upload',
    act: async (page) => {
      await page.getByRole('button', { name: /try an example/i }).click();
      await page.getByText('Most likely', { exact: true }).waitFor();
    },
  },
  { name: 'guided step', path: '/learn/projects/first-light/4' },
  { name: 'guided checkpoint', path: '/learn/projects/first-light/8' },
  { name: 'design system', path: '/design' },
  { name: 'about', path: '/about' },
  { name: '404 page', path: '/no-such-page' },
  { name: 'privacy', path: '/privacy' },
  {
    name: 'menu open',
    path: '/fix',
    act: async (page) => {
      await page.getByRole('button', { name: 'Menu' }).click();
      await page.locator('#site-menu').waitFor();
    },
  },
];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe, ${scheme} theme`, () => {
    test.skip(({ isMobile }) => isMobile, 'Scanned once, on the desktop project');

    for (const s of SCENARIOS) {
      test(s.name, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(s.path);
        await s.act?.(page);
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target.join(' ')}`);
        expect(summary, `${s.path} in ${scheme}`).toEqual([]);
      });
    }
  });
}
