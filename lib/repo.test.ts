import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { TEAM } from './brand';

const root = path.resolve(__dirname, '..');

describe('the repository is ready to be public', () => {
  it('has an MIT licence that names the authors (the Next Gen award requires an open-source licence file)', () => {
    const text = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
    expect(text).toMatch(/^MIT License/);
    expect(text).toMatch(/Copyright \(c\) 2026/);
    for (const person of TEAM) expect(text).toContain(person.name);
    expect(text).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
  });

  it('declares the same licence in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.license).toBe('MIT');
  });

  it('lists the team with well-formed emails', () => {
    expect(TEAM.length).toBeGreaterThan(0);
    for (const person of TEAM) expect(person.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});
