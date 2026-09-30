'use client';

import { useMemo, useState } from 'react';
import { Eraser, FlaskConical, Usb } from 'lucide-react';
import { useHydrated } from '@/lib/progress/useHydrated';
import { diagnose, hex4, type UploadSignature, type UsbInfo } from '@/lib/fix/upload-doctor';
import { UPLOAD_SIGNATURES, USB_DEVICES, GENERIC_UPLOAD_CHECKLIST } from '@/content/fix/upload-signatures';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Label, Textarea } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';

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
          {s.physical && <Badge className="ml-2">by hand</Badge>}
        </li>
      ))}
    </ol>
  );
}

function MatchCard({ sig, primary }: { sig: UploadSignature; primary: boolean }) {
  return (
    <Panel as="article" variant={primary ? 'highlight' : 'default'}>
      <p className="m-0 text-caption font-bold uppercase tracking-wide text-muted">
        {primary ? 'Most likely' : 'Also in your log'}
      </p>
      <h2 className="mb-1 mt-1 text-xl font-extrabold">{sig.title}</h2>
      <p className="m-0 text-muted">{sig.meaning}</p>
      <h3 className="mb-0 mt-4 font-body text-body font-bold">Likely causes, most likely first</h3>
      <ul className="m-0 mt-1 list-disc space-y-1 pl-5 text-muted">
        {sig.causes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <h3 className="mb-0 mt-4 font-body text-body font-bold">Try this, in order</h3>
      <Steps sig={sig} />
    </Panel>
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
        <Label htmlFor="upload-log">Paste the red error text from the Arduino IDE output</Label>
        <Textarea
          id="upload-log"
          mono
          value={log}
          onChange={(e) => setLog(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="avrdude: stk500_getsync() attempt 1 of 10: not in sync ..."
        />
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Button icon={FlaskConical} onClick={() => setLog(SAMPLE)}>
            Try an example
          </Button>
          {hasLog && (
            <Button variant="ghost" icon={Eraser} onClick={() => setLog('')}>
              Clear
            </Button>
          )}
        </div>

        <Panel variant="subtle" padding="sm" className="mt-6">
          <h2 className="m-0 font-body text-body font-bold">No error text? Detect your board</h2>
          <p className="mb-3 mt-1 text-small text-muted">
            Plug the board in and pick its port. We read only the USB chip ID to tell you which driver and settings it
            needs. Nothing is uploaded or sent anywhere.
          </p>
          {!hydrated ? null : serial ? (
            <Button variant="primary" icon={Usb} onClick={detect}>
              Detect my board
            </Button>
          ) : (
            <p className="m-0 text-small text-muted">
              Board detection needs Chrome or Edge on a computer. Paste the error text instead.
            </p>
          )}
          {usbNote && <p className="mb-0 mt-3 text-small text-muted">{usbNote}</p>}
        </Panel>
      </div>

      <div aria-live="polite" className="space-y-5">
        {result.usb && (
          <Panel as="article">
            <p className="m-0 text-caption font-bold uppercase tracking-wide text-muted">Your board</p>
            <h2 className="mb-1 mt-1 text-xl font-extrabold">
              USB chip: {result.usb.chip}{' '}
              <span className="font-mono text-small font-normal text-muted">
                {hex4(result.usb.vid)}:{hex4(result.usb.pid)}
              </span>
            </h2>
            <p className="m-0 text-muted">Usually found on {result.usb.usuallyOn}.</p>
            <ul className="m-0 mt-3 list-disc space-y-1 pl-5">
              {result.usb.hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Panel>
        )}
        {result.unknownUsb && (
          <Panel as="article">
            <h2 className="m-0 text-xl font-extrabold">
              Unrecognised USB chip{' '}
              <span className="font-mono text-small font-normal text-muted">
                {hex4(result.unknownUsb.vendorId)}:{hex4(result.unknownUsb.productId)}
              </span>
            </h2>
            <p className="mb-0 mt-1 text-muted">
              We do not have this adapter in our list yet. Search for that ID with the word &quot;driver&quot; to find
              what it needs.
            </p>
          </Panel>
        )}

        {result.matches.map((m, i) => (
          <MatchCard key={m.id} sig={m} primary={i === 0} />
        ))}

        {hasLog && result.matches.length === 0 && (
          <Panel as="article">
            <h2 className="m-0 text-xl font-extrabold">We do not recognise this error yet</h2>
            <p className="mb-0 mt-1 text-muted">These checks fix most failed uploads, so start here:</p>
            <ol className="m-0 mt-2 list-decimal space-y-2 pl-5">
              {GENERIC_UPLOAD_CHECKLIST.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
          </Panel>
        )}

        {!hasLog && !result.usb && !result.unknownUsb && (
          <Callout variant="info">Your diagnosis shows up here. Try the example to see how it reads.</Callout>
        )}
      </div>
    </div>
  );
}
