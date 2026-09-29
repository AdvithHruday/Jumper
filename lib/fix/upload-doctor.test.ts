import { describe, it, expect } from 'vitest';
import { diagnose, hex4, type UploadSignature, type UsbDevice } from './upload-doctor';

const sig = (over: Partial<UploadSignature>): UploadSignature => ({
  id: 'a',
  title: 't',
  meaning: 'm',
  pattern: 'foo',
  priority: 10,
  family: 'any',
  causes: ['c'],
  steps: [{ text: 's' }],
  examples: ['foo'],
  ...over,
});

describe('diagnose', () => {
  it('returns nothing for an empty or whitespace log', () => {
    expect(diagnose('', [sig({})]).matches).toEqual([]);
    expect(diagnose('   \n ', [sig({})]).matches).toEqual([]);
  });

  it('returns nothing when no signature matches', () => {
    expect(diagnose('all good', [sig({})]).matches).toEqual([]);
  });

  it('matches case-insensitively', () => {
    expect(diagnose('FOO bar', [sig({})]).matches).toHaveLength(1);
  });

  it('ranks by priority, then id', () => {
    const list = [
      sig({ id: 'b', priority: 10 }),
      sig({ id: 'c', priority: 50 }),
      sig({ id: 'a', priority: 10 }),
    ];
    expect(diagnose('foo', list).matches.map((s) => s.id)).toEqual(['c', 'a', 'b']);
  });

  it('names a known USB adapter', () => {
    const table: UsbDevice[] = [
      { vid: 0x1a86, pid: 0x7523, chip: 'CH340', family: 'avr', usuallyOn: 'x', driverNeeded: true, hints: ['h'] },
    ];
    const r = diagnose('', [], table, { vendorId: 0x1a86, productId: 0x7523 });
    expect(r.usb?.chip).toBe('CH340');
    expect(r.unknownUsb).toBeUndefined();
  });

  it('reports an unknown USB adapter without guessing', () => {
    const r = diagnose('', [], [], { vendorId: 1, productId: 2 });
    expect(r.usb).toBeUndefined();
    expect(r.unknownUsb).toEqual({ vendorId: 1, productId: 2 });
  });
});

describe('hex4', () => {
  it('pads and upper-cases', () => {
    expect(hex4(0x1a86)).toBe('1A86');
    expect(hex4(0x43)).toBe('0043');
  });
});
