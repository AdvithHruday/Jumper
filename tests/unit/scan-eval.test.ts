import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { ITEMS } from '@/content/library/items';
import { LOOKS } from '@/content/library/looks';
import { buildScanParams, parseScanMessage, DEFAULT_VISION_MODEL, type ScanImage } from '@/lib/scan/request';
import type { ScannedPart } from '@/lib/scan/types';

/**
 * Accuracy check for the photo scanner, run against YOUR photos. Skipped
 * unless SCAN_EVAL_DIR is set, because it calls the real API and costs money
 * (roughly a few US cents per set of photos).
 *
 * Setup:
 *   1. Put photos of real parts in a folder, e.g. tests/scan-eval/photos/.
 *      Aim for 20+ sets in varied light, with mixed clone boards and a hand or
 *      shadow in some. Do not use stock images; the point is your real desk.
 *   2. Add labels.json next to them:
 *        { "sets": [ { "photos": ["kit1-a.jpg", "kit1-b.jpg"],
 *                      "parts": { "uno": 1, "led-5mm": 5, "res-220": 2 } } ] }
 *      "parts" is the exact truth: every catalog part in the photos, with counts.
 *   3. SCAN_EVAL_DIR=tests/scan-eval ANTHROPIC_API_KEY=... npx vitest run tests/unit/scan-eval
 *
 * It prints a table and writes results.json. It FAILS if the precision of
 * "high" confidence predictions (the ones the UI ticks for the student) is
 * below SCAN_EVAL_MIN_PRECISION (default 0.9): a wrong part in a student's kit
 * is worse than a missing one.
 */

const dir = process.env.SCAN_EVAL_DIR;

interface LabelSet {
  photos: string[];
  parts: Record<string, number>;
}

const MIME: Record<string, ScanImage['mediaType']> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

describe.skipIf(!dir)('photo scan accuracy (real API)', () => {
  it('meets the precision bar on the labelled photos', async () => {
    const root = path.resolve(dir!);
    const labels = JSON.parse(fs.readFileSync(path.join(root, 'labels.json'), 'utf8')) as { sets: LabelSet[] };
    const catalog = ITEMS.map((i) => ({ id: i.id, name: i.name, look: LOOKS[i.id] ?? '' }));
    const ids = new Set(catalog.map((c) => c.id));
    const client = new Anthropic();
    const model = process.env.JUMPER_VISION_MODEL || DEFAULT_VISION_MODEL;

    // Per part: predictions made, predictions that were right (kind level), and
    // the same for "high" confidence only. Recall counts truth parts found.
    const stat = new Map<string, { pred: number; tp: number; highPred: number; highTp: number; truth: number; found: number; exactCount: number }>();
    const row = (id: string) => {
      if (!stat.has(id)) stat.set(id, { pred: 0, tp: 0, highPred: 0, highTp: 0, truth: 0, found: 0, exactCount: 0 });
      return stat.get(id)!;
    };

    const perSet: { photos: string[]; predicted: ScannedPart[]; truth: Record<string, number> }[] = [];

    for (const set of labels.sets) {
      const images: ScanImage[] = set.photos.map((file) => ({
        data: fs.readFileSync(path.join(root, file)).toString('base64'),
        mediaType: MIME[path.extname(file).toLowerCase()] ?? 'image/jpeg',
      }));
      const message = await client.messages.create(buildScanParams(images, catalog, model));
      const parsed = parseScanMessage(message, ids);
      const predicted = parsed.ok ? parsed.result.parts : [];
      perSet.push({ photos: set.photos, predicted, truth: set.parts });

      for (const [id, qty] of Object.entries(set.parts)) {
        const r = row(id);
        r.truth++;
        const hit = predicted.find((p) => p.id === id);
        if (hit) {
          r.found++;
          if (hit.qty === qty) r.exactCount++;
        }
      }
      for (const p of predicted) {
        const r = row(p.id);
        const right = p.id in set.parts;
        r.pred++;
        if (right) r.tp++;
        if (p.confidence === 'high') {
          r.highPred++;
          if (right) r.highTp++;
        }
      }
    }

    const pct = (a: number, b: number) => (b === 0 ? 'n/a' : `${Math.round((a / b) * 100)}%`);
    const table = [...stat.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, s]) => ({
        part: id,
        'precision (all)': pct(s.tp, s.pred),
        'precision (high)': pct(s.highTp, s.highPred),
        recall: pct(s.found, s.truth),
        'exact count': pct(s.exactCount, s.found),
        sets: s.truth,
      }));
    console.table(table);

    const highPred = [...stat.values()].reduce((a, s) => a + s.highPred, 0);
    const highTp = [...stat.values()].reduce((a, s) => a + s.highTp, 0);
    const highPrecision = highPred === 0 ? 1 : highTp / highPred;
    console.log(`Overall precision of "high" predictions: ${Math.round(highPrecision * 100)}% (${highTp}/${highPred}), model ${model}`);

    fs.writeFileSync(path.join(root, 'results.json'), JSON.stringify({ model, highPrecision, table, perSet }, null, 2));

    const min = Number(process.env.SCAN_EVAL_MIN_PRECISION ?? 0.9);
    expect(highPrecision, 'precision of "high" confidence predictions').toBeGreaterThanOrEqual(min);
  }, 30 * 60 * 1000);
});
