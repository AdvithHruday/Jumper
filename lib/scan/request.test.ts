import { describe, it, expect } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { buildScanParams, buildOutputSchema, buildSystemPrompt, parseScanMessage, DEFAULT_VISION_MODEL } from './request';

const catalog = [
  { id: 'uno', name: 'Arduino Uno', look: 'blue board with a USB-B socket' },
  { id: 'led-5mm', name: '5 mm LED', look: 'small dome with two legs' },
  { id: 'res-220', name: '220 ohm resistor', look: 'red red brown gold' },
];
const ids = new Set(catalog.map((c) => c.id));

const message = (text: string | null, stop_reason: string = 'end_turn'): Anthropic.Message =>
  ({
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5-5',
    stop_reason,
    content: text === null ? [] : [{ type: 'text', text }],
  }) as unknown as Anthropic.Message;

const answer = (parts: unknown[], extra: Record<string, unknown> = {}) =>
  JSON.stringify({ parts, unrecognised: [], notes: '', ...extra });

describe('buildScanParams', () => {
  const images = [
    { data: 'AAA', mediaType: 'image/jpeg' as const },
    { data: 'BBB', mediaType: 'image/png' as const },
  ];

  it('sends every photo as an image block followed by the instruction', () => {
    const p = buildScanParams(images, catalog);
    const content = p.messages[0].content as Anthropic.ContentBlockParam[];
    expect(content.filter((b) => b.type === 'image')).toHaveLength(2);
    expect(content[content.length - 1].type).toBe('text');
    expect(JSON.stringify(content[0])).toContain('"data":"AAA"');
  });

  it('uses the default model unless one is given', () => {
    expect(buildScanParams(images, catalog).model).toBe(DEFAULT_VISION_MODEL);
    expect(buildScanParams(images, catalog, 'claude-sonnet-5-5').model).toBe('claude-sonnet-5-5');
  });

  it('asks for structured output limited to the catalog ids, at medium effort', () => {
    const p = buildScanParams(images, catalog);
    expect(p.output_config?.effort).toBe('medium');
    const schema = p.output_config?.format?.schema as ReturnType<typeof buildOutputSchema>;
    expect(schema.properties.parts.items.properties.id.enum).toEqual(['uno', 'led-5mm', 'res-220']);
    expect(schema.additionalProperties).toBe(false);
  });

  it('puts every catalog part and what it looks like in the system prompt', () => {
    const system = buildSystemPrompt(catalog);
    for (const c of catalog) {
      expect(system).toContain(c.id);
      expect(system).toContain(c.look);
    }
  });

  it('does not use forced tool choice, prefill or sampling parameters', () => {
    const p = buildScanParams(images, catalog) as unknown as Record<string, unknown>;
    expect(p.tool_choice).toBeUndefined();
    expect(p.temperature).toBeUndefined();
    expect(p.thinking).toBeUndefined();
    const last = (p.messages as { role: string }[]).at(-1);
    expect(last?.role).toBe('user');
  });
});

describe('parseScanMessage', () => {
  it('returns validated parts', () => {
    const r = parseScanMessage(
      message(answer([{ id: 'led-5mm', qty: 5, confidence: 'high', evidence: 'five domes' }], { notes: ' blurry ', unrecognised: ['OLED display', 'OLED display'] })),
      ids,
    );
    expect(r).toEqual({
      ok: true,
      result: {
        parts: [{ id: 'led-5mm', qty: 5, confidence: 'high', evidence: 'five domes' }],
        unrecognised: ['OLED display'],
        notes: 'blurry',
      },
    });
  });

  it('drops ids that are not in the catalog', () => {
    const r = parseScanMessage(
      message(answer([{ id: 'flux-capacitor', qty: 1, confidence: 'high', evidence: 'x' }, { id: 'uno', qty: 1, confidence: 'high', evidence: 'y' }])),
      ids,
    );
    expect(r.ok && r.result.parts.map((p) => p.id)).toEqual(['uno']);
  });

  it('merges duplicate ids, adding counts and keeping the lower confidence', () => {
    const r = parseScanMessage(
      message(answer([
        { id: 'led-5mm', qty: 3, confidence: 'high', evidence: 'a' },
        { id: 'led-5mm', qty: 2, confidence: 'low', evidence: 'b' },
      ])),
      ids,
    );
    expect(r.ok && r.result.parts).toEqual([{ id: 'led-5mm', qty: 5, confidence: 'low', evidence: 'a' }]);
  });

  it('reports a refusal, a truncated answer, and an empty one, without throwing', () => {
    expect(parseScanMessage(message(null, 'refusal'), ids)).toMatchObject({ ok: false, error: 'refused' });
    expect(parseScanMessage(message('{"parts":[', 'max_tokens'), ids)).toMatchObject({ ok: false, error: 'unreadable' });
    expect(parseScanMessage(message(null), ids)).toMatchObject({ ok: false, error: 'unreadable' });
  });

  it('rejects text that is not JSON', () => {
    expect(parseScanMessage(message('Sure! I can see an Arduino.'), ids)).toMatchObject({ ok: false, error: 'unreadable' });
  });

  it('rejects JSON of the wrong shape or with a bad quantity', () => {
    expect(parseScanMessage(message('{"parts":"none"}'), ids)).toMatchObject({ ok: false });
    expect(
      parseScanMessage(message(answer([{ id: 'uno', qty: 0, confidence: 'high', evidence: 'x' }])), ids),
    ).toMatchObject({ ok: false });
    expect(
      parseScanMessage(message(answer([{ id: 'uno', qty: 1, confidence: 'certain', evidence: 'x' }])), ids),
    ).toMatchObject({ ok: false });
  });

  it('accepts an empty result', () => {
    expect(parseScanMessage(message(answer([])), ids)).toEqual({
      ok: true,
      result: { parts: [], unrecognised: [], notes: '' },
    });
  });
});
