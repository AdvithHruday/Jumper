import type Anthropic from '@anthropic-ai/sdk';
import { modelOutputSchema, type ScanResponse } from './types';

/**
 * Builds the Claude request for a photo scan and reads the answer back. Both
 * halves are pure so they can be tested without a network or an API key.
 */

export interface CatalogEntry {
  id: string;
  name: string;
  /** What it looks like in a photo. */
  look: string;
}

/** The model that reads photos. Override with JUMPER_VISION_MODEL. */
export const DEFAULT_VISION_MODEL = 'claude-opus-5-5';

export function buildSystemPrompt(catalog: CatalogEntry[]): string {
  const list = catalog.map((c) => `- ${c.id}: ${c.name}. Looks like: ${c.look}`).join('\n');
  return `You identify electronics parts in photos for a student who is building Arduino and ESP32 projects. Your answer decides which projects the student is told they can build, so a wrong part is worse than a missing one.

Report only parts from this catalog, using the exact id:

${list}

Rules:
- Report only what you can actually see. Never assume a part is present because it usually comes in a kit.
- Count carefully. If parts are piled up or overlapping, give your best count and lower the confidence.
- For resistors, read the colour bands and use the matching id only when the bands are clearly readable. Otherwise use confidence "low", and put the bands you think you see in the evidence.
- If a part looks like a catalog part but you are not sure which, pick the closest and use confidence "low" or "medium".
- Use "high" only when you are sure of both what it is and how many.
- Put electronic parts you can see that are NOT in the catalog in "unrecognised", by a short plain name (for example "OLED display", "relay module"). Ignore cables, tools, packaging and anything that is not electronics.
- The same part can appear in several photos of the same desk. Count each physical part once, not once per photo.
- In "evidence", write one short line saying what you saw (for example "two blue boards with silver cylinders on the front").
- In "notes", mention anything that limits how far the student can trust the result, such as a blurry photo or parts hidden under others. Use an empty string if there is nothing to add.`;
}

/** JSON Schema for the answer. Ids are constrained to the catalog. */
export function buildOutputSchema(ids: string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['parts', 'unrecognised', 'notes'],
    properties: {
      parts: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'qty', 'confidence', 'evidence'],
          properties: {
            id: { type: 'string', enum: ids },
            qty: { type: 'integer' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            evidence: { type: 'string' },
          },
        },
      },
      unrecognised: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string' },
    },
  };
}

export interface ScanImage {
  /** Base64, no data: prefix. */
  data: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export function buildScanParams(
  images: ScanImage[],
  catalog: CatalogEntry[],
  model: string = DEFAULT_VISION_MODEL,
): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model,
    max_tokens: 4000,
    system: buildSystemPrompt(catalog),
    // Reading a desk of parts is perception, not deep reasoning; medium keeps
    // the answer accurate without paying for the top effort levels.
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: buildOutputSchema(catalog.map((c) => c.id)) },
    },
    messages: [
      {
        role: 'user',
        content: [
          ...images.map(
            (img): Anthropic.ImageBlockParam => ({
              type: 'image',
              source: { type: 'base64', media_type: img.mediaType, data: img.data },
            }),
          ),
          {
            type: 'text',
            text:
              images.length === 1
                ? 'Identify the electronics parts in this photo.'
                : `These ${images.length} photos show the same set of parts from different angles. Identify the electronics parts, counting each physical part once.`,
          },
        ],
      },
    ],
  };
}

export type ParseResult =
  | { ok: true; result: ScanResponse }
  | { ok: false; error: 'refused' | 'unreadable'; message: string };

/**
 * Turns the model's message into a validated result. Drops any part whose id
 * is not in the catalog (a structured-output schema should prevent that, but
 * the student's kit must never depend on the model obeying it) and merges
 * duplicate ids, keeping the lowest confidence.
 */
export function parseScanMessage(message: Anthropic.Message, validIds: Set<string>): ParseResult {
  if (message.stop_reason === 'refusal') {
    return { ok: false, error: 'refused', message: 'The photo could not be read. Try a clearer photo, or add your parts by hand.' };
  }
  if (message.stop_reason === 'max_tokens') {
    return { ok: false, error: 'unreadable', message: 'The answer was cut off. Try fewer photos, or add your parts by hand.' };
  }

  const text = message.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text;
  if (!text) {
    return { ok: false, error: 'unreadable', message: 'No answer came back. Try again, or add your parts by hand.' };
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'unreadable', message: 'The answer could not be read. Try again, or add your parts by hand.' };
  }

  const parsed = modelOutputSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: 'unreadable', message: 'The answer was not in the expected form. Try again, or add your parts by hand.' };
  }

  const rank = { high: 2, medium: 1, low: 0 } as const;
  const merged = new Map<string, ScanResponse['parts'][number]>();
  for (const part of parsed.data.parts) {
    if (!validIds.has(part.id)) continue;
    const seen = merged.get(part.id);
    if (!seen) {
      merged.set(part.id, { ...part });
    } else {
      merged.set(part.id, {
        ...seen,
        qty: Math.min(seen.qty + part.qty, 50),
        confidence: rank[part.confidence] < rank[seen.confidence] ? part.confidence : seen.confidence,
        evidence: seen.evidence || part.evidence,
      });
    }
  }

  return {
    ok: true,
    result: {
      parts: [...merged.values()],
      unrecognised: [...new Set(parsed.data.unrecognised.map((s) => s.trim()).filter(Boolean))].slice(0, 20),
      notes: parsed.data.notes.trim(),
    },
  };
}
