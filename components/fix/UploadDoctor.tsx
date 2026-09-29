'use client';

import { useMemo, useState } from 'react';
import { useHydrated } from '@/lib/progress/useHydrated';
import { diagnose, hex4, type UploadSignature, type UsbInfo } from '@/lib/fix/upload-doctor';
import { UPLOAD_SIGNATURES, USB_DEVICES, GENERIC_UPLOAD_CHECKLIST } from '@/content/fix/upload-signatures';

/** Web Serial is not in TypeScript's DOM types, so name only what we use. */
interface SerialPortLike {
  getInfo(): { usbVendorId?: number; usbProductId?: number };
}
interface SerialLike {
  requestPort(): Promise<SerialPortLike>;
}

function getSerial(): SerialLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as unknown as { serial?: SerialLike }).serial;
}

const SAMPLE = 'avrdude: stk500_recv(): programmer is not responding\navrdude: stk500_getsync() attempt 1 of 10: not in sync: resp=0x00';

function Steps({ sig }: { sig: UploadSignature }) {
  return (
    <ol className="m-0 mt-2 list-decimal space-y-2 pl-5">
      {sig.steps.map((s, i) => (
        <li key={i}>
          {s.text}
          {s.physical && (
            <span className="ml-2 rounded-full bg-panel px-2 py-0.5 text-[12px] font-bold text-muted shadow-[inset_0_0_0_1px_var(--line-strong)]">
              by hand
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function MatchCard({ sig, primary }: { sig: UploadSignature; primary: boolean }) {
  return (
    <article
      className={`rounded-xl bg-panel p-5 ${primary ? 'shadow-[inset_0_0_0_2px_var(--accent)]' : 'shadow-[inset_0_0_0_1px_var(--line)]'}`}
    >
      <p className="m-0 text-[13px] font-bold uppercase tracking-wide text-muted">
        {primary ? 'Most likely' : 'Also in your log'}
      </p>
      <h3 className="mb-1 mt-1 text-xl font-extrabold">{sig.title}</h3>
      <p className="m-0 text-muted">{sig.meaning}</p>
      <h4 className="mb-0 mt-4 font-bold">Likely causes, most likely first</h4>
      <ul className="m-0 mt-1 list-disc space-y-1 pl-5 text-muted">
        {sig.causes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <h4 className="mb-0 mt-4 font-bold">Try this, in order</h4>
      <Steps sig={sig} />
    </article>
  );
}

export function UploadDoctor() {
  const [log, setLog] = useState('');
  const [usb, setUsb] = useState<UsbInfo | null>(null);
  const [usbNote, setUsbNote] = useState<string | null>(null);
  const hydrated = useHydrated();
  // Web Serial is only knowable in the browser; render the neutral state until hydrated.
  const serial = hydrated ? getSerial() : undefined;

  const result = useMemo(
    () => diagnose(log, UPLOAD_SIGNATURES, USB_DEVICES, usb ?? undefined),
    [log, usb],
  );

  async function detect() {
    setUsbNote(null);
    try {
      const port = await getSerial()!.requestPort();
      const info = port.getInfo();
      if (info.usbVendorId === undefined || info.usbProductId === undefined) {
        setUsb(null);
        setUsbNote('That port did not report a USB ID (it may be Bluetooth or a built-in port).');
        return;
      }
      setUsb({ vendorId: info.usbVendorId, productId: info.usbProductId });
    } catch {
      // Closing the picker without choosing a port rejects; that is not an error.
      setUsbNote('No port was chosen.');
    }
  }

  const hasLog = log.trim().length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <label htmlFor="upload-log" className="mb-1.5 block font-bold">
          Paste the red error text from the Arduino IDE output
        </label>
        <textarea
          id="upload-log"
          value={log}
          onChange={(e) => setLog(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="avrdude: stk500_getsync() attempt 1 of 10: not in sync ..."
          className="w-full rounded-xl bg-panel p-3 font-mono text-[14px] text-ink shadow-[inset_0_0_0_1.5px_var(--line-strong)]"
        />
        <div className="mt-3 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setLog(SAMPLE)}
            className="rounded-[10px] px-4 py-2.5 font-bold shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:bg-panel"
          >
            Try an example
          </button>
          {hasLog && (
            <button
              type="button"
              onClick={() => setLog('')}
              className="rounded-[10px] px-4 py-2.5 font-bold text-muted hover:bg-panel"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-panel p-4 shadow-[inset_0_0_0_1px_var(--line)]">
          <h3 className="m-0 font-bold">No error text? Detect your board</h3>
          <p className="mb-3 mt-1 text-[15px] text-muted">
            Plug the board in and pick its port. We read only the USB chip ID to tell you which
            driver and settings it needs. Nothing is uploaded or sent anywhere.
          </p>
          {!hydrated ? null : serial ? (
            <button
              type="button"
              onClick={detect}
              className="rounded-[10px] bg-accent px-4 py-2.5 font-bold text-on-accent hover:brightness-105"
            >
              Detect my board
            </button>
          ) : (
            <p className="m-0 text-[15px] text-muted">
              Board detection needs Chrome or Edge on a computer. Paste the error text instead.
            </p>
          )}
          {usbNote && <p className="mb-0 mt-3 text-[15px] text-muted">{usbNote}</p>}
        </div>
      </div>

      <div aria-live="polite" className="space-y-5">
        {result.usb && (
          <article className="rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="m-0 text-[13px] font-bold uppercase tracking-wide text-muted">Your board</p>
            <h3 className="mb-1 mt-1 text-xl font-extrabold">
              USB chip: {result.usb.chip}{' '}
              <span className="font-mono text-[14px] font-normal text-muted">
                {hex4(result.usb.vid)}:{hex4(result.usb.pid)}
              </span>
            </h3>
            <p className="m-0 text-muted">Usually found on {result.usb.usuallyOn}.</p>
            <ul className="m-0 mt-3 list-disc space-y-1 pl-5">
              {result.usb.hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </article>
        )}
        {result.unknownUsb && (
          <article className="rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <h3 className="m-0 text-xl font-extrabold">
              Unrecognised USB chip{' '}
              <span className="font-mono text-[14px] font-normal text-muted">
                {hex4(result.unknownUsb.vendorId)}:{hex4(result.unknownUsb.productId)}
              </span>
            </h3>
            <p className="mb-0 mt-1 text-muted">
              We do not have this adapter in our list yet. Search for that ID with the word
              &quot;driver&quot; to find what it needs.
            </p>
          </article>
        )}

        {result.matches.map((m, i) => (
          <MatchCard key={m.id} sig={m} primary={i === 0} />
        ))}

        {hasLog && result.matches.length === 0 && (
          <article className="rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <h3 className="m-0 text-xl font-extrabold">We do not recognise this error yet</h3>
            <p className="mb-0 mt-1 text-muted">
              These checks fix most failed uploads, so start here:
            </p>
            <ol className="m-0 mt-2 list-decimal space-y-2 pl-5">
              {GENERIC_UPLOAD_CHECKLIST.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
          </article>
        )}

        {!hasLog && !result.usb && !result.unknownUsb && (
          <p className="m-0 text-muted">
            Your diagnosis shows up here. Try the example to see how it reads.
          </p>
        )}
      </div>
    </div>
  );
}
