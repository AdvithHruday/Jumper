import { describe, it, expect } from 'vitest';
import { createLimiter } from './limits';

const HOUR = 60 * 60 * 1000;
const opts = { perClient: 2, windowMs: HOUR, dailyCap: 5 };

describe('createLimiter', () => {
  it('allows up to the per-client limit, then blocks with a retry time', () => {
    const l = createLimiter(opts);
    expect(l.check('a', 0).ok).toBe(true);
    expect(l.check('a', 1000).ok).toBe(true);
    const third = l.check('a', 2000);
    expect(third).toMatchObject({ ok: false, reason: 'rate_limited' });
    expect(third.ok === false && third.retryAfterSec).toBe(Math.ceil((HOUR - 2000) / 1000));
  });

  it('counts each client separately', () => {
    const l = createLimiter(opts);
    l.check('a', 0);
    l.check('a', 0);
    expect(l.check('a', 1).ok).toBe(false);
    expect(l.check('b', 1).ok).toBe(true);
  });

  it('lets a client back in once the window has passed', () => {
    const l = createLimiter(opts);
    l.check('a', 0);
    l.check('a', 10);
    expect(l.check('a', HOUR - 1).ok).toBe(false);
    expect(l.check('a', HOUR + 11).ok).toBe(true);
  });

  it('enforces a daily cap across clients, then resets the next day', () => {
    const l = createLimiter({ perClient: 10, windowMs: HOUR, dailyCap: 3 });
    expect(l.check('a', 0).ok).toBe(true);
    expect(l.check('b', 0).ok).toBe(true);
    expect(l.check('c', 0).ok).toBe(true);
    expect(l.check('d', 0)).toMatchObject({ ok: false, reason: 'daily_limit' });
    expect(l.check('d', 24 * HOUR + 1).ok).toBe(true);
  });

  it('does not count a blocked attempt against the client', () => {
    const l = createLimiter({ perClient: 1, windowMs: HOUR, dailyCap: 100 });
    l.check('a', 0);
    l.check('a', 100);
    l.check('a', 200);
    expect(l.check('a', HOUR + 1).ok).toBe(true);
  });
});
