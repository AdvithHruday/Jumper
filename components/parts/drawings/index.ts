import type { DrawingKey } from '@/lib/parts/types';
import { buzzer, ldr, led, potentiometer, pushButton, resistor, rgbLed } from './basics';
import { breadboard, esp32, jumperWires, nano, uno } from './boards';
import { dht11, hcsr04, irLine, lcd, pir, soil } from './modules';
import { batteryPack, chassis, dcMotor, l298n, servo } from './motion';
import type { DrawingSpec } from './types';

/** Every drawing, by key. A test requires a drawing for every key and every callout point. */
export const DRAWINGS: Record<DrawingKey, DrawingSpec> = {
  uno,
  nano,
  esp32,
  breadboard,
  'jumper-wires': jumperWires,
  resistor,
  led,
  'rgb-led': rgbLed,
  buzzer,
  'push-button': pushButton,
  potentiometer,
  ldr,
  'hc-sr04': hcsr04,
  dht11,
  pir,
  'ir-line': irLine,
  soil,
  servo,
  l298n,
  'dc-motor': dcMotor,
  chassis,
  lcd,
  'battery-pack': batteryPack,
};
