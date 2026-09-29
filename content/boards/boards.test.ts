import { describe, it, expect } from 'vitest';
import { BOARDS } from './index';
import { uno, nano } from './avr';
import { esp32DevkitV1 as esp } from './esp32';
import { boardSpecSchema } from '@/lib/boards/types';
import { expectedWiring } from '@/lib/sketch/wiring';
import { PROJECTS_BY_ID } from '@/content/projects';
import { PARTS } from '@/content/parts';

const pinsWhere = (b: typeof uno, pred: (s: (typeof uno)['pins'][string]) => boolean) =>
  Object.entries(b.pins)
    .filter(([, s]) => pred(s))
    .map(([n]) => Number(n))
    .sort((a, b) => a - b);

describe('board data', () => {
  it('has unique ids', () => {
    expect(new Set(BOARDS.map((b) => b.id)).size).toBe(BOARDS.length);
  });

  for (const b of BOARDS) {
    it(`${b.id} passes the schema`, () => {
      expect(boardSpecSchema.safeParse(b).success).toBe(true);
    });
    it(`${b.id} aliases and LED pin point at real pins`, () => {
      for (const [name, n] of Object.entries(b.aliases)) expect(b.pins[String(n)], name).toBeDefined();
      expect(b.pins[String(b.builtinLedPin)]).toBeDefined();
    });
  }
});

describe('Uno and Nano (ATmega328P)', () => {
  it('has PWM on exactly 3, 5, 6, 9, 10, 11', () => {
    expect(pinsWhere(uno, (s) => !!s.pwm)).toEqual([3, 5, 6, 9, 10, 11]);
  });
  it('has attachInterrupt on exactly 2 and 3', () => {
    expect(pinsWhere(uno, (s) => s.interrupt)).toEqual([2, 3]);
  });
  it('shares pins 0 and 1 with USB serial', () => {
    expect(pinsWhere(uno, (s) => !!s.uart)).toEqual([0, 1]);
  });
  it('maps A0-A5 to 14-19', () => {
    expect(uno.aliases.A0).toBe(14);
    expect(uno.aliases.A5).toBe(19);
  });
  it('gives the Nano two extra analog-only pins', () => {
    expect(pinsWhere(nano, (s) => !s.digital)).toEqual([20, 21]);
    expect(pinsWhere(uno, (s) => !s.digital)).toEqual([]);
  });
});

describe('ESP32 DevKit V1', () => {
  it('has input-only pins 34, 35, 36, 39', () => {
    expect(pinsWhere(esp, (s) => s.digital && !s.output)).toEqual([34, 35, 36, 39]);
  });
  it('reserves the flash pins 6-11', () => {
    expect(pinsWhere(esp, (s) => !!s.reserved)).toEqual([6, 7, 8, 9, 10, 11]);
  });
  it('has the five strapping pins 0, 2, 5, 12, 15', () => {
    expect(pinsWhere(esp, (s) => !!s.strapping)).toEqual([0, 2, 5, 12, 15]);
  });
  it('splits ADC1 and ADC2 as in the datasheet', () => {
    expect(pinsWhere(esp, (s) => s.adc === 'adc1')).toEqual([32, 33, 34, 35, 36, 39]);
    expect(pinsWhere(esp, (s) => s.adc === 'adc2')).toEqual([0, 2, 4, 12, 13, 14, 15, 25, 26, 27]);
  });
  it('puts UART0 on GPIO1 and GPIO3', () => {
    expect(pinsWhere(esp, (s) => !!s.uart)).toEqual([1, 3]);
  });
});

describe('expectedWiring from a guide project', () => {
  it('finds that First Light drives its LED from pin 9', () => {
    const w = expectedWiring(PROJECTS_BY_ID['first-light'], PARTS);
    expect(w?.outputs.map((o) => o.pin)).toEqual([9]);
  });
  it('returns null for a project with no outputs', () => {
    expect(expectedWiring(PROJECTS_BY_ID['setup'], PARTS)).toBeNull();
  });
});
