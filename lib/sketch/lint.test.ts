import { describe, it, expect } from 'vitest';
import { lintSketch, type ExpectedWiring } from './lint';
import { uno, nano } from '@/content/boards/avr';
import { esp32DevkitV1 as esp } from '@/content/boards/esp32';
import type { BoardSpec } from '@/lib/boards/types';

const rules = (src: string, board: BoardSpec, wiring?: ExpectedWiring) =>
  lintSketch(src, board, { wiring }).map((f) => f.rule);

/** Wraps statements so every fixture is a complete, plausible sketch. */
const sketch = (body: string, setup = '') => `void setup() {\n${setup}\n}\nvoid loop() {\n${body}\n}`;

describe('clean sketches', () => {
  it('the classic blink on an Uno has no findings', () => {
    const src = `const int LED_PIN = 9;\nvoid setup(){ pinMode(LED_PIN, OUTPUT); }\nvoid loop(){ digitalWrite(LED_PIN, HIGH); delay(1000); digitalWrite(LED_PIN, LOW); delay(1000); }`;
    expect(lintSketch(src, uno)).toEqual([]);
  });

  it('a sensible ESP32 sketch has no findings', () => {
    const src = `void setup(){ pinMode(4, OUTPUT); pinMode(32, INPUT); }\nvoid loop(){ int v = analogRead(32); digitalWrite(4, v > 100); }`;
    expect(lintSketch(src, esp)).toEqual([]);
  });

  it('an empty sketch has no findings', () => {
    expect(lintSketch('', uno)).toEqual([]);
  });
});

describe('pin-not-on-board', () => {
  it('flags a pin the board does not have', () => {
    expect(rules(sketch('digitalWrite(20, HIGH);', ''), uno)).toContain('pin-not-on-board');
    expect(rules(sketch('digitalRead(40);'), esp)).toContain('pin-not-on-board');
  });
  it('accepts real pins', () => {
    expect(rules(sketch('digitalRead(13);', 'pinMode(13, INPUT);'), uno)).not.toContain('pin-not-on-board');
  });
  it('A6 exists on the Nano but not the Uno', () => {
    const src = 'void loop(){ analogRead(A6); }';
    expect(rules(src, uno)).toEqual([]); // A6 is not an alias on the Uno, so it stays unresolved
    expect(rules('void loop(){ analogRead(20); }', uno)).toContain('pin-not-on-board');
    expect(rules(src, nano)).toEqual([]);
  });
});

describe('pin-reserved', () => {
  it('flags ESP32 flash pins', () => {
    expect(rules(sketch('digitalWrite(6, 1);'), esp)).toContain('pin-reserved');
  });
  it('does not flag a free pin', () => {
    expect(rules(sketch('digitalWrite(13, 1);', 'pinMode(13, OUTPUT);'), esp)).not.toContain('pin-reserved');
  });
});

describe('analog-only-pin', () => {
  it('flags digitalWrite on Nano A6', () => {
    expect(rules(sketch('digitalWrite(A6, 1);'), nano)).toContain('analog-only-pin');
  });
  it('allows analogRead on Nano A6', () => {
    expect(rules(sketch('analogRead(A6);'), nano)).not.toContain('analog-only-pin');
  });
});

describe('input-only-pin', () => {
  it('flags an ESP32 input-only pin used as an output', () => {
    expect(rules(sketch('', 'pinMode(34, OUTPUT);'), esp)).toContain('input-only-pin');
    expect(rules(sketch('digitalWrite(35, 1);'), esp)).toContain('input-only-pin');
  });
  it('allows reading it', () => {
    expect(rules(sketch('digitalRead(34);', 'pinMode(34, INPUT);'), esp)).not.toContain('input-only-pin');
  });
});

describe('no-internal-pullup', () => {
  it('warns about INPUT_PULLUP on GPIO34', () => {
    expect(rules(sketch('', 'pinMode(34, INPUT_PULLUP);'), esp)).toContain('no-internal-pullup');
  });
  it('is fine on a pin that has one', () => {
    expect(rules(sketch('', 'pinMode(4, INPUT_PULLUP);'), esp)).not.toContain('no-internal-pullup');
  });
});

describe('analogwrite-not-pwm', () => {
  it('warns on a non-PWM Uno pin and names the PWM pins', () => {
    const f = lintSketch(sketch('analogWrite(4, 128);', 'pinMode(4, OUTPUT);'), uno);
    const hit = f.find((x) => x.rule === 'analogwrite-not-pwm');
    expect(hit?.message).toMatch(/3, 5, 6, 9, 10, 11/);
  });
  it('is fine on a PWM pin', () => {
    expect(rules(sketch('analogWrite(9, 128);', 'pinMode(9, OUTPUT);'), uno)).not.toContain('analogwrite-not-pwm');
  });
  it('does not apply to the ESP32', () => {
    expect(rules(sketch('analogWrite(4, 128);', 'pinMode(4, OUTPUT);'), esp)).not.toContain('analogwrite-not-pwm');
  });
});

describe('analogread-not-analog', () => {
  it('flags analogRead on a pin with no ADC', () => {
    expect(rules(sketch('analogRead(9);'), uno)).toContain('analogread-not-analog');
    expect(rules(sketch('analogRead(21);'), esp)).toContain('analogread-not-analog');
  });
  it('treats analogRead(0) as A0 on AVR', () => {
    expect(rules(sketch('analogRead(0);'), uno)).toEqual([]);
    expect(rules(sketch('analogRead(A0);'), uno)).toEqual([]);
  });
});

describe('adc2-with-wifi', () => {
  const wifi = '#include <WiFi.h>\n';
  it('flags an ADC2 pin read while WiFi is used', () => {
    expect(rules(wifi + sketch('analogRead(4);'), esp)).toContain('adc2-with-wifi');
  });
  it('allows an ADC1 pin with WiFi', () => {
    expect(rules(wifi + sketch('analogRead(32);'), esp)).not.toContain('adc2-with-wifi');
  });
  it('allows an ADC2 pin without WiFi', () => {
    expect(rules(sketch('analogRead(4);'), esp)).not.toContain('adc2-with-wifi');
  });
});

describe('interrupt-pin', () => {
  it('flags attachInterrupt on a non-interrupt Uno pin', () => {
    expect(rules(sketch('', 'attachInterrupt(digitalPinToInterrupt(5), f, RISING);'), uno)).toContain('interrupt-pin');
  });
  it('allows pin 2 and 3', () => {
    expect(rules(sketch('', 'attachInterrupt(digitalPinToInterrupt(2), f, RISING);'), uno)).not.toContain('interrupt-pin');
  });
});

describe('strapping-pin', () => {
  it('warns about GPIO12 and GPIO0', () => {
    const f = lintSketch(sketch('digitalWrite(12, 1);', 'pinMode(12, OUTPUT); pinMode(0, INPUT);'), esp);
    expect(f.filter((x) => x.rule === 'strapping-pin').map((x) => x.severity)).toEqual(['warning', 'warning']);
  });
  it('only notes GPIO2, which drives the on-board LED', () => {
    const f = lintSketch(sketch('digitalWrite(2, 1);', 'pinMode(2, OUTPUT);'), esp);
    expect(f.find((x) => x.rule === 'strapping-pin')?.severity).toBe('info');
  });
  it('reports each pin once', () => {
    const f = lintSketch(sketch('digitalWrite(12, 1); digitalWrite(12, 0);', 'pinMode(12, OUTPUT);'), esp);
    expect(f.filter((x) => x.rule === 'strapping-pin')).toHaveLength(1);
  });
});

describe('uart-pin-in-use', () => {
  it('is an error when Serial is also used, with a link to the Upload Doctor', () => {
    const f = lintSketch(sketch('digitalWrite(1, 1);', 'Serial.begin(9600); pinMode(1, OUTPUT);'), uno);
    const hit = f.find((x) => x.rule === 'uart-pin-in-use');
    expect(hit?.severity).toBe('error');
    expect(hit?.link?.href).toBe('/fix/upload');
  });
  it('is a warning without Serial', () => {
    const f = lintSketch(sketch('digitalRead(0);'), uno);
    expect(f.find((x) => x.rule === 'uart-pin-in-use')?.severity).toBe('warning');
  });
  it('applies to ESP32 TX0 and RX0', () => {
    expect(rules(sketch('digitalRead(3);'), esp)).toContain('uart-pin-in-use');
  });
});

describe('missing-pinmode', () => {
  it('flags digitalWrite with no pinMode', () => {
    expect(rules(sketch('digitalWrite(9, HIGH);'), uno)).toContain('missing-pinmode');
  });
  it('is satisfied by a pinMode on the same pin', () => {
    expect(rules(sketch('digitalWrite(9, HIGH);', 'pinMode(9, OUTPUT);'), uno)).not.toContain('missing-pinmode');
  });
  it('stays quiet when pins are set in a loop', () => {
    const src = 'void setup(){ for (int i = 2; i < 6; i++) pinMode(i, OUTPUT); }\nvoid loop(){ digitalWrite(3, 1); }';
    expect(rules(src, uno)).not.toContain('missing-pinmode');
  });
});

describe('wiring mismatch', () => {
  const wiring: ExpectedWiring = { label: 'the "Light up an LED" circuit', outputs: [{ pin: 9, what: 'the Red LED "led1"' }] };
  const good = 'void setup(){ pinMode(9, OUTPUT); }\nvoid loop(){ digitalWrite(9, HIGH); }';

  it('is quiet when code and wiring agree', () => {
    expect(rules(good, uno, wiring)).toEqual([]);
  });
  it('errors when the sketch drives a different pin than the wiring', () => {
    const src = 'void setup(){ pinMode(10, OUTPUT); }\nvoid loop(){ digitalWrite(10, HIGH); }';
    const r = rules(src, uno, wiring);
    expect(r).toContain('wired-pin-not-driven');
    expect(r).toContain('driven-pin-not-wired');
  });
  it('lets a sketch use the built-in LED pin without a warning', () => {
    const src = `${good}\nvoid f(){ digitalWrite(LED_BUILTIN, 1); }`;
    expect(rules(src, uno, wiring)).not.toContain('driven-pin-not-wired');
  });
  it('stays quiet when a pin cannot be resolved', () => {
    const src = 'int p = 9;\nvoid loop(){ p++; digitalWrite(p, 1); }';
    expect(rules(src, uno, wiring)).not.toContain('wired-pin-not-driven');
  });
  it('does nothing without wiring', () => {
    expect(rules(good.replace('9', '10'), uno)).not.toContain('wired-pin-not-driven');
  });
});

describe('ordering', () => {
  it('lists errors before warnings', () => {
    const f = lintSketch(sketch('digitalWrite(20, 1); analogWrite(4, 1);', 'pinMode(4, OUTPUT);'), uno);
    const sev = f.map((x) => x.severity);
    expect(sev).toEqual([...sev].sort((a, b) => ['error', 'warning', 'info'].indexOf(a) - ['error', 'warning', 'info'].indexOf(b)));
  });
});

describe('messages', () => {
  it('start with a capital letter', () => {
    const f = lintSketch('void setup(){ Serial.begin(9600); pinMode(1, OUTPUT); }', uno, {
      wiring: { label: 'the "X" circuit', outputs: [{ pin: 9, what: 'an LED' }] },
    });
    expect(f.length).toBeGreaterThan(0);
    for (const x of f) expect(x.message[0]).toBe(x.message[0].toUpperCase());
  });
});
