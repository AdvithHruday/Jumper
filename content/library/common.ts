import type { Requirement } from '@/lib/library/types';

/** The boards these AVR builds are written for; pin numbers are identical on both. */
export const AVR_BOARDS = ['uno', 'nano'];

export const AVR_BOARD: Requirement = { label: 'Arduino Uno or Nano', oneOf: ['uno', 'nano'], qty: 1 };
export const BREADBOARD: Requirement = { label: 'Breadboard', oneOf: ['breadboard'], qty: 1 };
export const WIRES: Requirement = { label: 'Jumper wires', oneOf: ['jumper-wires'], qty: 1 };

export const led = (qty = 1): Requirement => ({
  label: qty === 1 ? '5 mm LED' : `${qty} × 5 mm LED`,
  oneOf: ['led-5mm'],
  qty,
});

/** Any of these protects an LED at 5 V; 220 Ω is brightest, 1 kΩ is dim but safe. */
export const ledResistor = (qty = 1): Requirement => ({
  label: qty === 1 ? 'Resistor for the LED (220 Ω to 1 kΩ)' : `${qty} × resistor for the LEDs (220 Ω to 1 kΩ)`,
  oneOf: ['res-220', 'res-330', 'res-470', 'res-1k'],
  qty,
});

export const item = (id: string, label: string, qty = 1): Requirement => ({ label, oneOf: [id], qty });
