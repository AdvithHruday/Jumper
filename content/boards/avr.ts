import type { BoardSpec, PinSpec } from '@/lib/boards/types';

/**
 * Arduino Uno R3 and Nano (both ATmega328P).
 *
 * Sources: ATmega328P datasheet; Arduino Uno R3 and Nano documentation
 * (docs.arduino.cc). PWM on 3, 5, 6, 9, 10, 11 and external interrupts on 2
 * and 3 are from the Uno R3 documentation; the Nano matches.
 */

const PWM = new Set([3, 5, 6, 9, 10, 11]);
const INTERRUPT = new Set([2, 3]);

function digitalPin(n: number): PinSpec {
  const spec: PinSpec = {
    digital: true,
    output: true,
    pwm: PWM.has(n),
    interrupt: INTERRUPT.has(n),
  };
  if (n >= 14) spec.adc = 'adc'; // A0..A5 (and A6/A7 handled below)
  if (n === 0) spec.uart = 'D0 is the RX line of the USB serial connection';
  if (n === 1) spec.uart = 'D1 is the TX line of the USB serial connection';
  return spec;
}

const unoPins: Record<string, PinSpec> = {};
for (let n = 0; n <= 19; n++) unoPins[String(n)] = digitalPin(n);

const unoAliases: Record<string, number> = { LED_BUILTIN: 13 };
for (let i = 0; i <= 5; i++) unoAliases[`A${i}`] = 14 + i;

export const uno: BoardSpec = {
  id: 'uno',
  name: 'Arduino Uno',
  family: 'avr',
  mcu: 'ATmega328P',
  logicVoltage: 5,
  pins: unoPins,
  pwmRestricted: true,
  aliases: unoAliases,
  builtinLedPin: 13,
  avrAnalog: { base: 14, count: 6 },
  source: 'ATmega328P datasheet; Arduino Uno R3 docs (docs.arduino.cc/hardware/uno-rev3)',
};

// The Nano adds A6 and A7 (pins 20 and 21). They are analog inputs only: no
// digitalRead, digitalWrite or pinMode.
const nanoPins: Record<string, PinSpec> = { ...unoPins };
for (const n of [20, 21]) {
  nanoPins[String(n)] = { digital: false, output: false, adc: 'adc', interrupt: false };
}

const nanoAliases: Record<string, number> = { ...unoAliases, A6: 20, A7: 21 };

export const nano: BoardSpec = {
  id: 'nano',
  name: 'Arduino Nano (and clones)',
  family: 'avr',
  mcu: 'ATmega328P',
  logicVoltage: 5,
  pins: nanoPins,
  pwmRestricted: true,
  aliases: nanoAliases,
  builtinLedPin: 13,
  avrAnalog: { base: 14, count: 8 },
  // VERIFY: A6 = 20 and A7 = 21 follow the standard Nano variant; clones using
  // other cores may number them differently.
  source: 'ATmega328P datasheet; Arduino Nano docs (docs.arduino.cc/hardware/nano)',
};
