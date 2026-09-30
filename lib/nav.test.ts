import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MENU_GROUPS, SECTIONS, activeSection } from './nav';

describe('activeSection', () => {
  it.each([
    ['/fix', 'fix'],
    ['/fix/upload', 'fix'],
    ['/fix/code', 'fix'],
    ['/learn', 'learn'],
    ['/learn/projects/first-light/3', 'learn'],
    ['/learn/build/line-follower', 'learn'],
    ['/parts', 'parts'],
  ])('%s belongs to %s', (pathname, section) => {
    expect(activeSection(pathname)).toBe(section);
  });

  it.each(['/', '/about', '/privacy', '/design', '/fixate', '/learning'])('%s belongs to no section', (pathname) => {
    expect(activeSection(pathname)).toBeNull();
  });
});

describe('navigation links point at real pages', () => {
  const appDir = path.resolve(__dirname, '../app');
  const internal = [
    ...SECTIONS.map((s) => s.href),
    ...MENU_GROUPS.flatMap((g) => g.links).filter((l) => !l.external).map((l) => l.href),
  ];

  for (const href of internal) {
    it(`${href} has a page`, () => {
      const file = path.join(appDir, href === '/' ? '' : href, 'page.tsx');
      expect(fs.existsSync(file), `${file} is missing`).toBe(true);
    });
  }

  it('has no duplicate links in the menu', () => {
    const hrefs = MENU_GROUPS.flatMap((g) => g.links.map((l) => l.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('opens outside links safely: only external links are marked external, and they are https', () => {
    for (const link of MENU_GROUPS.flatMap((g) => g.links)) {
      if (link.external) expect(link.href).toMatch(/^https:\/\//);
      else expect(link.href.startsWith('/')).toBe(true);
    }
  });
});
