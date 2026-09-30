import Anthropic from '@anthropic-ai/sdk';
import { ITEMS } from '@/content/library/items';
import { LOOKS } from '@/content/library/looks';
import { buildScanParams, parseScanMessage, DEFAULT_VISION_MODEL, type CatalogEntry, type ScanImage } from '@/lib/scan/request';
import { createLimiter } from '@/lib/scan/limits';
import { ALLOWED_TYPES, MAX_PHOTOS, MAX_PHOTO_BYTES, type ScanError } from '@/lib/scan/types';

/**
 * Photo scan: reads 1-5 photos of a student's parts and proposes what it can
 * see, from the library catalog only. The photos are forwarded to the Claude
 * API for this one request and never stored by Ohmwise.
 *
 * Needs ANTHROPIC_API_KEY on the server. Without it the route answers 503 and
 * the page falls back to picking parts by hand.
 *
 * Env (all optional except the key):
 *   JUMPER_VISION_MODEL      model id, default claude-opus-5-5
 *   SCAN_PER_HOUR            scans per visitor per hour, default 5
 *   SCAN_DAILY_LIMIT         scans per server per day, default 200
 */

export const maxDuration = 60;

const CATALOG: CatalogEntry[] = ITEMS.map((i) => ({ id: i.id, name: i.name, look: LOOKS[i.id] ?? '' }));
const VALID_IDS = new Set(CATALOG.map((c) => c.id));

const intEnv = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const limiter = createLimiter({
  perClient: intEnv('SCAN_PER_HOUR', 5),
  windowMs: 60 * 60 * 1000,
  dailyCap: intEnv('SCAN_DAILY_LIMIT', 200),
});

function fail(status: number, error: ScanError['error'], message: string, headers?: HeadersInit) {
  return Response.json({ error, message } satisfies ScanError, { status, headers });
}

function clientId(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip')) || 'unknown';
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(503, 'not_configured', 'Photo scan is not set up on this server yet. Pick your parts by hand instead.');
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'bad_request', 'Could not read the upload.');
  }

  const files = form.getAll('photos').filter((f): f is File => f instanceof File);
  if (files.length === 0 || files.length > MAX_PHOTOS) {
    return fail(400, 'bad_request', `Send between 1 and ${MAX_PHOTOS} photos.`);
  }

  const images: ScanImage[] = [];
  for (const file of files) {
    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return fail(400, 'bad_request', 'Photos must be JPEG, PNG or WebP.');
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return fail(400, 'bad_request', 'A photo is too large. Try a smaller one.');
    }
    images.push({
      data: Buffer.from(await file.arrayBuffer()).toString('base64'),
      mediaType: file.type as ScanImage['mediaType'],
    });
  }

  // Count the scan only once the request is valid, so a bad upload is free.
  const limit = limiter.check(clientId(req));
  if (!limit.ok) {
    return limit.reason === 'daily_limit'
      ? fail(429, 'daily_limit', 'Photo scan has reached its limit for today. Pick your parts by hand, or try tomorrow.', { 'Retry-After': String(limit.retryAfterSec) })
      : fail(429, 'rate_limited', 'You have scanned a lot in the last hour. Wait a bit, or pick your parts by hand.', { 'Retry-After': String(limit.retryAfterSec) });
  }

  const client = new Anthropic();
  try {
    const message = await client.messages.create(
      buildScanParams(images, CATALOG, process.env.JUMPER_VISION_MODEL || DEFAULT_VISION_MODEL),
    );
    const parsed = parseScanMessage(message, VALID_IDS);
    if (!parsed.ok) return fail(422, parsed.error, parsed.message);
    return Response.json(parsed.result);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return fail(503, 'busy', 'Photo scan is busy right now. Try again in a minute.');
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('scan: Anthropic rejected the API key');
      return fail(503, 'not_configured', 'Photo scan is not set up correctly on this server. Pick your parts by hand instead.');
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`scan: API error ${error.status}: ${error.message}`);
      return fail(502, 'failed', 'Photo scan failed. Try again, or pick your parts by hand.');
    }
    console.error('scan: unexpected error', error);
    return fail(500, 'failed', 'Photo scan failed. Try again, or pick your parts by hand.');
  }
}
