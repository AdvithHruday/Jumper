import { describe, it, expect } from 'vitest';
import { getHomeStats } from './home';
import { BOARDS } from '@/content/boards';
import { UPLOAD_SIGNATURES } from '@/content/fix/upload-signatures';
import { RULES } from '@/lib/sketch/lint';

describe('getHomeStats', () => {
  const stats = Object.fromEntries(getHomeStats().map((s) => [s.label, s.value]));

  it('reports counts read from the content, not typed in', () => {
    expect(stats['upload errors recognised']).toBe(String(UPLOAD_SIGNATURES.length));
    expect(stats['pin checks']).toBe(String(RULES.length));
    expect(stats['boards']).toBe(String(BOARDS.length));
  });

  it('never shows a zero or an empty count', () => {
    for (const s of getHomeStats()) {
      expect(s.value.length).toBeGreaterThan(0);
      if (/^\d+$/.test(s.value)) expect(Number(s.value)).toBeGreaterThan(0);
    }
  });

  it('states the licence', () => {
    expect(stats['open source']).toBe('MIT');
  });
});
