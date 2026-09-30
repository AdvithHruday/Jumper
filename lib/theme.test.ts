import { describe, it, expect } from 'vitest';
import { THEME_INIT_SCRIPT, THEME_KEY } from './theme';

/**
 * The init script runs before the page paints, so a wrong script means a white
 * flash for every dark-mode visitor, or worse, a thrown error that stops the
 * rest of <head>. It is plain text, so it is tested by actually running it.
 */
function run(stored: string | null | 'throws') {
  const attrs: Record<string, string> = {};
  const localStorage = {
    getItem: (key: string) => {
      if (stored === 'throws') throw new Error('blocked');
      return key === THEME_KEY ? stored : null;
    },
  };
  const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
  new Function('localStorage', 'document', THEME_INIT_SCRIPT)(localStorage, document);
  return attrs;
}

describe('THEME_INIT_SCRIPT', () => {
  it('applies a stored dark or light choice', () => {
    expect(run('dark')).toEqual({ 'data-theme': 'dark' });
    expect(run('light')).toEqual({ 'data-theme': 'light' });
  });

  it('leaves the page on the system theme when nothing is stored', () => {
    expect(run(null)).toEqual({});
  });

  it('ignores a value it does not recognise', () => {
    expect(run('purple')).toEqual({});
    expect(run('system')).toEqual({});
  });

  it('does not throw when storage is blocked', () => {
    expect(() => run('throws')).not.toThrow();
    expect(run('throws')).toEqual({});
  });

  it('uses the same key the app writes', () => {
    expect(THEME_INIT_SCRIPT).toContain(`'${THEME_KEY}'`);
  });
});
