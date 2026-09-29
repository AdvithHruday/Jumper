import type { LibraryItem } from '@/lib/library/types';
import type { Inventory } from '@/lib/library/match';

/**
 * Everything a library project can ask for. Prices are rough Indian retail
 * estimates for planning ("about ₹90"), not quotes. // VERIFY: check against a
 * current vendor before showing them as anything firmer than an estimate.
 */
export const ITEMS: LibraryItem[] = [
  { id: 'uno', name: 'Arduino Uno (or clone)', category: 'board', approxInr: 450 },
  { id: 'nano', name: 'Arduino Nano (or clone)', category: 'board', approxInr: 350 },
  { id: 'esp32-devkit-v1', name: 'ESP32 DevKit V1', category: 'board', approxInr: 450 },

  { id: 'breadboard', name: 'Breadboard', category: 'basics', approxInr: 80 },
  { id: 'jumper-wires', name: 'Jumper wires', category: 'basics', approxInr: 60 },
  { id: 'res-220', name: '220 Ω resistor', category: 'basics', approxInr: 1 },
  { id: 'res-330', name: '330 Ω resistor', category: 'basics', approxInr: 1 },
  { id: 'res-470', name: '470 Ω resistor', category: 'basics', approxInr: 1 },
  { id: 'res-1k', name: '1 kΩ resistor', category: 'basics', approxInr: 1 },
  { id: 'res-10k', name: '10 kΩ resistor', category: 'basics', approxInr: 1 },

  { id: 'led-5mm', name: '5 mm LED (any colour)', category: 'output', approxInr: 2 },
  { id: 'led-rgb-cc', name: 'RGB LED (common cathode)', category: 'output', approxInr: 10 },
  { id: 'buzzer-active', name: 'Active buzzer', category: 'output', approxInr: 20 },

  { id: 'push-button', name: 'Push button', category: 'input', approxInr: 5 },
  { id: 'potentiometer-10k', name: '10 kΩ potentiometer', category: 'input', approxInr: 25 },
  { id: 'ldr', name: 'LDR (light sensor)', category: 'input', approxInr: 10 },

  { id: 'hc-sr04', name: 'HC-SR04 ultrasonic sensor', category: 'sensor', approxInr: 90 },
  { id: 'dht11', name: 'DHT11 temperature and humidity module', category: 'sensor', approxInr: 120 },
  { id: 'pir-hc-sr501', name: 'HC-SR501 PIR motion sensor', category: 'sensor', approxInr: 90 },
  { id: 'ir-line-sensor', name: 'IR line sensor module', category: 'sensor', approxInr: 40 },
  { id: 'soil-moisture', name: 'Soil moisture sensor module', category: 'sensor', approxInr: 50 },

  { id: 'servo-sg90', name: 'SG90 micro servo', category: 'motion', approxInr: 150 },
  { id: 'l298n', name: 'L298N motor driver module', category: 'motion', approxInr: 150 },
  { id: 'dc-motor-gear', name: 'Geared DC motor (TT)', category: 'motion', approxInr: 60 },
  { id: 'robot-chassis', name: 'Two-wheel robot chassis', category: 'motion', approxInr: 350 },

  { id: 'lcd-i2c-16x2', name: '16x2 LCD with I2C backpack', category: 'display', approxInr: 250 },

  { id: 'battery-pack', name: 'Battery pack (4×AA holder)', category: 'power', approxInr: 40 },
];

export const ITEMS_BY_ID: Record<string, LibraryItem> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export interface KitPreset {
  id: string;
  name: string;
  note: string;
  items: Inventory;
}

const BASICS: Inventory = {
  breadboard: 1,
  'jumper-wires': 1,
  'led-5mm': 5,
  'res-220': 5,
  'res-1k': 3,
  'res-10k': 5,
};

/**
 * Typical contents only: starter kits differ a lot between sellers, so the
 * page says "edit this to match yours".
 */
export const KIT_PRESETS: KitPreset[] = [
  {
    id: 'uno-basic',
    name: 'Basic Uno starter kit',
    note: 'Board, breadboard, wires, LEDs, resistors, a button, a potentiometer, an LDR, a buzzer and an RGB LED.',
    items: {
      ...BASICS,
      uno: 1,
      'led-rgb-cc': 1,
      'push-button': 2,
      'potentiometer-10k': 1,
      ldr: 1,
      'buzzer-active': 1,
    },
  },
  {
    id: 'uno-big',
    name: 'Bigger Uno kit',
    note: 'The basic kit plus a servo, ultrasonic sensor, DHT11, I2C LCD, PIR and soil moisture sensor.',
    items: {
      ...BASICS,
      uno: 1,
      'led-rgb-cc': 1,
      'push-button': 4,
      'potentiometer-10k': 2,
      ldr: 2,
      'buzzer-active': 1,
      'servo-sg90': 1,
      'hc-sr04': 1,
      dht11: 1,
      'lcd-i2c-16x2': 1,
      'pir-hc-sr501': 1,
      'soil-moisture': 1,
    },
  },
  {
    id: 'esp32-basic',
    name: 'ESP32 starter',
    note: 'An ESP32 DevKit V1, breadboard, wires, LEDs and resistors.',
    items: { ...BASICS, 'esp32-devkit-v1': 1 },
  },
];
