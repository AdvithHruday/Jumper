import { describe, it, expect } from 'vitest';
import { contrast, luminance } from './contrast';

describe('contrast', () => {
  it('black on white is 21:1, and it is symmetric', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 5);
  });

  it('identical colours are 1:1', () => {
    expect(contrast('#22774b', '#22774b')).toBeCloseTo(1, 5);
  });

  it('matches a known mid-grey value', () => {
    // #777777 on white is the classic 4.48:1 (just under AA).
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('white has luminance 1 and black 0', () => {
    expect(luminance('#ffffff')).toBeCloseTo(1, 5);
    expect(luminance('#000000')).toBe(0);
  });

  it('rejects anything that is not #rrggbb', () => {
    expect(() => luminance('red')).toThrow();
    expect(() => luminance('#fff')).toThrow();
  });
});
