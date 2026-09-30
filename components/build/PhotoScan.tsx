'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, ScanSearch, X } from 'lucide-react';
import { ITEMS_BY_ID } from '@/content/library';
import { compressImage, UnsupportedImageError } from '@/lib/scan/image';
import { MAX_PHOTOS, type Confidence, type ScanResponse } from '@/lib/scan/types';
import { useKit } from '@/lib/library/store';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Checkbox } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Stepper } from '@/components/ui/Stepper';

interface Photo {
  key: string;
  file: File;
  url: string;
}

interface Pick {
  checked: boolean;
  qty: number;
}

const CONFIDENCE: Record<Confidence, { label: string; tone: BadgeTone }> = {
  high: { label: 'Sure', tone: 'ok' },
  medium: { label: 'Check this', tone: 'warn' },
  low: { label: 'Not sure', tone: 'neutral' },
};

const isResistor = (id: string) => id.startsWith('res-');

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
      setError(
        e instanceof UnsupportedImageError
          ? e.message
          : 'Could not reach the scanner. Check your connection, or pick your parts by hand.',
      );
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

  const checkedCount = result ? result.parts.filter((p) => picks[p.id]?.checked).length : 0;

  return (
    <Panel as="section" aria-labelledby="scan-heading" className="mb-8">
      <h2 id="scan-heading" className="m-0 text-xl font-extrabold">
        Scan your parts
      </h2>
      <p className="mb-0 mt-1 text-small text-muted">
        Lay your parts out on a table in good light and take up to {MAX_PHOTOS} photos. We suggest what we can see, and
        you confirm before anything is added to your kit.
      </p>

      {!result && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <label
              className={`${buttonClasses({ variant: 'secondary' })} cursor-pointer has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-link`}
            >
              <ImagePlus aria-hidden size={18} />
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
              <Button variant="primary" icon={ScanSearch} loading={busy} onClick={scan}>
                {busy ? 'Reading your photos…' : `Scan ${photos.length} photo${photos.length > 1 ? 's' : ''}`}
              </Button>
            )}
          </div>

          {photos.length > 0 && (
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
              {photos.map((p, i) => (
                <li key={p.key} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Photo ${i + 1} of your parts`} className="h-20 w-20 rounded-control object-cover" />
                  {!busy && (
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => remove(p.key)}
                      className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-bg shadow-[0_0_0_2px_var(--panel)]"
                    >
                      <X aria-hidden size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="mb-0 mt-3 text-caption text-muted">
            When you tap Scan, your photos are sent to Claude (by Anthropic) to identify the parts. Ohmwise does not store
            them, and location data is removed before they leave your device.
          </p>
        </>
      )}

      {error && (
        <Callout variant="error" role="alert" className="mt-3">
          {error}
        </Callout>
      )}

      {added !== null && (
        <Callout variant="success" role="status" className="mt-3">
          {added === 0 ? 'Nothing was added.' : `Added ${added} kind${added > 1 ? 's' : ''} of part to your kit.`} Adjust
          anything below.
        </Callout>
      )}

      {result && (
        <div className="mt-4" aria-live="polite">
          <h3 className="m-0 font-body text-lg font-bold">Here is what we think we see</h3>
          <p className="mb-2 mt-1 text-small text-muted">
            Tick the ones that are right and fix any count. Resistor values are read from colour bands, so check each one
            against your parts.
          </p>

          {result.parts.length === 0 ? (
            <p className="m-0 font-bold">We could not pick out any parts we know. Try a clearer photo, or pick by hand.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {result.parts.map((p) => {
                const item = ITEMS_BY_ID[p.id];
                const name = item?.name ?? p.id;
                const pick = picks[p.id] ?? { checked: false, qty: p.qty };
                const conf = CONFIDENCE[p.confidence];
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-2.5">
                    <label className="flex min-w-0 flex-1 items-start gap-2.5">
                      <Checkbox
                        checked={pick.checked}
                        onChange={(e) => setPicks((s) => ({ ...s, [p.id]: { ...pick, checked: e.target.checked } }))}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-bold">{name}</span> <Badge tone={conf.tone}>{conf.label}</Badge>
                        <span className="block text-small text-muted">{p.evidence}</span>
                      </span>
                    </label>
                    <Stepper
                      value={pick.qty}
                      min={1}
                      max={50}
                      label={name}
                      onChange={(n) => setPicks((s) => ({ ...s, [p.id]: { ...pick, qty: n } }))}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {result.unrecognised.length > 0 && (
            <p className="mb-0 mt-3 text-small">
              <span className="font-bold">Seen but not in our list yet: </span>
              {result.unrecognised.join(', ')}
            </p>
          )}
          {result.notes && <p className="mb-0 mt-3 text-small text-muted">{result.notes}</p>}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="primary" onClick={confirm} disabled={checkedCount === 0}>
              Add {checkedCount} to my kit
            </Button>
            <Button onClick={() => setResult(null)}>Discard</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
