import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const create = vi.fn();

vi.mock('@anthropic-ai/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@anthropic-ai/sdk')>();
  class FakeAnthropic {
    messages = { create };
    static RateLimitError = actual.default.RateLimitError;
    static AuthenticationError = actual.default.AuthenticationError;
    static APIError = actual.default.APIError;
  }
  return { ...actual, default: FakeAnthropic };
});

const validMessage = (parts: unknown[]) => ({
  stop_reason: 'end_turn',
  content: [{ type: 'text', text: JSON.stringify({ parts, unrecognised: [], notes: '' }) }],
});

/** A route module with a fresh rate limiter, since the limiter is module state. */
async function loadRoute() {
  vi.resetModules();
  return (await import('@/app/api/scan/route')).POST;
}

function photo(type = 'image/jpeg', size = 1000) {
  return new File([new Uint8Array(size)], 'p.jpg', { type });
}

function post(files: File[], ip = '1.2.3.4') {
  const form = new FormData();
  files.forEach((f) => form.append('photos', f));
  return new Request('http://localhost/api/scan', { method: 'POST', body: form, headers: { 'x-forwarded-for': ip } });
}

beforeEach(() => {
  create.mockReset();
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  vi.stubEnv('SCAN_PER_HOUR', '');
  vi.stubEnv('SCAN_DAILY_LIMIT', '');
  vi.stubEnv('JUMPER_VISION_MODEL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/scan', () => {
  it('fails closed with 503 when there is no API key, before touching the upload', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const POST = await loadRoute();
    const res = await POST(post([photo()]));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('not_configured');
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects no photos, too many photos, wrong types and oversize photos', async () => {
    const POST = await loadRoute();
    expect((await POST(post([]))).status).toBe(400);
    expect((await POST(post(Array.from({ length: 6 }, () => photo())))).status).toBe(400);
    expect((await POST(post([photo('image/gif')]))).status).toBe(400);
    expect((await POST(post([photo('image/jpeg', 2 * 1024 * 1024 + 1)]))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a body that is not a form', async () => {
    const POST = await loadRoute();
    const res = await POST(new Request('http://localhost/api/scan', { method: 'POST', body: '{"x":1}', headers: { 'content-type': 'application/json' } }));
    expect(res.status).toBe(400);
  });

  it('returns validated parts and sends every photo to the model', async () => {
    create.mockResolvedValue(
      validMessage([
        { id: 'uno', qty: 1, confidence: 'high', evidence: 'blue board' },
        { id: 'not-in-catalog', qty: 2, confidence: 'high', evidence: 'x' },
      ]),
    );
    const POST = await loadRoute();
    const res = await POST(post([photo(), photo('image/png')]));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.parts.map((p: { id: string }) => p.id)).toEqual(['uno']);

    const params = create.mock.calls[0][0];
    expect(params.model).toBe('claude-opus-5-5');
    expect(params.messages[0].content.filter((b: { type: string }) => b.type === 'image')).toHaveLength(2);
  });

  it('uses JUMPER_VISION_MODEL when it is set', async () => {
    vi.stubEnv('JUMPER_VISION_MODEL', 'claude-sonnet-5-5');
    create.mockResolvedValue(validMessage([]));
    const POST = await loadRoute();
    await POST(post([photo()]));
    expect(create.mock.calls[0][0].model).toBe('claude-sonnet-5-5');
  });

  it('limits scans per visitor and does not count invalid uploads', async () => {
    vi.stubEnv('SCAN_PER_HOUR', '2');
    create.mockResolvedValue(validMessage([]));
    const POST = await loadRoute();

    // Bad requests are free.
    expect((await POST(post([photo('image/gif')]))).status).toBe(400);
    expect((await POST(post([]))).status).toBe(400);

    expect((await POST(post([photo()]))).status).toBe(200);
    expect((await POST(post([photo()]))).status).toBe(200);
    const blocked = await POST(post([photo()]));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
    expect((await blocked.json()).error).toBe('rate_limited');
    expect(create).toHaveBeenCalledTimes(2);

    // A different visitor is unaffected.
    expect((await POST(post([photo()], '9.9.9.9'))).status).toBe(200);
  });

  it('enforces the daily cap across visitors', async () => {
    vi.stubEnv('SCAN_DAILY_LIMIT', '1');
    create.mockResolvedValue(validMessage([]));
    const POST = await loadRoute();
    expect((await POST(post([photo()], '1.1.1.1'))).status).toBe(200);
    const res = await POST(post([photo()], '2.2.2.2'));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe('daily_limit');
  });

  it('turns a model refusal into a friendly 422', async () => {
    create.mockResolvedValue({ stop_reason: 'refusal', content: [] });
    const POST = await loadRoute();
    const res = await POST(post([photo()]));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe('refused');
  });

  it('maps API errors to safe messages and never leaks their detail', async () => {
    const { default: Anthropic } = await vi.importActual<typeof import('@anthropic-ai/sdk')>('@anthropic-ai/sdk');
    const POST = await loadRoute();

    create.mockRejectedValueOnce(new Anthropic.RateLimitError(429, undefined, 'secret detail', new Headers()));
    let res = await POST(post([photo()], 'a'));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('busy');

    create.mockRejectedValueOnce(new Anthropic.AuthenticationError(401, undefined, 'invalid x-api-key sk-ant-secret', new Headers()));
    res = await POST(post([photo()], 'b'));
    const auth = await res.json();
    expect(res.status).toBe(503);
    expect(auth.error).toBe('not_configured');
    expect(JSON.stringify(auth)).not.toContain('sk-ant');

    create.mockRejectedValueOnce(new Anthropic.APIError(500, undefined, 'boom internal', new Headers()));
    res = await POST(post([photo()], 'c'));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain('boom');

    create.mockRejectedValueOnce(new Error('network down'));
    res = await POST(post([photo()], 'd'));
    expect(res.status).toBe(500);
  });
});
