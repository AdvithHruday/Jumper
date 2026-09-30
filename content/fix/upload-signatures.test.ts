import { describe, it, expect } from 'vitest';
import { UPLOAD_SIGNATURES, USB_DEVICES } from './upload-signatures';
import { uploadSignatureSchema, diagnose } from '@/lib/fix/upload-diagnosis';

describe('upload signatures', () => {
  it('has unique ids', () => {
    const ids = UPLOAD_SIGNATURES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const sig of UPLOAD_SIGNATURES) {
    describe(sig.id, () => {
      it('passes the schema and its pattern compiles', () => {
        expect(uploadSignatureSchema.safeParse(sig).success).toBe(true);
        expect(() => new RegExp(sig.pattern, 'i')).not.toThrow();
      });

      sig.examples.forEach((example, i) => {
        it(`example ${i + 1} is diagnosed as this signature first`, () => {
          const result = diagnose(example, UPLOAD_SIGNATURES);
          expect(result.matches[0]?.id).toBe(sig.id);
        });
      });
    });
  }
});

describe('usb table', () => {
  it('has no duplicate vendor:product pairs', () => {
    const keys = USB_DEVICES.map((d) => `${d.vid}:${d.pid}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('gives every device at least one hint', () => {
    for (const d of USB_DEVICES) expect(d.hints.length).toBeGreaterThan(0);
  });
});
