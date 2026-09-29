/**
 * Caps on how many scans one visitor, and the whole server, can run. Every
 * scan costs real money, so an open endpoint without limits is a bill waiting
 * to happen.
 *
 * State lives in memory. That is exact on one server process and only
 * approximate on serverless hosting, where each instance counts separately. It
 * is a guard against runaway use, not accounting; the provider's spend limit
 * is the real ceiling.
 */

export interface LimiterOptions {
  /** Scans one client may run per window. */
  perClient: number;
  windowMs: number;
  /** Scans the whole server may run per UTC day. */
  dailyCap: number;
}

export type LimitResult = { ok: true } | { ok: false; reason: 'rate_limited' | 'daily_limit'; retryAfterSec: number };

export interface Limiter {
  check(clientId: string, now?: number): LimitResult;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function createLimiter(opts: LimiterOptions): Limiter {
  const hits = new Map<string, number[]>();
  let day = -1;
  let dayCount = 0;

  return {
    check(clientId, now = Date.now()) {
      const today = Math.floor(now / DAY_MS);
      if (today !== day) {
        day = today;
        dayCount = 0;
      }
      if (dayCount >= opts.dailyCap) {
        return { ok: false, reason: 'daily_limit', retryAfterSec: Math.ceil(((today + 1) * DAY_MS - now) / 1000) };
      }

      const recent = (hits.get(clientId) ?? []).filter((t) => now - t < opts.windowMs);
      if (recent.length >= opts.perClient) {
        hits.set(clientId, recent);
        return { ok: false, reason: 'rate_limited', retryAfterSec: Math.ceil((recent[0] + opts.windowMs - now) / 1000) };
      }

      recent.push(now);
      hits.set(clientId, recent);
      dayCount++;

      // Keep the map from growing forever: drop clients with nothing recent.
      if (hits.size > 5000) {
        for (const [id, times] of hits) {
          if (times.every((t) => now - t >= opts.windowMs)) hits.delete(id);
        }
      }
      return { ok: true };
    },
  };
}
