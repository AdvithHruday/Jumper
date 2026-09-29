import { describe, it, expect } from 'vitest';
import { parseSketch, stripCode } from './parse';

const A = { LED_BUILTIN: 13, A0: 14, A1: 15 };
const pins = (src: string) => parseSketch(src, A).calls.map((c) => [c.fn, c.pin, c.line]);

describe('stripCode', () => {
  it('blanks comments and strings but keeps line numbers', () => {
    const src = 'a // x\n/* b\nc */ d "e\\"f" g';
    const out = stripCode(src);
    expect(out.split('\n')).toHaveLength(3);
    expect(out).not.toMatch(/[xbcef]/);
    expect(out).toMatch(/a/);
    expect(out).toMatch(/d/);
    expect(out).toMatch(/g/);
  });
});

describe('parseSketch pin resolution', () => {
  it('reads literal pins and line numbers', () => {
    expect(pins('void setup() {\n  pinMode(9, OUTPUT);\n  digitalWrite(0x0D, HIGH);\n}')).toEqual([
      ['pinMode', 9, 2],
      ['digitalWrite', 13, 3],
    ]);
  });

  it('resolves const, #define and chained names', () => {
    const src = `#define LED 5\nconst int BASE = 7;\nint p = BASE;\nvoid f(){ digitalWrite(LED,1); digitalWrite(p,1); }`;
    expect(pins(src).map((c) => c[1])).toEqual([5, 7]);
  });

  it('resolves board aliases such as LED_BUILTIN and A0', () => {
    expect(pins('digitalWrite(LED_BUILTIN,1); analogRead(A0);').map((c) => c[1])).toEqual([13, 14]);
  });

  it('ignores calls inside comments and strings', () => {
    expect(pins('// digitalWrite(3,1);\n/* pinMode(4,OUTPUT); */\nSerial.println("digitalWrite(5,1)");')).toEqual([]);
  });

  it('leaves a reassigned variable unresolved', () => {
    const src = 'int p = 3;\nvoid loop(){ p = 4; digitalWrite(p, 1); }';
    expect(parseSketch(src, A).calls[0].pin).toBeNull();
  });

  it('leaves a loop counter unresolved', () => {
    const src = 'void setup(){ for (int i = 2; i < 6; i++) pinMode(i, OUTPUT); }';
    const info = parseSketch(src, A);
    expect(info.calls[0].pin).toBeNull();
    expect(info.hasUnresolvedPinMode).toBe(true);
  });

  it('leaves arithmetic on a pin unresolved', () => {
    expect(parseSketch('const int B = 2;\ndigitalWrite(B + 1, 1);', A).calls[0].pin).toBeNull();
  });

  it('handles casts and GPIO_NUM_ names', () => {
    expect(pins('digitalWrite((int)5,1); digitalWrite(GPIO_NUM_4,1);').map((c) => c[1])).toEqual([5, 4]);
  });

  it('reads the mode of pinMode', () => {
    expect(parseSketch('pinMode(2, INPUT_PULLUP);', A).calls[0].mode).toBe('INPUT_PULLUP');
  });

  it('reads the pin inside digitalPinToInterrupt and skips bare interrupt numbers', () => {
    const info = parseSketch(
      'attachInterrupt(digitalPinToInterrupt(3), isr, RISING);\nattachInterrupt(0, isr, RISING);',
      A,
    );
    expect(info.calls.map((c) => c.pin)).toEqual([3, null]);
  });
});

describe('parseSketch features', () => {
  it('detects Serial and WiFi use', () => {
    const info = parseSketch('#include <WiFi.h>\nvoid setup(){ Serial.begin(9600); }', A);
    expect(info.usesSerial).toBe(true);
    expect(info.usesWifi).toBe(true);
  });

  it('does not treat words in comments as features', () => {
    const info = parseSketch('// Serial.begin(9600)\n// #include <WiFi.h>\nvoid setup(){}', A);
    expect(info.usesSerial).toBe(false);
    expect(info.usesWifi).toBe(false);
  });
});
