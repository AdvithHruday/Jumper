'use client';

import { useEffect, useRef, useState } from 'react';
import { ITEMS_BY_ID } from '@/content/library';
import { compressImage, UnsupportedImageError } from '@/lib/scan/image';
import { MAX_PHOTOS, type Confidence, type ScanResponse } from '@/lib/scan/types';
import { useKit } from '@/lib/library/store';

interface Photo {
  key: string;
  file: File;
  url: string;
}

interface Pick {
  checked: boolean;
  qty: number;
}

const CONFIDENCE: Record<Confidence, string> = {
  high: 'Sure',
  medium: 'Check this',
  low: 'Not sure',
};

const isResistor = (id: string) => id.startsWith('res-');

const BTN = 'h-9 w-9 rounded-lg font-bold shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:bg-panel disabled:opacity-50';
const SECONDARY = 'rounded-[10px] px-4 py-2.5 font-bold shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:bg-panel';

export function PhotoScan() {
  const addMany = useKit((s) => s.addMany);
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [added, setAdded] = useState<number | null>(null);

  // Free the preview URLs when the photos change or the component goes away.
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  function choose(files: FileList | null) {
    if (!files) return;
    setError(null);
    setAdded(null);
    const images = [...files].filter((f) => f.type.startsWith('image/'));
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const next = images.slice(0, Math.max(0, room)).map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        url: URL.createObjectURL(file),
      }));
      if (images.length > room) setError(`You can scan up to ${MAX_PHOTOS} photos at a time.`);
      return [...prev, ...next];
    });
    if (inputRef.current) inputRef.current.value = '';
  }

  function remove(key: string) {
    setPhotos((prev) => prev.filter((p) => p.key !== key));
    setError(null);
  }

  async function scan() {
    setBusy(true);
    setError(null);
    setAdded(null);
    try {
      const blobs = await Promise.all(photos.map((p) => compressImage(p.file)));
      const form = new FormData();
      blobs.forEach((b, i) => form.append('photos', b, `photo-${i + 1}.jpg`));

      const res = await fetch('/api/scan', { method: 'POST', body: form });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message ?? 'Photo scan failed. Pick your parts by hand instead.');
        return;
      }

      const data = body as ScanResponse;
      setResult(data);
      setPicks(
        Object.fromEntries(
          data.parts.map((p) => [
            p.id,
            // Only tick what the scanner is sure of. Resistor values come from
            // colour bands, which are easy to misread, so the student opts in.
            { checked: p.confidence === 'high' && !isResistor(p.id), qty: p.qty },
          ]),
        ),
      );
    } catch (e) {
      setError(e instanceof UnsupportedImageError ? e.message : 'Could not reach the scanner. Check your connection, or pick your parts by hand.');
    } finally {
      setBusy(false);
    }
  }

  function confirm() {
    if (!result) return;
    const chosen = Object.fromEntries(
      result.parts.filter((p) => picks[p.id]?.checked && picks[p.id].qty > 0).map((p) => [p.id, picks[p.id].qty]),
    );
    addMany(chosen);
    setAdded(Object.keys(chosen).length);
    setResult(null);
    setPhotos([]);
  }

  function discard() {
    setResult(null);
  }

  const checkedCount = result ? result.parts.filter((p) => picks[p.id]?.checked).length : 0;

  return (
    <section
      aria-labelledby="scan-heading"
      className="mb-8 rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_var(--line)]"
    >
      <h3 id="scan-heading" className="m-0 text-xl font-extrabold">
        Scan your parts
      </h3>
      <p className="mb-0 mt-1 text-[15px] text-muted">
        Lay your parts out on a table in good light and take up to {MAX_PHOTOS} photos. We suggest what we can see, and
        you confirm before anything is added to your kit.
      </p>

      {!result && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <label className={`${SECONDARY} cursor-pointer`}>
              Choose photos
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => choose(e.target.files)}
                disabled={busy || photos.length >= MAX_PHOTOS}
              />
            </label>
            {photos.length > 0 && (
              <button
                type="button"
                onClick={scan}
                disabled={busy}
                className="rounded-[10px] bg-accent px-4 py-2.5 font-bold text-on-accent hover:brightness-105 disabled:opacity-60"
              >
                {busy ? 'Reading your photos…' : `Scan ${photos.length} photo${photos.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>

          {photos.length > 0 && (
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
              {photos.map((p, i) => (
                <li key={p.key} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Photo ${i + 1} of your parts`} className="h-20 w-20 rounded-lg object-cover" />
                  {!busy && (
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => remove(p.key)}
                      className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-ink text-[13px] font-bold text-bg"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="mb-0 mt-3 text-[13px] text-muted">
            When you tap Scan, your photos are sent to Claude (by Anthropic) to identify the parts. Jumper does not
            store them, and location data is removed before they leave your device.
          </p>
        </>
      )}

      {error && (
        <p role="alert" className="mb-0 mt-3 font-bold text-bad">
          {error}
        </p>
      )}

      {added !== null && (
        <p role="status" className="mb-0 mt-3 font-bold text-ok">
          {added === 0 ? 'Nothing was added.' : `Added ${added} kind${added > 1 ? 's' : ''} of part to your kit.`} Adjust
          anything below.
        </p>
      )}

      {result && (
        <div className="mt-4" aria-live="polite">
          <h4 className="m-0 text-lg font-extrabold">Here is what we think we see</h4>
          <p className="mb-2 mt-1 text-[15px] text-muted">
            Tick the ones that are right and fix any count. Resistor values are read from colour bands, so check each one
            against your parts.
          </p>

          {result.parts.length === 0 ? (
            <p className="m-0 font-bold">We could not pick out any parts we know. Try a clearer photo, or pick by hand.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {result.parts.map((p) => {
                const item = ITEMS_BY_ID[p.id];
                const pick = picks[p.id] ?? { checked: false, qty: p.qty };
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-2.5">
                    <label className="flex min-w-0 flex-1 items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={pick.checked}
                        onChange={(e) => setPicks((s) => ({ ...s, [p.id]: { ...pick, checked: e.target.checked } }))}
                        className="mt-1 h-5 w-5"
                      />
                      <span>
                        <span className="font-bold">{item?.name ?? p.id}</span>{' '}
                        <span className="text-[13px] font-bold uppercase tracking-wide text-muted">{CONFIDENCE[p.confidence]}</span>
                        <span className="block text-[15px] text-muted">{p.evidence}</span>
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Fewer ${item?.name ?? p.id}`}
                        className={BTN}
                        disabled={pick.qty <= 1}
                        onClick={() => setPicks((s) => ({ ...s, [p.id]: { ...pick, qty: pick.qty - 1 } }))}
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold tabular-nums">{pick.qty}</span>
                      <button
                        type="button"
                        aria-label={`More ${item?.name ?? p.id}`}
                        className={BTN}
                        onClick={() => setPicks((s) => ({ ...s, [p.id]: { ...pick, qty: Math.min(pick.qty + 1, 50) } }))}
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {result.unrecognised.length > 0 && (
            <p className="mb-0 mt-3 text-[15px]">
              <span className="font-bold">Seen but not in our list yet: </span>
              {result.unrecognised.join(', ')}
            </p>
          )}
          {result.notes && <p className="mb-0 mt-3 text-[15px] text-muted">{result.notes}</p>}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={confirm}
              disabled={checkedCount === 0}
              className="rounded-[10px] bg-accent px-4 py-2.5 font-bold text-on-accent hover:brightness-105 disabled:opacity-50"
            >
              Add {checkedCount} to my kit
            </button>
            <button type="button" onClick={discard} className={SECONDARY}>
              Discard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
