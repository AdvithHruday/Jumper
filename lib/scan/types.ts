import { z } from 'zod';

/**
 * What the photo scanner returns. The model only *proposes* parts: the student
 * confirms each one before it reaches their kit.
 */

export const confidenceSchema = z.enum(['high', 'medium', 'low']);

export const scannedPartSchema = z.object({
  /** A library item id. Anything not in the catalog is dropped on the server. */
  id: z.string().min(1),
  qty: z.number().int().min(1).max(50),
  confidence: confidenceSchema,
  /** One short line on what in the photo led to this, so the student can check. */
  evidence: z.string(),
});

/** Exactly what the model is asked to return. */
export const modelOutputSchema = z.object({
  parts: z.array(scannedPartSchema),
  /** Electronic parts that are visible but are not in the catalog. */
  unrecognised: z.array(z.string()),
  /** Anything the student should know: blurry photo, hidden parts, etc. */
  notes: z.string(),
});

export type Confidence = z.infer<typeof confidenceSchema>;
export type ScannedPart = z.infer<typeof scannedPartSchema>;
export type ModelOutput = z.infer<typeof modelOutputSchema>;

/** What the route sends to the browser. */
export interface ScanResponse {
  parts: ScannedPart[];
  unrecognised: string[];
  notes: string;
}

export type ScanErrorCode =
  | 'not_configured'
  | 'rate_limited'
  | 'daily_limit'
  | 'bad_request'
  | 'busy'
  | 'refused'
  | 'unreadable'
  | 'failed';

export interface ScanError {
  error: ScanErrorCode;
  message: string;
}

/** Limits enforced by the route and mirrored in the UI. */
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
